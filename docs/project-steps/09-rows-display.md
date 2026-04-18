# Étape 09 — Mode lames : remplissage et affichage

**Statut : à faire** — dépend des étapes 05, 06

## Périmètre

Implémenter l'ajout de rangées et leur rendu SVG. Compléter la hiérarchie canvas avec `<Row>` et `<Segment>`. Le calcul d'intersection bande/polygone (`intersectStripWithPolygon`) est déjà écrit à l'étape 05.

## Hiérarchie de composants

```
<Scene>
  <BackgroundPlan />
  <Room>
    <Row>          ← ajouté à cette étape
      <Segment>    ← ajouté à cette étape
```

## Fichiers à créer

Structure par dossier : `NomComposant/index.tsx` · `NomComposant/NomComposant.module.css` · `NomComposant/useNomComposant.ts` (si logique).

| Fichier | Contenu |
| --- | --- |
| `src/components/canvas/Row/` | Rendu d'une rangée — itère sur ses segments et rend un `<Segment>` par segment |
| `src/components/canvas/Segment/useSegmentGeometry.ts` | Selector mémoisé (factory `createSelector`) — calcule xStart/xEnd à partir du polygone de la pièce et de la position Y de la rangée |
| `src/components/canvas/Segment/` | Rendu SVG d'un segment : rectangles lames + joints, couleurs normales / erreur |
| `src/components/canvas/RowsToolbar/` | Sélecteur de pièce active + combobox type de lame + bouton "Ajouter une rangée" |
| `src/store/thunks.ts` | Thunk `addRowThunk` — lit activeRoomId + selectedPlankTypeId depuis le store, appelle `addRow` de `src/core/`, dispatch l'action privée |

## Comportement attendu

### Ajout d'une rangée

- La combobox de `RowsToolbar` dispatch `setSelectedPlankTypeId` à chaque changement
- Le bouton "Ajouter une rangée" dispatch `addRowThunk`
- Le thunk calcule la position Y (cumul des largeurs des rangées précédentes + cales de dilatation + offset Y de la pièce), appelle `addRow(room, plankType)` depuis `src/core/`, et dispatch l'action privée `{ roomId, row }`

### Rendu

- En mode `edit` avec rangées, la pièce active affiche ses rangées
- Les autres pièces sont atténuées (`opacity: 0.2`)
- La géométrie des segments (xStart, xEnd, y1, y2) est calculée via selector mémoisé — jamais persistée
- Les lames trop courtes (< `minPlankLength`) affichent les couleurs d'erreur (`--color-error`, `--color-error-bg`)
- `Échap` → retour en mode `nav`

### Contraintes visuelles

Les violations de contraintes sont **signalées**, pas bloquées :
- Lame trop courte → couleur d'erreur sur le segment concerné
- Écart min entre rangées non respecté → indicateur visuel (à préciser à l'implémentation)

## Références doc

- [row-fill.md](../features/row-fill.md) — algorithme, modèle Row/Segment, postulat strips horizontaux
- [constraints-annotations.md](../features/constraints-annotations.md) — indicateurs visuels
- [interaction-modes.md](../features/interaction-modes.md) — mode `edit`
