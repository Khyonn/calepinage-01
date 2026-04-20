# Jalon 09 — Pièces dessinées et éditables

**Valeur utilisateur :** l'utilisateur dessine ses pièces polygonales sur le canvas (par-dessus le plan calibré si présent, sinon sur la grille seule), avec un snap axial en X et Y indépendants. Il peut ensuite ajuster les sommets d'une pièce existante tant qu'elle ne contient pas de rangées.

## Sous-étapes

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 09.1 | Mode `draw` : tracé polygone | [09.1-room-draw.md](09.1-room-draw.md) | ✅ |
| 09.2 | Composant `Room` : rendu polygone | [09.2-room-render.md](09.2-room-render.md) | ✅ |
| 09.3 | Mode `edit` sans rangées : sommets | [09.3-room-edit-vertices.md](09.3-room-edit-vertices.md) | ✅ |

## Ordre et parallélisation

- 09.2 peut démarrer en parallèle de 09.1 (rendu statique possible sans tracé).
- 09.3 nécessite 09.2 (rendu) + 09.1 (logique de snap réutilisable).

## Dépendances

- Jalon 07 ✅ (canvas navigable).
- Jalon 08 (optionnel : dessiner sans plan est accepté, mais la calibration ajoute de la valeur).

## Références doc transverses

- [features/room-drawing.md](../features/room-drawing.md)
- [features/interaction-modes.md](../features/interaction-modes.md) — modes `draw` et `edit`.
- [docs/glossary.md](../glossary.md) — définition de "Pièce active".
