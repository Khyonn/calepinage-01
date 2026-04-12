# Étape 09 — Mode lames : drag & drop + annotations

**Statut : à faire** — dépend de l'étape 08

## Périmètre

Ajouter le glisser-déposer des rangées, les indicateurs de contraintes en temps réel et les annotations de réutilisation.

## Fichiers à créer / modifier

| Fichier | Contenu |
| --- | --- |
| `src/hooks/useRowDrag.ts` | Gestion du drag : calcul `rawOffset`, validation contraintes, `lastValidOffset`, dispatch `MOVE_ROW` au relâchement |
| `src/components/RowAnnotations.tsx` | Rendu SVG des annotations gauche/droite (longueur + lien de réutilisation) avec technique de contraste |

## Comportement attendu

- Curseur `grab` sur une rangée → `grabbing` pendant le drag
- Déplacement converti espace écran → espace monde (`/ zoom`)
- Positions invalides bloquées visuellement (lames figées, curseur avance quand même)
- Au relâchement : dispatch `MOVE_ROW` avec `lastValidOffset` + cascade sur les rangées suivantes du même type
- Rangée en drag : 70 % opacité + contours `--accent`
- Annotations visibles uniquement en mode Lames, positionnées à l'extérieur des lames
- Rouge = perte matière, noir = lien de réutilisation identifié

## Références doc

- [row-drag.md](../features/row-drag.md) — flux complet et blocage dur
- [constraints-annotations.md](../features/constraints-annotations.md) — règles d'affichage des annotations
- [background-plan.md](../features/background-plan.md#technique-de-contraste-pour-les-annotations) — technique SVG texte blanc + contour
