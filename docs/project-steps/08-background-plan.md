# Jalon 08 — Plan de fond

**Valeur utilisateur :** l'utilisateur importe son plan (photo, scan, image), règle son opacité et son orientation, le positionne sur le canvas, et le cale à l'échelle réelle. Dès la fin de ce jalon, il peut dessiner à main levée à la bonne échelle dans le jalon suivant.

**Ordre :** ce jalon précède désormais celui des pièces (09) — on veut le fond calibré avant le tracé.

## Sous-étapes

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 08.1 | Mode `plan` + import image | [08.1-plan-import.md](08.1-plan-import.md) | ✅ |
| 08.2 | Repositionnement (drag x/y) | [08.2-plan-reposition.md](08.2-plan-reposition.md) | ✅ |
| 08.3 | Calibration | [08.3-calibration.md](08.3-calibration.md) | ✅ |

## Ordre et parallélisation

- Strictement séquentiel : 08.1 → 08.2 → 08.3.

## Dépendances

- Jalon 07 ✅ (canvas navigable).

## Références doc transverses

- [features/background-plan.md](../features/background-plan.md)
- [features/interaction-modes.md](../features/interaction-modes.md) — mode `plan`.
- [technical/data-model.md](../technical/data-model.md) — table `plans`, `files`.
