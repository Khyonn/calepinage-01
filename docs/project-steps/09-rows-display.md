# Étape 08 — Mode lames : remplissage et affichage

**Statut : à faire** — dépend des étapes 02, 05

## Périmètre

Implémenter l'ajout de rangées et leur rendu SVG. Le remplissage automatique repose sur `fillRow()` déjà écrit à l'étape 02.

## Fichiers à créer / modifier

| Fichier | Contenu |
| --- | --- |
| `src/hooks/useRoomRows.ts` | Pour la pièce active : résout les types de lames, appelle `fillRow()` pour chaque rangée, retourne les `Plank[]` à rendre |
| `src/components/RowsLayer.tsx` | Rendu SVG de toutes les rangées d'une pièce (rectangles lames + joints) |
| `src/components/PlankRect.tsx` | Rendu d'une lame individuelle avec couleurs normales / erreur |
| `src/components/RowsToolbar.tsx` | Sélecteur de pièce active + bouton "Ajouter une rangée" (choix du type de lame) |

## Comportement attendu

- En mode `edit-rows`, la pièce active affiche ses rangées recalculées à chaque rendu
- Les autres pièces sont atténuées (`opacity: 0.2`)
- Les lames trop courtes affichent les couleurs d'erreur (`--error`, `--error-bg`)
- `Échap` → retour en mode Navigation

## Références doc

- [row-fill.md](../features/row-fill.md) — algorithme et règle "jamais stocké, toujours recalculé"
- [constraints-annotations.md](../features/constraints-annotations.md) — indicateurs visuels
- [interaction-modes.md](../features/interaction-modes.md) — mode Lames
