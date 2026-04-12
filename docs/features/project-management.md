# Gestion de projets

## Multi-projets

L'utilisateur peut maintenir plusieurs projets en parallèle — par exemple un par logement en rénovation, ou plusieurs variantes de revêtement pour un même espace. La création, la sélection et la suppression se font depuis le panneau projet.

### Catalogue de lames

Avant de dessiner les pièces, l'utilisateur constitue son catalogue : les types de lames qu'il envisage d'utiliser. Chaque type est défini par :
- Dimensions (longueur × largeur en cm)
- Tarif (à l'unité ou au lot)
- Description libre (URL fournisseur, code référence, note...)

Exemple :
- **Chêne naturel 120×14 cm** — vendu par lot de 8, 45 €/lot
- **Chêne naturel 120×10 cm** — vendu à l'unité, 6 €/pièce

L'utilisateur peut réutiliser des types de lames définis dans d'autres projets ; les suggestions sont dédupliquées automatiquement.

## Suppressions protégées

Toute suppression portant sur des éléments comportant des enfants (projet avec pièces et rangées, pièce avec rangées) est protégée par une **confirmation explicite**.

## Reprise de session

Au retour dans l'application, l'utilisateur retrouve automatiquement le dernier projet sur lequel il travaillait.

## Résultats et export

Le panneau **Résultats** affiche en permanence :
- Le récapitulatif des achats par type de lame
- La liste des liens de réutilisation entre chutes

Un bouton permet d'exporter ces deux tableaux en **CSV**.

## Fonctionnalité envisagée : clonage de projet

L'utilisateur pourrait choisir les éléments à dupliquer parmi :
- Le catalogue de lames
- Les paramètres de pose
- Les pièces dessinées
- Le plan de fond
