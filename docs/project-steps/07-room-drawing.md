# Étape 06 — Mode dessin de pièces

**Statut : à faire** — dépend de l'étape 05

## Périmètre

Implémenter le mode `add-room` en entier : tracé interactif, snap à 90°, validation, persistence.

## Fichiers à créer / modifier

| Fichier | Contenu |
| --- | --- |
| `src/hooks/useRoomDrawing.ts` | Gestion de l'état de dessin en cours (sommets, snap, preview), raccourcis clavier |
| `src/components/RoomDrawingOverlay.tsx` | Rendu SVG du polygone en cours + segment de preview |

## Comportement attendu

### Dessin d'une nouvelle pièce

- Clic → ajouter un sommet (contraint à 90° par rapport au précédent)
- Mouvement souris → preview du prochain segment en temps réel
- Clic sur le 1er sommet → fermer et demander un nom (dialog ou input inline)
- `Suppr` → défaire le dernier sommet
- `Échap` → abandonner sans enregistrer
- `Entrée` → valider avec les sommets actuels
- Changement de mode → abandon silencieux

### Modification des points d'une pièce existante

En mode `draw`, cliquer sur une pièce existante permet de repositionner ses sommets :

- Les sommets sont affichés sous forme de poignées draggables
- Drag d'un sommet → déplace le point, les segments adjacents se mettent à jour en temps réel
- La contrainte à 90° peut être appliquée ou relâchée (à préciser)
- `Échap` → annule les modifications en cours

## Références doc

- [room-drawing.md](../features/room-drawing.md) — algorithme de snap et flux complet
- [interaction-modes.md](../features/interaction-modes.md) — différences par rapport au mode Navigation
