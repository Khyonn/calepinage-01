# Étape 08 — Plan de fond

**Statut : à faire** — dépend de l'étape 06

## Périmètre

Implémenter le mode `plan` : import d'image, calibration, opacité, rotation et repositionnement par drag. Le composant `<BackgroundPlan />` existe déjà depuis l'étape 06 (rendu de base) — cette étape le complète avec toute l'interactivité.

## Fichiers à créer / modifier

Structure par dossier : `NomComposant/index.tsx` · `NomComposant/NomComposant.module.css` · `NomComposant/useNomComposant.ts` (si logique).

| Fichier | Contenu |
| --- | --- |
| `src/components/canvas/BackgroundPlan/useBackgroundPlan.ts` | Import (`URL.createObjectURL`), calibration (2 points → échelle), rotation, opacité, drag de repositionnement |
| `src/components/canvas/BackgroundPlan/` | Compléter le rendu : appliquer position x/y, opacité, rotation |
| `src/components/canvas/PlanPanel/` | Panneau flottant mode `plan` : bouton import, slider opacité, boutons rotation, déclencheur calibration |

## Comportement attendu

### Import

- Sélection d'un fichier image → stockage du `File` natif dans IndexedDB (pas de base64)
- Au chargement : `URL.createObjectURL(file)` → lecture `naturalWidth` / `naturalHeight` → affichage en unités monde
- L'object URL est révoqué (`URL.revokeObjectURL`) dès qu'il n'est plus nécessaire

### Calibration

- Mode crosshair : 2 clics sur le plan pour poser les points A et B
- Saisie de la distance réelle en cm → calcul de l'échelle px/cm
- Recalibration possible sans perte des pièces (coordonnées monde inchangées)
- Sans calibration : échelle par défaut 1 px = 1 cm (plan utilisable mais dimensions incorrectes)

### Repositionnement

- En mode `plan`, drag de l'image pour l'aligner avec les pièces déjà dessinées
- Position (`x`, `y`) persistée dans `BackgroundPlan`

### Opacité et rotation

- Slider opacité 0–100 % persisté dans `BackgroundPlan.opacity`
- Rotation ±90° non destructive (transformation SVG, données inchangées)

## Références doc

- [background-plan.md](../features/background-plan.md) — flux complet et technique de contraste
- [interaction-modes.md](../features/interaction-modes.md) — mode `plan`
