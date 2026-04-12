# Étape 02 — Fondations du domaine

**Statut : à faire**

## Périmètre

Implémenter la totalité de la logique métier pure dans `src/core/`. Aucune dépendance React, aucun accès DOM. Tout doit être testable en isolation.

## Fichiers à créer

| Fichier | Contenu |
| --- | --- |
| `src/core/types.ts` | Tous les types du modèle : `Project`, `Room`, `Row`, `PlankType`, `PoseParams`, `BackgroundPlan`, `Plank`, `ConstraintViolation`, `OffcutLink`, `Viewport`, `Point`, `Calibration`… |
| `src/core/geometry.ts` | Types géométriques (`Point`, `Rect`) + conversion coordonnées monde ↔ écran via `Viewport` |
| `src/core/rowFill.ts` | Fonction pure `fillRow(xOffset, roomWidth, plankType, poseParams, availableOffcuts): Plank[]` + `computeOffcutLinks()` |
| `src/core/validateRow.ts` | Fonction pure `validateRow(planks, prevRow, poseParams): ConstraintViolation[]` |
| `src/core/computeSummary.ts` | `computeSummary(rooms, catalog): SummaryResult` — récapitulatif achats et pertes |

## Tests à écrire

- `src/core/__tests__/rowFill.test.ts` — cas nominaux, réutilisation de chutes, contraintes non respectées
- `tests/features/row-fill.feature` + `tests/features/steps/row-fill.steps.ts` — scénarios BDD fonctionnels

## Références doc

- [data-model.md](../technical/data-model.md) — schéma complet des entités
- [row-fill.md](../features/row-fill.md) — algorithme détaillé
- [constraints-annotations.md](../features/constraints-annotations.md) — définition des contraintes
- [glossary.md](../glossary.md) — définitions des termes métier
