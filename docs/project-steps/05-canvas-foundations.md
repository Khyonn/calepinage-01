# Étape 05 — Canvas SVG : fondations

**Statut : à faire** — dépend des étapes 02, 03, 04

## Périmètre

Mettre en place le canvas SVG interactif avec navigation (pan/zoom) et le rendu de base des pièces. Pas encore de dessin ni de lames — uniquement la visualisation et la navigation.

## Fichiers à créer

| Fichier | Contenu |
| --- | --- |
| `src/hooks/useViewport.ts` | État du viewport (zoom, pan), fonctions de conversion coordonnées monde ↔ écran |
| `src/hooks/useCanvasEvents.ts` | Écouteurs natifs (`wheel` avec `{ passive: false }`, `pointermove`, `pointerdown`) — ZÉRO React event |
| `src/components/SvgCanvas.tsx` | Canvas SVG principal : `<svg>` + `<g transform>` appliquant le viewport |
| `src/components/RoomShape.tsx` | Rendu d'un polygone de pièce (contour + fond semi-transparent) |

## Comportement attendu

- Zoom `Ctrl + molette` centré sur la souris
- Pan clic gauche + glisser (mode nav) ou bouton milieu
- Pan clavier `Ctrl + ↑↓←→`
- Défilement molette vertical / `Shift + molette` horizontal
- Toutes les pièces du projet actif rendues en coordonnées monde

## Références doc

- [canvas-navigation.md](../features/canvas-navigation.md) — détail technique de l'interception wheel
- [interaction-modes.md](../features/interaction-modes.md) — comportement du mode Navigation
- [architecture.md](../technical/architecture.md) — séparation DOM / React
