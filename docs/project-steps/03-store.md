# Étape 03 — Store & persistance

**Statut : terminé**

## Périmètre

Mettre en place la couche store (Redux Toolkit, ZÉRO React) et le binding React minimal dans `hooks/`.

## Stack

| Package | Rôle |
| --- | --- |
| `@reduxjs/toolkit` | `configureStore`, `createSlice` (Immer), `createSelector` |
| `react-redux` | Binding React (`useSelector`, `useDispatch`) |
| `idb` | Wrapper IndexedDB typé (`DBSchema`, `openDB`) |

## Fichiers créés / modifiés

| Fichier | Contenu |
| --- | --- |
| `src/store/types.ts` | `AppState`, `ProjectState`, `UIState`, `isProjectAction` |
| `src/store/projectSlice.ts` | Slice RTK (Immer) — 18 reducers : projets, pièces, rangées, catalogue, pose params, plan de fond |
| `src/store/uiSlice.ts` | Slice RTK — 3 reducers : mode, pièce active, viewport |
| `src/store/selectors.ts` | Selectors mémoïsés via `createSelector` (RTK) pour les données dérivées |
| `src/store/idbMiddleware.ts` | Middleware fire-and-forget ciblant uniquement les actions `project/*` |
| `src/store/db.ts` | Wrapper `idb` : schéma typé `CalepinageDB`, `loadProject`, `saveProject`, `listProjects`, `deleteProject` — transaction atomique readwrite |
| `src/store/index.ts` | `createAppStore()` async — hydratation IDB → `preloadedState` → `configureStore` |

## Architecture du middleware IDB

Le middleware écoute chaque action dispatchée. Si l'action ne concerne pas le `projectSlice` (préfixe `project/`), elle est ignorée. Sinon, deux cas : si l'action est une suppression de projet, le projet est retiré de l'IDB ; dans tous les autres cas, le projet courant est sauvegardé. La persistance est fire-and-forget (aucune attente de la Promise).

**Séparation persistant / transient :**
- `projectSlice` → données persistantes (projets, pièces, rangées, catalogue, paramètres de pose, plan de fond)
- `uiSlice` → état transient non persisté (viewport, mode d'interaction, pièce active)

## Règles importantes

- `src/store/` : **ZÉRO import React** — slices et middleware sont des fonctions pures
- Toute modification du schéma IndexedDB **doit** s'accompagner d'une fonction de migration dans `db.ts` (voir CLAUDE.md)
- Le `Provider` React-Redux est configuré dans `main.tsx` après résolution de `createAppStore()`

## Ce qui a été réalisé

- `src/store/types.ts` : `AppState`, `ProjectState`, `UIState`, `isProjectAction` (vérifie `project/` prefix)
- `src/store/projectSlice.ts` : slice RTK avec Immer, 18 case reducers (projets, pièces, rangées, catalogue, pose params, plan de fond)
- `src/store/uiSlice.ts` : slice RTK, 3 case reducers (mode, pièce active, viewport)
- `src/store/selectors.ts` : selectors mémoïsés via `createSelector` de RTK (planks, summary, violations, offcut links)
- `src/store/idbMiddleware.ts` : middleware fire-and-forget, suppression explicite sur `project/delete`, sauvegarde sur toute autre action projet
- `src/store/db.ts` : wrapper `idb` avec schéma typé `CalepinageDB` (6 object stores), transaction atomique (getAllKeys → delete → put), migration versionnée
- `src/store/index.ts` : `createAppStore()` async, hydratation IDB via `preloadedState`, `configureStore` RTK sans thunk
- `vitest.config.ts` : coverage via provider Istanbul (V8 non supporté par Bun)

**Tests BDD (Gherkin) :**
- `tests/features/store-project.feature` : 5 scénarios métier (violation longueur minimale, suppression de rangée, écart de joint, réutilisation de chute, pas de réutilisation)
- `tests/features/user-journey.feature` : 1 scénario parcours utilisateur complet (créer → ajouter pièce → sélectionner → ajouter lame → ajouter rangée → modifier params → supprimer rangée → supprimer pièce → supprimer projet)
- Tous les assertions passent par les selectors (`selectViolations`, `selectSummary`, `selectOffcutLinks`, `selectAllPlanks`, `selectActiveRoom`…)
- 128 tests en tout, tous verts

## Références doc

- [architecture.md](../technical/architecture.md) — flux de données et séparation des responsabilités
- [data-model.md](../technical/data-model.md) — ce qui est stocké vs recalculé
