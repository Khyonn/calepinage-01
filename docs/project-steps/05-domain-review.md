# Étape 05 — Révision domaine & store

**Statut : terminée**

## Périmètre

Réviser le domaine et le store à la lumière des décisions UI prises à l'étape 04 (wireframes) et de la réflexion menée en session. Cette étape est à la fois une mise à jour des specs et une implémentation des changements de fond avant d'attaquer le canvas.

---

## Décisions prises (phase réflexion)

### Modèle Row — segments par rangée

`Row` passe d'un `xOffset` unique à un tableau de segments :

```ts
interface Row {
  id: string
  roomId: string
  plankTypeId: string
  segments: { xOffset: number }[]  // un par segment, indexé
}
```

- La **géométrie** des segments (bornes X) est calculée à la volée via intersection bande/polygone, jamais persistée
- L'**offset X** est une donnée utilisateur → persistée dans `Row.segments[]`
- Le drag opère sur les **segments**, pas sur la rangée entière

### Algorithme d'intersection bande/polygone

Pour une rangée `[y1, y2]`, on parcourt chaque arête du polygone, on calcule les intersections avec `y1` et `y2`, on trie par X et on apparie (règle pair-impair) → liste de `[xStart, xEnd]`. C'est du scanline classique, pas d'algorithme maison.

Les pièces concaves (en L, en U…) produisent plusieurs segments par rangée — chacun est rempli indépendamment.

### Contrainte esthétique — signalement plutôt que blocage

- Les violations de contraintes (taille min, écart min) sont **signalées visuellement**, pas bloquées
- À l'ajout d'une rangée, le positionnement automatique essaie de respecter les contraintes, mais certaines configurations seront inévitablement en violation
- Un segment de la rangée N "touche" un segment de la rangée N−1 s'ils se chevauchent horizontalement → calcul des intervalles d'offsets interdits → optimisation indépendante par segment

### Mode `edit` (ex `rows`)

| Ancien id | Nouveau id | Label UI |
|-----------|-----------|----------|
| `rows` | `edit` | **Modifier** |

Comportement conditionnel selon l'état de la pièce active :
- Pièce **sans rangées** → édition des sommets
- Pièce **avec au moins une rangée** → gestion des rangées (ajout, drag d'offset)

### Architecture JSX du canvas

```
<Scene>            ← SVG racine, viewport (zoom/pan)
  <BackgroundPlan />  ← image de fond (rendu sous les pièces)
  <Room>           ← polygone de la pièce + ses rangées
    <Row>          ← une rangée
      <Segment>    ← un rectangle SVG
```

`<Segment>` récupère sa géométrie via un **selector mémoisé** (factory `createSelector` paramétrée par roomId/rowId/segmentIndex). Le calcul d'intersection vit dans `src/core/`, appelé depuis le selector.

### Pattern `addRow`

```ts
// src/core/ — fonction pure
addRow(room: Room, plankType: PlankType): Row
// retourne une Row avec segments[] initialisés (xOffset: 0), nombre de segments calculé

// store — thunk public (seul point d'entrée)
export const addRowThunk = () => (dispatch, getState) => {
  // lit activeRoomId + selectedPlankTypeId depuis le state
  const row = addRow(room, plankType)
  dispatch(addRowAction({ roomId, row }))  // action privée, non réexportée
}
```

Encapsulation portée par les **exports du module** (pas de convention `_`).

### Persistance dans son propre dossier

`src/store/db.ts` déplacé vers `src/persistence/` — c'est le schéma et l'accès IDB, sans lien avec Redux. `idbMiddleware.ts` reste dans `src/store/` (notion Redux). Le store n'a plus qu'à recevoir l'état hydraté, sans connaître IDB directement.

Flux d'init :
1. `localStorage` → dernier `projectId` ouvert
2. Charger + désérialiser depuis IDB
3. Injecter comme `preloadedState` dans le store

---

## Implémentation — liste des changements

### Types (`src/core/types.ts`)

- [x] `Row` : remplacer `xOffset: number` par `segments: { xOffset: number }[]`
- [x] `BackgroundPlan` : ajouter `x: number` et `y: number`
- [x] `InteractionMode` : renommer `'rows'` → `'edit'`

### `src/core/`

- [x] Ajouter `roundToTenth(value: number): number` — arrondi au 0,1 cm le plus proche, utilisé partout où une valeur numérique est produite ou saisie
- [x] Ajouter `intersectStripWithPolygon(vertices, y1, y2): [number, number][]` — retourne la liste de segments `[xStart, xEnd]`
- [x] Revoir `addRow(room, plankType): Row` — appelle `intersectStripWithPolygon`, initialise `segments[]` avec `xOffset: 0` pour chaque segment trouvé

### `src/store/projectSlice.ts`

- [x] `addRow` : refondre — recevoir `{ roomId, row: Row }` (objet complet) au lieu de `{ roomId, plankTypeId, xOffset }`
- [x] `updateRow` : remplacer par `updateSegmentOffset({ roomId, rowId, segmentIndex, xOffset })`
- [x] `updatePlankType` : ajouter garde — lock `length` et `width` si le type est référencé dans une rangée (via `selectUsedPlankTypeIds`)
- [x] `deletePlankType` : ajouter garde — sans effet si le type est référencé dans une rangée

### `src/store/uiSlice.ts`

- [x] Ajouter `setSelectedPlankTypeId(id: string | null)` — nécessaire pour le thunk `addRow`
- [x] Mettre à jour `InteractionMode` (renommage `rows` → `edit`)

### `src/store/selectors.ts`

- [x] Ajouter `selectUsedPlankTypeIds(state): Set<string>` — ensemble des `plankTypeId` référencés dans au moins une rangée

### Thunk

- [x] Créer `src/store/thunks.ts` (ou co-localiser dans le slice) — `addRowThunk`

### Persistance

- [x] Créer `src/persistence/` et y déplacer `db.ts`
- [x] Mettre à jour les imports dans le store

### Documentation

- [x] `docs/features/room-drawing.md` — lever la contrainte 90°, documenter snap axial
- [x] `docs/features/row-fill.md` — mettre à jour modèle Row/Segment, postulat strips horizontaux, algorithme d'intersection
- [x] `docs/features/background-plan.md` — ajouter section repositionnement (drag x/y en mode `plan`)
- [x] `docs/features/interaction-modes.md` — renommer mode `rows` → `edit`, documenter comportement conditionnel

---

## Références doc

- [ui-specifications.md](../features/ui-specifications.md)
- [interaction-modes.md](../features/interaction-modes.md)
- [project-management.md](../features/project-management.md)
- [row-fill.md](../features/row-fill.md)
