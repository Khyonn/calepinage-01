# Jalon 11 — Drag interactif des segments

**Valeur utilisateur :** sur une pièce active en mode `edit`, l'utilisateur ajuste le décalage (`xOffset`) d'un segment de rangée en le glissant à la souris. Les lames se repositionnent en temps réel, les contraintes sont vérifiées pendant le drag, et au relâchement la cascade de réutilisation des chutes est propagée aux rangées du même type.

## Sous-étapes

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 11.1 | Drag segment + preview | [11.1-drag-preview.md](11.1-drag-preview.md) | ⬜ |
| 11.2 | Cascade offcut-links au release | [11.2-cascade-offcut.md](11.2-cascade-offcut.md) | ⬜ |

## Ordre et parallélisation

- 11.1 → 11.2 (cascade ne s'active qu'au release, mais dépend de la mécanique de drag).

## Dépendances

- Jalon 10 ✅ (rangées et segments rendus).
- Domaine : `fillRow`, `validateRow`, `computeOffcutLinks` — tous ✅ depuis étape 02/05.

## Décisions ouvertes à trancher dans les sous-étapes

- **Comportement des annotations pendant le drag** (renvoyé par 10.3) : doivent-elles suivre le preview ou rester figées jusqu'au release ? À trancher dans 11.1 avec justification.
- **Quantification du delta** : 0,1 cm par défaut, à confirmer en testant le ressenti.

## Références doc transverses

- [features/row-drag.md](../features/row-drag.md)
- [features/constraints-annotations.md](../features/constraints-annotations.md) — violations pendant le drag.
- [features/interaction-modes.md](../features/interaction-modes.md) — mode `edit`.
