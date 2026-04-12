# Étape 02 — Fondations du domaine

**Statut : terminé**

## Périmètre

Implémenter la totalité de la logique métier pure dans `src/core/`. Aucune dépendance React, aucun accès DOM. Tout doit être testable en isolation.

## Fichiers créés

| Fichier | Contenu |
| --- | --- |
| `src/core/types.ts` | Tous les types du domaine : `Project`, `Room`, `Row`, `PlankType`, `PoseParams`, `BackgroundPlan`, `Plank`, `ConstraintViolation`, `OffcutLink`, `Viewport`, `Point`, `Calibration`, `SummaryResult`… |
| `src/core/geometry.ts` | Conversion coordonnées monde ↔ écran via `Viewport` (`worldToScreen`, `screenToWorld`, `computeScale`) |
| `src/core/rowFill.ts` | `fillRow(xOffset, roomWidth, plankType, poseParams): Plank[]` + `computeOffcutLength()` + `computeOffcutLinks()` (à l'échelle projet) |
| `src/core/validateRow.ts` | `validateRow(rowId, planks, prevPlanks, availableWidth, poseParams): ConstraintViolation[]` |
| `src/core/computeSummary.ts` | `computeSummary(rooms, catalog, poseParams, offcutLinks): SummaryResult` |

## Tests écrits

| Fichier | Type |
| --- | --- |
| `tests/features/row-fill.feature` + `steps/row-fill.steps.ts` | BDD — 5 scénarios `fillRow` et `computeOffcutLength` |
| `tests/features/validate-row.feature` + `steps/validate-row.steps.ts` | BDD — 5 scénarios `validateRow` (3 types de violations) |

Les tests unitaires `src/core/__tests__/` n'ont pas été écrits — la couverture BDD est jugée suffisante pour cette étape.

## Références doc

- [data-model.md](../technical/data-model.md) — schéma complet des entités
- [row-fill.md](../features/row-fill.md) — algorithme détaillé
- [constraints-annotations.md](../features/constraints-annotations.md) — définition des contraintes
- [glossary.md](../glossary.md) — définitions des termes métier
