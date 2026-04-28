# Décalage Y par pièce (`yOffset`)

## Cas d'usage

Deux pièces adjacentes dont les bords de référence (mur, seuil, transition de revêtement) ne tombent pas exactement au même `y` rendent une pose visuellement incohérente : les joints transversaux des rangées ne s'alignent pas d'une pièce à l'autre. Le `yOffset` permet à l'utilisateur de **remonter la première rangée** d'une pièce pour rétablir la continuité linéaire des joints.

```
Sans yOffset (joints décalés) :     Avec yOffset = -3 cm sur la pièce B :

Pièce A          Pièce B           Pièce A          Pièce B
─────────  ╱────────────           ─────────  ╱────────────
═════════  │ ════════════          ═════════  │ ═══════════
─────────  │ ───────────             ┃ y0 ↑   │
═════════  │ ════════════          ─────────  │ ═══════════
                                    ═════════ │ ───────────
```

## Définition

- Champ : `Room.yOffset: number` (cm, valeur signée, précision mm).
- Défaut : `0` à la création.
- Bornes : `[-max(catalog.plankType.width), 0]`.
  - Borne supérieure `0` : l'utilisateur ne peut pas descendre la première rangée (cela créerait un trou en haut). La cale en haut suffit pour gérer la dilatation.
  - Borne inférieure `-max(width)` : remonter de plus que la largeur de la lame la plus large signerait une recouvrement total de la première rangée par une rangée fictive « -1 » — cas non pertinent.
- Précision : modifiable au mm, conversion cm/mm gérée côté UI uniquement.

## Effet sur le rendu

`yOffset` participe au calcul de `yStart` de toute rangée (cf. `docs/features/row-fill.md`) :

```
yStart(rowIndex) = roomMinY + clamp(yOffset, bounds) + cale + Σ(widths[0..rowIndex-1])
```

Toutes les rangées de la pièce sont donc translatées du même offset. Les calculs de chutes (`computeOffcutLinks`), de comptage (`computeSummary`) et de validation (`validateRow`) restent inchangés — ils consomment `yStart` via `computeRowYStart` qui absorbe le `yOffset`.

## UI

Champ « Décalage Y (cm) » dans `RoomEditPanel`, au-dessus du bloc des rangées.

- Composant : `<Input type="number">` (primitive existante).
- Valeur affichée et saisie en **centimètres positifs** (plus naturel pour l'utilisateur — il saisit l'amplitude du décalage vers le haut). Conversion vers le `yOffset` négatif côté state au dispatch.
- Précision 1 mm via `step=0.1`.
- `min=0`, `max=max(catalog.width)`.
- Live update : chaque saisie parseable est dispatchée immédiatement → décalage reflété en temps réel sur le canvas.
- Saisies intermédiaires non parseables (`""`, `"-"`, `"1."`) conservées localement, pas de dispatch tant que la valeur est invalide.
- Au blur, le champ est resynchronisé avec la valeur du store (annule un draft non parseable resté visible).
- Désactivé si catalogue vide (impossible de calculer la borne).

## Persistance

- **IndexedDB** : champ stocké dans `RoomRecord.yOffset` (DB v3). Migration v2→v3 backfill `0` sur les enregistrements existants.
- **JSON** : sérialisé tel quel ; à l'import, `clampYOffset` est appliqué silencieusement (cohérent avec la règle runtime — pas de rejet d'import sur valeur hors bornes).

## Comportement face aux mutations du catalogue

Le clamp est appliqué :
- au **write** (action `setRoomYOffset`) avec le catalogue courant — l'utilisateur ne peut pas saisir une valeur hors bornes ;
- au **read défensif** (`computeRowYStart`) pour absorber un changement ultérieur du catalogue (suppression du type le plus large, modification de width). La valeur stockée reste inchangée — si le type large est ré-ajouté, l'ancien `yOffset` redevient pleinement effectif.

Conséquence pratique : aucune corruption silencieuse du state ; le rendu reste toujours cohérent.

## Hors scope

- Décalage X par pièce — non demandé, pas de cas d'usage actuel.
- Réglage par rangée individuelle — l'offset est une propriété de pièce, pas de rangée.
- Alignement assisté entre pièces voisines (snapping visuel) — fonctionnalité future éventuelle.
