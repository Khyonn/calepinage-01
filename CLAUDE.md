# CLAUDE.md — Calepinage

## Démarrage de session

**Toujours commencer par lire [`docs/README.md`](docs/README.md)** avant toute action. Cette documentation est la **source de vérité** du projet : elle décrit l'application, ses fonctionnalités, les règles techniques et le glossaire.

Les sous-dossiers `docs/` ne doivent être chargés qu'à la demande, selon la tâche en cours :

| Dossier | Contenu |
| --- | --- |
| [`docs/features/`](docs/features/) | Spécifications détaillées de chaque fonctionnalité |
| [`docs/technical/`](docs/technical/) | Décisions d'architecture, ADR, choix techniques |
| [`docs/project-steps/`](docs/project-steps/) | État d'avancement du développement, étapes réalisées |
| [`docs/glossary.md`](docs/glossary.md) | Définitions des termes métier |
| [`docs/wireframe-iterations/`](docs/wireframe-iterations/) | Prototypes HTML des wireframes, par itération |

## Posture de collaboration

Remettre en question les choix de l'utilisateur est pertinent et attendu — ne pas systématiquement valider. Présenter les compromis honnêtement, signaler les risques ou alternatives si elles existent. L'utilisateur a le dernier mot.

## Gestion des tokens

- Si une tâche nécessite une réflexion estimée à **plus de 5 minutes** ou risque de consommer trop de tokens, **poser des questions d'affinage à l'utilisateur avant de se lancer**.
- Toujours **réserver du budget token pour la mise à jour de la documentation** en fin de session.
- Pour les tâches complexes, utiliser `TaskCreate` pour découper et suivre la progression.

## En cours de réalisation d'une étape

Après avoir implémenté une étape (ou une partie significative), **prendre du recul et vérifier** :
- Les règles et choix d'architecture définis dans la doc sont-ils toujours pertinents ?
- L'implémentation révèle-t-elle une contrainte ou un cas non anticipé ?
- Faut-il revoir le plan des étapes suivantes ?

Si une règle doit changer, **mettre à jour la doc avant de continuer** — ne pas laisser une divergence entre le code et la documentation.

Si une décision de conception révèle un besoin non anticipé (nouvelle règle métier, nouveau composant technique, révision d'architecture), **insérer une étape dédiée dans `docs/project-steps/`** plutôt que de l'absorber dans l'étape en cours. Renuméroter les étapes suivantes en conséquence et mettre à jour `docs/project-steps/README.md`.

## Commits

Ne jamais créer de commit sans validation explicite de l'utilisateur. Attendre que l'utilisateur confirme qu'une étape est terminée avant de committer quoi que ce soit.

## Avant chaque push (branche ≠ main)

Deux vérifications obligatoires avant de pousser une branche de développement :

**1. Documentation à jour**
Passer en revue ce que la branche apporte et s'assurer que la doc reflète les changements :
- Nouvelle fonctionnalité → fichier correspondant dans `docs/features/` créé ou mis à jour
- Décision technique → `docs/technical/` mis à jour
- Étape franchie → `docs/project-steps/` mis à jour

**2. Migration IndexedDB obligatoire si le schéma change (par rapport à `main`)**
Toute modification du schéma IndexedDB (ajout/suppression/renommage de champ sur `Project`, `Room`, `Row`, `PlankType`, `PoseParams`, ou `BackgroundPlan`) **doit être accompagnée d'une fonction de migration** dans la couche `src/store/db.ts` **uniquement si le schéma diverge de `main`**.

En cours de développement sur une branche, pas de migration nécessaire : si le schéma local a changé, supprimer les données IndexedDB du navigateur manuellement (DevTools → Application → IndexedDB → Clear).

Sans migration au moment du merge, les données existantes des utilisateurs deviennent illisibles au chargement. C'est un **bloquant** : ne pas merger sans migration.

## Fin de session

Avant de terminer, vérifier si la documentation doit être mise à jour :
- Nouvelles décisions techniques prises dans la session
- Fonctionnalités implémentées ou modifiées
- Étapes de développement avancées (mettre à jour `docs/project-steps/`)

## Conventions de commit

Suivre les [Conventional Commits](https://www.conventionalcommits.org/) :

| Prefix | Usage | Impact tag |
| --- | --- | --- |
| `feat:` | Nouvelle fonctionnalité | bump version **majeure** |
| `fix:` | Correction de bug | bump version **mineure** |
| `docs:` | Documentation uniquement | bump version **patch** |
| `chore:` | Maintenance, config, dépendances | bump version **patch** |
| `refactor:` | Refactorisation sans changement de comportement | bump version **patch** |
| `test:` | Ajout ou modification de tests | bump version **patch** |

## Architecture du code

Voir [`docs/README.md`](docs/README.md) — section 5 pour les contraintes techniques complètes.

Structure `src/` :

```
src/
├── core/        ← logique métier pure — ZÉRO React, ZÉRO DOM
├── store/       ← reducer, actions, état, IndexedDB — ZÉRO React
├── hooks/       ← binding React : useReducer + store, logique DOM
└── components/  ← rendu JSX uniquement, aucune logique métier
```

**Règles strictes :**
- Taille max par fichier : **~150 lignes** — extraire si dépassement
- TypeScript strict : **pas de `any`**, unions discriminées narrowées, `import type` pour les types purs
- CSS : uniquement via **custom properties** définies dans `index.css`, jamais de valeur hexadécimale en dur

## Tests

- **Tests unitaires** : `src/core/__tests__/*.test.ts` — logique métier pure
- **Tests fonctionnels BDD** : `tests/features/*.feature` + `tests/features/steps/*.steps.ts`
- Runner : **Vitest** + **`@amiceli/vitest-cucumber`** pour les scénarios BDD
- Commande : `bun run test`

### Workflow BDD

1. Écrire le fichier `.feature`
2. Générer la structure des steps via la CLI :
   ```
   bunx @amiceli/vitest-cucumber --feature tests/features/<name>.feature --spec tests/features/steps/<name>.steps.ts --lang fr
   ```
3. Implémenter les steps générés

### Gotcha : langue française

Toujours passer `{ language: 'fr' }` à `loadFeature` — la librairie ignore le commentaire `# language: fr` dans les fichiers `.feature` et défaut sur l'anglais. Sans cette option, `Contexte:` n'est pas reconnu et les tests crashent.

```ts
const feature = await loadFeature('tests/features/xxx.feature', { language: 'fr' })
```

## Stack technique

```
React 19 + TypeScript (strict) + Vite
State management : Redux Toolkit (@reduxjs/toolkit) + react-redux
  - createSlice (Immer) pour projectSlice et uiSlice
  - createSelector (inclus dans RTK, remplace reselect)
  - configureStore avec preloadedState (hydratation IDB avant création du store)
Persistance : IndexedDB via librairie idb (schéma typé DBSchema)
Package manager : Bun
Tests : Vitest + @amiceli/vitest-cucumber
  - Coverage : provider Istanbul (bun run test --coverage)
Déploiement : GitHub Pages via GitHub Actions
```
