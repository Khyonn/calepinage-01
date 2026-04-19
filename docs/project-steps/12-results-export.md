# Jalon 12 — Résultats et export

**Valeur utilisateur :** l'utilisateur consulte le résumé matière (nombre de lames à acheter, coût estimé, liens de réutilisation) dans un drawer escamotable à droite, et peut exporter ce résumé en CSV pour son fournisseur ou sa propre comptabilité. C'est le dernier livrable métier de la roadmap — après ce jalon, le projet est fonctionnellement complet.

## Sous-étapes

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 12.1 | Drawer droit : résumé matière | [12.1-drawer-summary.md](12.1-drawer-summary.md) | ⬜ |
| 12.2 | Tableau des liens de réutilisation | [12.2-offcut-table.md](12.2-offcut-table.md) | ⬜ |
| 12.3 | Export CSV | [12.3-export-csv.md](12.3-export-csv.md) | ⬜ |

## Ordre et parallélisation

- 12.1 → 12.2 (structure drawer requise).
- 12.3 peut démarrer dès que 10 est terminée (CSV ne nécessite pas le drawer, mais réutilisera le selector résumé).

## Dépendances

- Jalon 10 ✅ (rangées et segments — pour calculer la consommation).
- Jalon 11 souhaitable (sinon le résumé ne reflète que l'état avant optimisation).
- Domaine : `computeSummary(project) → ProjectSummary`, `computeOffcutLinks(project) → OffcutLink[]` — ✅ depuis étape 02/05.

## Références doc transverses

- [features/ui-specifications.md](../features/ui-specifications.md) — drawer droit, tokens.
- [features/constraints-annotations.md](../features/constraints-annotations.md) — affichage des liens de réutilisation.
- [glossary.md](../glossary.md) — "Résumé matière", "Lien de réutilisation".
