# Étape 03 — Store & persistance

**Statut : à faire** — dépend de l'étape 02

## Périmètre

Mettre en place la couche store (event sourcing pur, ZÉRO React) et le binding React minimal dans `hooks/`.

## Fichiers à créer

| Fichier | Contenu |
| --- | --- |
| `src/store/types.ts` | `AppState`, `AppAction` (union discriminée exhaustive de toutes les actions) |
| `src/store/projectReducer.ts` | Reducer pur gérant projets, pièces, rangées, catalogue, paramètres de pose, plan de fond |
| `src/store/uiReducer.ts` | Reducer pur gérant `InteractionMode`, pièce active, viewport |
| `src/store/db.ts` | Wrapper IndexedDB natif : `loadProject`, `saveProject`, `listProjects`, `deleteProject` — gestion `onupgradeneeded` avec fonction de migration versionnée |
| `src/hooks/useAppStore.ts` | Seul point d'entrée React : instancie `useReducer`, charge/persiste via `db.ts`, expose `{ state, dispatch }` |

## Règles importantes

- `src/store/` : **ZÉRO import React** — les reducers sont des fonctions pures `(state, action) => state`
- Toute modification du schéma IndexedDB **doit** s'accompagner d'une fonction de migration dans `db.ts` (voir CLAUDE.md)
- `useAppStore` est le seul hook autorisé à appeler `useReducer`

## Références doc

- [architecture.md](../technical/architecture.md) — flux de données et séparation des responsabilités
- [data-model.md](../technical/data-model.md) — ce qui est stocké vs recalculé
