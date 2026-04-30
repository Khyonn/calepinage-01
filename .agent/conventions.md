# Conventions agents — Calepinage

Ce fichier est le **contrat dur** que tout agent doit respecter avant d'écrire du code dans ce repo. Il complète `CLAUDE.md` (humains + agents) en explicitant les règles applicables aux agents.

## Architecture en couches — frontières strictes

| Couche | Dossier | Importe | N'importe **jamais** |
|---|---|---|---|
| **core** | `src/core/` | rien d'externe sauf types intra-core | `react`, `react-dom`, `react-redux`, `@reduxjs/toolkit`, `idb`, `@/store/`, `@/components/`, `@/persistence/`, `@/hooks/` |
| **persistence** | `src/persistence/` | `idb`, `@/core/types` (types domaine) | `react`, `react-dom`, `react-redux`, `@/store/`, `@/components/`, `@/hooks/`, DOM globals (`document`, `window`) |
| **store** | `src/store/` | `@reduxjs/toolkit`, `@/core/`, `@/persistence/` | `react`, `react-dom`, `react-redux`, `@/components/`, `@/hooks/`, DOM globals |
| **hooks** | `src/hooks/` | React, `react-redux`, `@/core/`, `@/store/` | `@/components/`, DOM globals **sauf** dans hooks d'intégration (drag, viewport) |
| **components** | `src/components/` | tout sauf `@/persistence/` (passer par store/thunks) | `idb` direct, accès DOM hors événements React, accès `localStorage`/`sessionStorage` direct |

**Règle absolue** : si une fonction touche au DOM (`document.*`, `window.*`, `localStorage`), elle est dans un hook ou un composant React, jamais dans `core/`, `persistence/` ou `store/`.

