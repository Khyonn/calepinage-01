# Étape 07 — Mode dessin de pièces

**Statut : à faire** — dépend de l'étape 06

## Périmètre

Implémenter le mode `draw` (tracé d'une nouvelle pièce) et le mode `edit` sur une pièce sans rangées (édition des sommets). Les deux modes partagent le même hook de gestion des sommets.

## Fichiers à créer

Structure par dossier : `NomComposant/index.tsx` · `NomComposant/NomComposant.module.css` · `NomComposant/useNomComposant.ts` (si logique).

| Fichier | Contenu |
| --- | --- |
| `src/components/canvas/RoomDrawingOverlay/useRoomDrawing.ts` | État du tracé en cours (sommets, snap axial, preview), raccourcis clavier |
| `src/components/canvas/VertexHandles/useVertexEdit.ts` | Drag des sommets d'une pièce existante (snap axial, push voisins) |
| `src/components/canvas/RoomDrawingOverlay/` | Rendu SVG du polygone en cours + segment de preview |
| `src/components/canvas/VertexHandles/` | Croix draggables + hit targets + lignes de guidage snap |

## Comportement attendu

### Dessin d'une nouvelle pièce (mode `draw`)

- Clic → ajouter un sommet
- `Ctrl` + drag sur le dernier sommet → snap axial : accrochage au X ou Y d'un sommet existant à ~10 px + ligne guide colorée tant que l'accroche est active
- Mouvement souris → preview du prochain segment en temps réel
- Clic sur le 1er sommet (ou `Entrée`) → fermer le polygone et demander un nom (dialog ou input inline)
- `Suppr` → défaire le dernier sommet
- `Échap` → abandonner sans enregistrer
- Changement de mode → abandon silencieux

Les pièces peuvent avoir des murs diagonaux — la contrainte 90° est levée. Le snap axial remplace la contrainte forcée.

### Édition des sommets (mode `edit`, pièce sans rangées)

Quand la pièce active n'a pas encore de rangées, ses sommets sont éditables :

- **Représentation** : croix ("X"), pas de point plein (masquerait le plan de fond)
- **Hit target** : `<circle>` transparent centré sur le sommet pour une saisie confortable
- **`Ctrl` + drag** : snap axial — accrochage au X ou Y d'un autre sommet à ~10 px + ligne guide colorée tant que l'accroche est active
- **`Shift` + drag** : déplace les deux sommets adjacents du même delta vectoriel ("pousser un mur")
- `Échap` → annule les modifications en cours

> Si la pièce a déjà des rangées, le mode `edit` bascule sur la gestion des rangées (étape 09) — les sommets ne sont plus éditables.

## Références doc

- [room-drawing.md](../features/room-drawing.md) — snap axial et flux complet
- [interaction-modes.md](../features/interaction-modes.md) — modes `draw` et `edit`
