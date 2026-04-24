# Jalon 11 — Drag interactif des segments

**Valeur utilisateur :** sur une pièce active en mode `edit`, l'utilisateur ajuste le décalage (`xOffset`) d'un segment de rangée en le glissant à la souris. Les lames se repositionnent en temps réel, les contraintes sont vérifiées pendant le drag, et au relâchement la cascade de réutilisation des chutes est propagée aux rangées du même type.

## Sous-étapes

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 11.1 | Drag segment + preview | [11.1-drag-preview.md](11.1-drag-preview.md) | ✅ |
| 11.2 | Cascade offcut-links au release | [11.2-cascade-offcut.md](11.2-cascade-offcut.md) | ✅ |

## Ordre et parallélisation

- 11.1 → 11.2 (cascade ne s'active qu'au release, mais dépend de la mécanique de drag).

## Dépendances

- Jalon 10 ✅ (rangées et segments rendus).
- Domaine : `fillRow`, `validateRow`, `computeOffcutLinks` — tous ✅ depuis étape 02/05.

## Décisions prises

- **Annotations pendant le drag** : **figées** sur les valeurs committées, reprennent les valeurs courantes au release. Réduit le bruit visuel pendant la manipulation — feedback fourni par la position des lames et les badges de violation.
- **Politique de contrainte** : **preview libre + violations visibles** (non-bloquant, cohérent avec 10.4). La valeur courante est commitée telle quelle au release, même si elle produit une rangée invalide.
- **Cascade** : exécutée dans le **même reducer** que `updateSegmentOffset` via `propagateOffcuts`, un seul dispatch / un seul re-render. Appliquée uniquement pour `segments[0]` et rangées postérieures du même `plankTypeId` dans la même pièce.
- **Quantification du delta** : **0,1 cm** (conforme à la règle d'arrondi globale).
- **Activation** : uniquement en mode `edit` et sur la pièce active. Rangées des autres pièces (atténuées) non draggables.

## Références doc transverses

- [features/row-drag.md](../features/row-drag.md)
- [features/constraints-annotations.md](../features/constraints-annotations.md) — violations pendant le drag.
- [features/interaction-modes.md](../features/interaction-modes.md) — mode `edit`.