**Records `*Record`** : vivent dans `src/persistence/`, pas dans `src/store/types.ts`. Le store importe les records depuis persistence si nécessaire (rarement — l'hydratation IDB → store passe par un mapper en persistence).

## Taille fichiers

- **Hard limit 150 LOC** (hors blank lines, hors imports, hors commentaires d'en-tête).
- Si dépassement → split par responsabilité.
- Avant de créer une nouvelle abstraction, vérifier qu'elle est appelée ≥ 2× ailleurs.

## Libs autorisées

Runtime déjà présentes : `react`, `react-dom`, `@reduxjs/toolkit`, `react-redux`, `idb`, `lucide-react`.

Ajouts permis pendant la refonte :
- `@use-gesture/vanilla` — pan/zoom/drag/pinch unifiés (framework-agnostic).
- `redux-undo` — historique store, avec `groupBy` + `filter` pour limiter le bruit.

**Toute autre lib** : interdite sans validation explicite. Préférer une implémentation maison de < 100 LOC à une lib pour un besoin simple.

## Routing

Maison, History API, ~100 LOC. Pas de lib (`wouter`, `react-router`, etc.).

Routes : `/:projetId/:mode/:roomId?` + `/new`. Modes : `main`, `plan`, `draw`.

URL ↔ Redux : middleware custom dans `src/store/routerMiddleware.ts` qui écoute les actions de navigation et appelle `navigate(url)`. Hook `useRouteSync()` au mount de `App` qui écoute `popstate` et hydrate le store.

Fallbacks : projet introuvable → `/new`. Pièce introuvable → `/:projetId/main` (mode par défaut sans pièce active).

## TypeScript

- `strict: true` non négociable.
- **Aucun `any`**, aucun `as unknown as X`. Si narrowing complexe → unions discriminées + type guards.
- `import type { ... }` pour les imports purement types.
- Préférer `interface` pour les objets domaine, `type` pour les unions.

## CSS

- Uniquement via **custom properties** définies dans `src/index.css` ou modules CSS scoped.
- Pas de valeur hexadécimale en dur dans un `.module.css` (sauf l'index global).
- Pas de styles inline sauf calculs runtime (transform, position dynamique).

## Tests

### Philosophie

> Un test BDD exprime un **comportement utilisateur observable** sous la forme :
> **état initial du store → action ou thunk déclenché → données renvoyées par un sélecteur**.

Le composant React est une simple liaison clavier/souris/DOM ↔ store : si le store + le sélecteur sont corrects, le composant l'est. Changer de framework demain n'invalide aucun test.

Conséquences pratiques :

- Le **store est le sujet par défaut** des tests. Reducers, thunks, sélecteurs sont testés ensemble dans le même scénario, pas isolément.
- Le **mode actif**, le **catalogue**, les **pièces**, les **rangées** font partie de l'**état initial** (preloaded ou construit via dispatchs de setup). Pas d'arguments « magiques » à l'action testée.
- Le **drag**, le **clic d'un bouton**, l'**ouverture d'un panneau** sont des **actions ou des thunks** (`projectActions.updateSegmentOffset(...)`, `dragSegmentRelease({ rowId, segmentIndex, offsetCm })`). Pas de simulation DOM.
- L'**assertion** porte presque toujours sur la **valeur d'un sélecteur** (`selectSummaryRows(state)`, `selectRowViewModel(state, rowId)`), pas sur des champs internes du state.

### Hiérarchie

| Cas | Pattern |
|---|---|
| **Comportement utilisateur** (cas par défaut, ~90 % des tests) | `src/store/__tests__/*.feature` — voir `.agent/patterns/new-store-test.md` |
| Logique mathématique/géométrique pure réutilisée par plusieurs callers | `src/core/__tests__/*.feature` — voir `.agent/patterns/new-bdd-test.md` |
| Sérialisation, parsing d'URL, fonctions utilitaires | `src/core/__tests__/*.feature` (style core BDD) |
| Composant React | **Pas de test automatisé.** Documenter un test manuel dans la PR. |

> Ne tester en core que ce qui est **strictement pur** et **réutilisé** ailleurs (`computeRowYStart`, `parseUrl`, `clampYOffset`). Sinon couvrir le comportement via un test store qui appelle l'action consommatrice et observe via sélecteur.

### Règles dures

- Toujours `loadFeature(path, { language: 'fr' })`.
- **Pas de mock** de service, pas de stub de sélecteur, pas de simulation DOM.
- **Pas de JSDOM**, pas de `@testing-library/*`, pas de `render()` React.
- Une assertion par `Then`/`And`. Si plusieurs invariants → plusieurs `And`.
- Un thunk (drag, batch) est testé **comme une seule unité** : un seul `When`, le `Then` observe le résultat final via sélecteur.

## Composants React — couplage Redux

- **Limite molle** : 3 hooks Redux par composant (`useAppSelector` + `useAppDispatch` confondus). Au-delà → soupçon d'orchestrateur, refactorer en composant pur (props in / callbacks out) + parent qui orchestre.
- **Limite molle** : 8 props par composant. Au-delà → split par responsabilité.
- **Hard rule** : un composant ne lit jamais `@/persistence/` directement. Il passe par un hook ou un thunk.

## Composants — structure dossier

```
MonComposant/
├── index.tsx
├── MonComposant.module.css
└── useMonComposant.ts   (si logique propre)
```

Hook partagé entre plusieurs composants → `src/hooks/`.

## Drag / Pan / Zoom — pattern

Toujours « **preview pendant le drag, dispatch au release** » :

```ts
// pseudo
const [draft, setDraft] = useState(initial)
useGesture({
  onDrag: ({ first, last, ...gesture }) => {
    if (first) setDraft(initial)
    setDraft(computeNext(draft, gesture))   // local seulement
    if (last) dispatch(commitAction(draft)) // une seule fois
  }
})
```

Aucun dispatch Redux dans `onDrag` hors `last: true`. Sinon historique d'undo pollué.

## Forms — pattern

Trois cas selon le besoin :

1. **Commit au blur / Enter** (défaut) : state local `useState`, `dispatch` dans `onBlur` ou Enter. Cas standard pour `RoomEditPanel`, `PoseParamsForm`, `PlankTypeForm`.
2. **Live preview** (cas spécial UX) : state local + `dispatch` immédiat. Le composant doit **explicitement** être listé dans `redux-undo.groupBy` pour consolider les frappes en une entrée d'historique.
3. **Debounced** : éviter sauf besoin avéré (perf).

Le seul composant en mode 2 actuellement prévu : `YOffsetField` (raison : appui prolongé sur les flèches doit produire un retour visuel live).

## Undo / Redo

- `redux-undo` wrap `projectReducer` uniquement (pas `uiSlice`).
- Configuration : `limit: 50`, `filter` ignore les actions `ui/*` et `project/setRoomYOffset` consolidées via `groupBy`.
- Ctrl+Z / Ctrl+Y : handler global au niveau `App`, **mais** délègue au mode actif si un draft existe (mode draw : supprimer dernier point local au lieu d'appeler `redux-undo`).

## Persistance IDB

- Schéma typé via `DBSchema` de `idb`.
- Toute modification de schéma (champ ajouté/retiré/renommé) **par rapport à `main`** = migration obligatoire dans le bloc `upgrade`.
- En cours de dév sur branche : pas de migration, l'utilisateur clear son IDB local.
- Au merge `rewrite/v2` → `main` : migration unique `v3 → v4` couvrant **toutes** les modifs cumulées.

## Conventional commits

Préfixes : `feat`, `fix`, `docs`, `chore`, `refactor`, `test`. Format :

```
feat: step 16.X — <résumé court en français>

<description optionnelle>

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

## Commentaires de code

- Défaut : aucun commentaire.
- Exception : commentaire **WHY** uniquement (contrainte cachée, invariant subtil, workaround documenté). Jamais **WHAT**.
- Pas de référence à la session, à l'auteur, au numéro d'issue dans le code.

## Workflow session agent

1. Lire `.agent/specs/16.X-*.md` correspondant.
2. Lire les fichiers ciblés par la spec (uniquement ceux-là).
3. Implémenter en suivant les patterns `.agent/patterns/`.
4. Lancer `bun run test` + `bunx tsc -b` + `bun run build` avant tout commit.
5. Commit unique en fin de session (sauf si la spec autorise un découpage).
6. Push + ouvrir PR vers `rewrite/v2`.

Si la spec révèle une ambiguïté ou un cas non couvert : stopper, demander à l'utilisateur, ne pas improviser.
