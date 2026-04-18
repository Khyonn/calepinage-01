# Étape 06 — Canvas SVG : fondations

**Statut : ✅ Terminé**

## Périmètre

Mettre en place le canvas SVG interactif avec navigation (pan/zoom) et le rendu de base des pièces et du plan de fond. Pas encore de dessin ni de lames — uniquement la visualisation et la navigation.

## Hiérarchie de composants

```
<Scene>              ← SVG racine, applique le viewport (zoom/pan), grille de fond
  <BackgroundPlan /> ← image de fond (rendue sous les pièces)
  <Room>             ← polygone d'une pièce (contour + fond semi-transparent)
```

`<Row>` et `<Segment>` ne sont pas encore rendus à cette étape.

## Fichiers créés

| Fichier | Contenu |
| --- | --- |
| `src/hooks/viewport.ts` | Fonctions pures testables : `screenToWorld`, `worldToScreen`, `zoomTowards`, `centerViewport`, `roomsBoundingBox` |
| `src/hooks/useViewport.ts` | Hook Redux : lecture du viewport + dispatch `setViewport` |
| `src/hooks/__tests__/viewport.test.ts` | 12 tests unitaires sur les fonctions pures |
| `src/components/canvas/Scene/` | SVG racine + grille + `<g transform>` viewport + centrage au montage |
| `src/components/canvas/Scene/useCanvasEvents.ts` | Écouteurs natifs (`wheel` `{ passive: false }`, `pointer*`, `keydown`) — ZÉRO React event |
| `src/components/canvas/Room/` | Polygone de pièce avec `vectorEffect="non-scaling-stroke"` |
| `src/components/canvas/BackgroundPlan/` | `<image>` SVG avec calibration, opacité, rotation, object URL géré via `useEffect` |

**Décision d'implémentation** : les fonctions de calcul viewport (`viewport.ts`) sont extraites dans un module pur séparé du hook, ce qui les rend testables sans store ni DOM. Le hook `useViewport.ts` se limite au binding Redux.

## Comportement attendu

### Navigation

| Action | Contrôle |
|--------|----------|
| Zoom (vers curseur) | `Ctrl` + molette |
| Scroll vertical | Molette |
| Scroll horizontal | `Shift` + molette |
| Pan drag | `Espace` + clic gauche drag **OU** clic molette drag |
| Pan clavier | `Ctrl` + `↑↓←→` |

En mode dessin de pièce, `Espace + drag` suspend temporairement l'interaction de dessin le temps du pan, puis reprend au relâchement.

**Propagation clavier** : les raccourcis ne s'activent que si aucun élément de formulaire n'a le focus (`input`, `textarea`, `select`, `contenteditable`).

### Rendu

- Toutes les pièces du projet actif rendues en coordonnées monde
- Éléments centrés dans le viewport à l'ouverture
### Grille de fond

Une grille est toujours rendue derrière les pièces, y compris lorsqu'un plan de fond est chargé. Elle sert de repère visuel permanent et distingue clairement la zone canvas des panneaux UI.

### Plan de fond

`<BackgroundPlan />` rendu uniquement si `project.backgroundPlan` est défini.

## Références doc

- [canvas-navigation.md](../features/canvas-navigation.md) — détail technique de l'interception wheel
- [interaction-modes.md](../features/interaction-modes.md) — comportement du mode Navigation
- [background-plan.md](../features/background-plan.md) — rendu et position du plan de fond
- [technical/architecture.md](../technical/architecture.md) — séparation DOM / React
