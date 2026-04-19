# Jalon 07 — Canvas SVG navigable

**Valeur utilisateur :** l'utilisateur a un canvas interactif avec grille persistante et barre d'échelle, et peut s'y déplacer (zoom, pan, scroll) **à la souris uniquement**. La navigation est disponible quel que soit le mode actif. Pas de pan clavier. Pas encore de contenu à afficher — c'est une fondation.

Le **viewport (zoom + pan) est en state local (hors store Redux et hors IDB)** : il est volatile par onglet, reset à chaque reload.

## Sous-étapes

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 07.1 | Scene + viewport + grille + barre d'échelle | [07.1-scene-viewport.md](07.1-scene-viewport.md) | ⬜ |
| 07.2 | Événements natifs pan/zoom | [07.2-canvas-events.md](07.2-canvas-events.md) | ⬜ |
| 07.3 | Helper contrôles + hook raccourcis | [07.3-keyboard-helper.md](07.3-keyboard-helper.md) | ⬜ |

## Ordre et parallélisation

- Strictement séquentiel : 07.1 → 07.2 → 07.3.

## Dépendances

- Jalon 06 ✅ (shell + projet courant nécessaires pour monter le canvas).

## Références doc transverses

- [features/canvas-navigation.md](../features/canvas-navigation.md) — détail des interactions.
- [features/ui-specifications.md](../features/ui-specifications.md) — tokens canvas.
- [technical/architecture.md](../technical/architecture.md) — séparation DOM / React pour les événements natifs.
