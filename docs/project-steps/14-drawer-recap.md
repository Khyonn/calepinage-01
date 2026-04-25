# Jalon 14 — Drawer résumé & récapitulatif

**Valeur utilisateur :** refonte du drawer de droite livré en jalon 12 + édition canvas plus précise.

1. Le tableau résumé matière devient plus informatif : chaque ligne regroupe nombre de lames + type, quantité unitaire ou en lots selon le pricing, et coût unitaire annoté (`/ lot` ou `/ unité`).
2. Une primitive `Tooltip` est introduite dans le design system — premier usage sur les badges de violation (plus de `title` SVG natif non stylé), et sur les boutons iconOnly de la topbar.
3. Le tableau des liens de réutilisation est remplacé par un récapitulatif **par rangée** : chaque rangée liste ses segments, la première et la dernière lame avec leurs sources/cibles éventuelles. Hover sur une source ou une cible → highlight de la **planche concernée seule** sur le canvas (plus de highlight de rangée entière).
4. Édition inline de la longueur des première / dernière planches directement sur le canvas (clic sur l'annotation chiffrée → input numérique → Entrée valide). Précision impossible à atteindre au drag souris.

## Sous-étapes

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 14.1 | Primitive `Tooltip` (design system) | [14.1-tooltip-primitive.md](14.1-tooltip-primitive.md) | ✅ |
| 14.2 | SummaryTable : colonnes Lames / Quantité / Coût unit. / Coût total | [14.2-summary-columns.md](14.2-summary-columns.md) | ⬜ |
| 14.3 | Récapitulatif par rangée avec hover granulaire | [14.3-row-recap.md](14.3-row-recap.md) | ⬜ |
| 14.4 | Édition inline de la longueur de planche depuis le canvas | [14.4-inline-edit-plank.md](14.4-inline-edit-plank.md) | ✅ |

## Ordre et parallélisation

- 14.1 peut être fait en premier et en parallèle des autres. Le Tooltip devient prérequis doux pour 14.3 (mention source/cible) et 14.4 (hint clavier sur l'input).
- 14.2 et 14.3 indépendants côté code mais partagent le drawer : faire 14.2 puis 14.3 pour éviter les conflits de fichiers CSS.
- 14.4 indépendant des autres (touche canvas + domaine). Peut démarrer en parallèle de 14.2/14.3. Dépend soft de 14.1 si on veut un tooltip sur l'input.

## Dépendances

- Jalon 12 ✅ (drawer existant, selectors `selectSummary` / `selectOffcutLinks`).
- Étape 02 ✅ (domaine `computeRowGeometry`, `computeOffcutLinks`).

## Ce qui n'est PAS couvert

- Nouveau mode d'interaction ou fusion nav/edit → jalon 15.
- Nouveaux calculs domaine (seules les présentations changent) — les données restent celles de `computeSummary` / `computeOffcutLinks` / `computeRowGeometry`.
- Tri ou filtres utilisateur dans les tableaux → hors scope.

## Références doc transverses

- [features/ui-specifications.md](../features/ui-specifications.md).
- [features/constraints-annotations.md](../features/constraints-annotations.md).
- [glossary.md](../glossary.md).
