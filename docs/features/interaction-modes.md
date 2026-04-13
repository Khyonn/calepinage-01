# Modes d'interaction

La barre d'outils expose quatre modes exclusifs. Le mode actif détermine le comportement du canvas et le contenu du panneau contextuel. La navigation dans le canvas (zoom, pan) reste disponible en permanence quel que soit le mode actif — voir [canvas-navigation.md](canvas-navigation.md).

Pour le layout de l'interface (topbar, panneaux, drawer), voir [ui-specifications.md](ui-specifications.md).

| `InteractionMode` | Label | Icône | Description |
| --- | --- | --- | --- |
| `nav` | **Navigation** | Croix fléchée (move) | Mode par défaut — pan, zoom, sélection de pièce |
| `draw` | **Nouvelle pièce** | Stylo | Tracé interactif d'un polygone à angles droits |
| `rows` | **Lames** | Lignes superposées | Ajustement des rangées — visible uniquement si une pièce est active |
| `plan` | **Plan** | Blueprint/image | Gestion du plan de fond : import, calibration, opacité |

Ordre d'affichage dans la topbar : `nav` → `draw` → `rows` *(conditionnel)* → `plan`

## Mode `nav` — Navigation

Mode par défaut, actif au lancement.

**Panneau contextuel :**
- Paramètres de pose (cale, largeur scie, longueur min, écart min)
- Catalogue de lames (voir règles ci-dessous)

**Comportement canvas :**
- Clic sur une pièce → la sélectionner et basculer automatiquement en mode `rows`
- Survol des pièces : curseur pointer + highlight
- Clic gauche + glisser → pan du canvas

## Mode `draw` — Nouvelle pièce

**Panneau contextuel :**
- Instructions sur le tracé
- Renvoi vers le helper contrôles

**Comportement canvas :**
- Le curseur devient `crosshair`
- Clic gauche → place un sommet
- Aperçu en temps réel du prochain segment
- Pan disponible via bouton milieu de la souris

Voir [room-drawing.md](room-drawing.md) pour le détail complet.

## Mode `plan` — Plan de fond

**Panneau contextuel :**
- Import de l'image de fond
- Opacité (slider 0–100 %)
- Rotation (0 / 90 / 180 / 270°)
- Calibration : points A et B draggables sur le canvas + champ "distance réelle" + boutons ✕ / ✓ inline

**Comportement canvas :**
- Les pièces sont atténuées (`opacity: 0.3`) pour mettre le plan en valeur
- La grille reste visible en fond

Voir [background-plan.md](background-plan.md) pour le détail complet.

## Mode `rows` — Lames

Accessible uniquement si une pièce est active. Activé automatiquement au clic sur une pièce en mode `nav`. `Échap` → retour au mode `nav`.

**Panneau contextuel :**
- Paramètres de pose
- Catalogue de lames
- Liste des rangées de la pièce active (xOffset de chaque rangée)
- Bouton "ajouter une rangée"
- Dropdown de sélection de pièce (intégré dans le bouton `rows` de la topbar)

**Comportement canvas :**
- La pièce active est affichée normalement avec ses rangées et annotations
- Toutes les autres pièces sont atténuées (`opacity: 0.2`)
- Les rangées sont draggables (curseur `grab` → `grabbing`)

Voir [row-drag.md](row-drag.md) et [constraints-annotations.md](constraints-annotations.md) pour le détail complet.

## Règles du catalogue (modes `nav` et `rows`)

Affichage par type : nom + dimensions + badge d'utilisation + boutons d'action.

| Situation | Dimensions | Autres champs | Suppression |
| --- | --- | --- | --- |
| Type utilisé dans au moins une rangée | Lecture seule | Modifiables | Non |
| Type non utilisé | Modifiables | Modifiables | Oui |

L'ajout d'un nouveau type est disponible dans les deux modes.
