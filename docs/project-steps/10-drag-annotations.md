# Étape 10 — Mode lames : drag & annotations

**Statut : à faire** — dépend de l'étape 09

## Périmètre

Ajouter le glisser-déposer des segments, les indicateurs de contraintes en temps réel et les annotations de réutilisation des chutes.

## Fichiers à créer

Structure par dossier : `NomComposant/index.tsx` · `NomComposant/NomComposant.module.css` · `NomComposant/useNomComposant.ts` (si logique).

| Fichier | Contenu |
| --- | --- |
| `src/components/canvas/Segment/useSegmentDrag.ts` | Drag d'un segment : calcul du delta en coordonnées monde, calcul des intervalles d'offsets interdits (contrainte esthétique), dispatch `updateSegmentOffset` au relâchement |
| `src/components/canvas/RowAnnotations/` | Rendu SVG des annotations gauche/droite : longueur utile, lien de réutilisation, technique de contraste |

## Comportement attendu

### Drag d'un segment

- Curseur `grab` au survol → `grabbing` pendant le drag
- Déplacement converti espace écran → espace monde (`/ zoom`)
- Pendant le drag : calcul en temps réel des intervalles d'offsets interdits (contrainte esthétique avec les segments de la rangée précédente qui se chevauchent horizontalement)
- Les violations de contraintes sont signalées visuellement (lames en couleur d'erreur) — l'utilisateur n'est pas bloqué
- L'offset est arrondi au **0,1 cm** le plus proche pendant le drag (précision globale du domaine)
- Au relâchement : dispatch `updateSegmentOffset({ roomId, rowId, segmentIndex, xOffset })`

### Annotations

- Visibles uniquement en mode `edit`
- Positionnées à l'extérieur des lames (gauche et droite du segment)
- Rouge = perte matière (chute non réutilisable)
- Noir = lien de réutilisation identifié
- Technique de contraste : texte blanc + contour coloré (`paintOrder: stroke`), épaisseur du contour constante en pixels écran (`strokeWidth = 2.5 / zoom`)

## Références doc

- [row-drag.md](../features/row-drag.md) — flux complet du drag
- [constraints-annotations.md](../features/constraints-annotations.md) — règles d'affichage des annotations
- [background-plan.md](../features/background-plan.md#technique-de-contraste-pour-les-annotations) — technique SVG texte blanc + contour
