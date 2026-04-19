# Jalon 10 — Rangées et calepinage

**Valeur utilisateur :** l'utilisateur ajoute des rangées dans une pièce active, voit immédiatement les lames calculées segment par segment, leurs annotations de réutilisation de chutes, et les violations de contraintes signalées visuellement. C'est le moment où le cœur métier (calepinage + optimisation) devient visible.

## Sous-étapes

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 10.1 | Ajouter une rangée | [10.1-add-row.md](10.1-add-row.md) | ⬜ |
| 10.2 | Composants `Row` / `Segment` + selectors paramétrés | [10.2-row-segment-render.md](10.2-row-segment-render.md) | ⬜ |
| 10.3 | Annotations de réutilisation | [10.3-annotations.md](10.3-annotations.md) | ⬜ |
| 10.4 | Violations de contraintes visuelles | [10.4-constraint-violations.md](10.4-constraint-violations.md) | ⬜ |

## Ordre et parallélisation

- 10.1 → 10.2 (structure visuelle de base).
- 10.3 et 10.4 peuvent se faire en parallèle après 10.2.

## Dépendances

- Jalon 09 ✅ (pièces dessinées).
- Jalon 06.3 ✅ (catalogue peuplé).
- Domaine : `addRow`, `fillRow`, `validateRow`, `computeOffcutLinks`, `computeSummary` — tous ✅ depuis étape 02/05.

## Références doc transverses

- [features/row-fill.md](../features/row-fill.md)
- [features/constraints-annotations.md](../features/constraints-annotations.md)
- [features/interaction-modes.md](../features/interaction-modes.md) — mode `edit` avec rangées.
