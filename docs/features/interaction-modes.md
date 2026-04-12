# Modes d'interaction

La barre d'outils expose quatre modes exclusifs. Le mode actif détermine le comportement du canvas et les éléments visuels affichés. La navigation dans le canvas (zoom, pan) reste disponible en permanence quel que soit le mode actif — voir [canvas-navigation.md](canvas-navigation.md).

| `InteractionMode` | Label barre d'outils | Icône suggérée | Description |
| --- | --- | --- | --- |
| `nav` | **Navigation** | `MousePointer` 🖱️ | Mode par défaut — pan, zoom, sélection de pièce |
| `add-room` | **Dessin de pièce** | `PenLine` ✏️ | Tracé interactif d'un polygone à angles droits |
| `edit-plan` | **Plan** | `Image` 🖼️ | Gestion du plan de fond : import, calibration, opacité |
| `edit-rows` | **Lames** | `Layers` ▦ | Ajustement des rangées de la pièce active |

## Navigation — comportement de base

Mode par défaut, actif au lancement et accessible depuis n'importe quel autre mode.

**Ce qui est affiché :**
- Toutes les pièces, à opacité normale
- Les rangées de la pièce active (lames visibles, sans annotations)
- Aucun outil de dessin actif

**Interactions spécifiques :**
- Clic sur une pièce → la sélectionner comme pièce active
- Clic gauche + glisser → pan du canvas

## Dessin de pièce — différences par rapport à Navigation

**Ce qui change :**
- Le curseur devient une croix (`crosshair`)
- Clic gauche → place un sommet (ne pan plus)
- Un aperçu en temps réel montre le prochain segment entre le dernier sommet validé et la position du curseur
- Raccourcis clavier : `Suppr` (défaire), `Échap` (annuler), `Entrée` (valider)

**Ce qui reste inchangé :** toutes les pièces existantes restent visibles ; pan disponible via le bouton milieu de la souris.

Voir [room-drawing.md](room-drawing.md) pour le détail complet.

## Plan — différences par rapport à Navigation

**Ce qui change :**
- Un panneau flottant apparaît avec les contrôles du plan de fond : import d'image, calibration, rotation (±90°) et **opacité**
- Un **slider d'opacité** permet d'ajuster la transparence du plan entre 0 % et 100 % ; la valeur est persistée
- Si la calibration est en cours, le curseur devient `crosshair` et les clics posent les points de référence
- Les pièces sont légèrement atténuées (`opacity: 0.3`) pour mettre le plan en valeur

**Ce qui reste inchangé :** pan et zoom disponibles normalement.

Voir [background-plan.md](background-plan.md) pour le détail complet.

## Lames — différences par rapport à Navigation

**Ce qui change :**
- La **pièce active** est affichée normalement avec ses rangées et ses **annotations** de liens de réutilisation
- Toutes les **autres pièces** sont atténuées (`opacity: 0.2`)
- Les rangées de la pièce active sont **draggables** (curseur `grab` → `grabbing` pendant le drag)
- Le sélecteur de pièce active dans la barre d'outils permet de changer de pièce sans quitter le mode Lames
- `Échap` → retour au mode Navigation

**Ce qui reste inchangé :** pan et zoom disponibles normalement.

Voir [row-drag.md](row-drag.md) et [constraints-annotations.md](constraints-annotations.md) pour le détail complet.
