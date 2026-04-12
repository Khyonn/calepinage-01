# Indicateurs de contraintes et annotations

## Indicateurs visuels de contraintes

Les trois contraintes sont vérifiées à chaque rendu et pendant le drag :

| Contrainte | Condition |
| --- | --- |
| `first-plank-too-short` | La première lame visible est inférieure à `minPlankLength` |
| `last-plank-too-short` | La dernière lame est inférieure à `minPlankLength` |
| `row-gap-too-small` | L'écart entre la fin de cette rangée et la fin de la rangée précédente du même type est inférieur à `minRowGap` |

Chaque lame dont la longueur est inférieure à `minPlankLength` reçoit un fond et un contour d'erreur :

```css
fill:   var(--error-bg)   /* rgba(220, 38, 38, 0.35) */
stroke: var(--error)      /* #dc2626                  */
```

Ces indicateurs se mettent à jour en temps réel pendant le drag et lors de la modification des paramètres de pose.

## Annotations de liens de réutilisation

Visibles uniquement en mode **Lames**. À chaque extrémité d'une rangée, une annotation textuelle indique la longueur de la pièce partielle et, le cas échéant, son lien avec une autre rangée.

### Positionnement

Les annotations sont placées **à l'extérieur de la zone des lames** — à gauche du bord gauche pour le début de rangée, à droite du bord droit pour la fin — afin de ne jamais masquer les lames.

### Règles d'affichage

- **Début de rangée** : affiché uniquement si la première lame est plus courte que la longueur nominale (`xOffset > 0`). Si la rangée commence avec une planche entière (`xOffset = 0`), aucune annotation.
- **Fin de rangée** : affiché uniquement si la dernière lame est plus courte que la longueur nominale (une coupe a été faite).

### Cas d'affichage

| Cas | Position | Exemple | Couleur contour |
| --- | --- | --- | --- |
| Début — planche coupée sur planche neuve | Gauche | `+ 47 cm` | Rouge |
| Début — chute réutilisée en entrée | Gauche | `+ 34,5 cm (rangée 2, dernière planche)` | Noir |
| Fin — chute non réutilisée (perte) | Droite | `+ 12 cm` | Rouge |
| Fin — chute réutilisée dans une rangée suivante | Droite | `+ 34,5 cm (rangée 4, première planche)` | Noir |

Le **rouge** indique une perte matière potentielle : aucune autre rangée ne consomme cette pièce. Un ajustement des décalages peut parfois créer un lien là où il n'en existait pas.

### Technique de rendu

Voir [background-plan.md — Technique de contraste](background-plan.md#technique-de-contraste-pour-les-annotations) pour les détails de rendu SVG (texte blanc + contour `paintOrder: stroke`).
