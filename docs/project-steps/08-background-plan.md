# Étape 07 — Plan de fond

**Statut : à faire** — dépend de l'étape 05

## Périmètre

Implémenter le mode `edit-plan` : import d'image, calibration, rotation, opacité.

## Fichiers à créer / modifier

| Fichier | Contenu |
| --- | --- |
| `src/hooks/useBackgroundPlan.ts` | Gestion import (FileReader), calibration (2 points → échelle), rotation, opacité |
| `src/components/BackgroundPlanImage.tsx` | Rendu `<image>` SVG en unités monde |
| `src/components/PlanPanel.tsx` | Panneau flottant mode `edit-plan` : bouton import, slider opacité, boutons rotation, bouton calibrer |

## Comportement attendu

- Import image → FileReader → dataUrl → calcul dimensions en px → affichage en unités monde
- Calibration : mode crosshair, 2 clics sur le plan + saisie de la distance réelle → calcul échelle px/cm
- Recalibration possible sans perte des pièces (coordonnées monde inchangées)
- Slider opacité 0–100 % persisté dans `BackgroundPlan.opacity`
- Rotation ±90° non destructive

## Références doc

- [background-plan.md](../features/background-plan.md) — flux complet et technique de contraste
