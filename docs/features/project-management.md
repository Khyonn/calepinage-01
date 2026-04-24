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

**Règles d'édition :**
- Type utilisé dans au moins une rangée → dimensions (longueur, largeur) en lecture seule ; nom, tarif et description restent modifiables
- Type non utilisé → tous les champs modifiables, et supprimable
- L'ajout d'un nouveau type est toujours disponible

## Suppressions protégées

Toute suppression portant sur des éléments comportant des enfants (projet avec pièces et rangées, pièce avec rangées) est protégée par une **confirmation explicite**.

## Reprise de session

Au retour dans l'application, l'utilisateur retrouve automatiquement le dernier projet sur lequel il travaillait.

**Implémentation** — l'identifiant du dernier projet est stocké dans `localStorage` (clé `calepinage.lastProjectId`). Au boot, seul ce projet est chargé intégralement depuis IndexedDB. La liste des autres projets est limitée à `{ id, name }` (alimente le menu hamburger sans tout charger). Si aucun projet n'existe, un projet vide `"Nouveau projet"` est créé automatiquement — l'utilisateur n'a jamais à interagir avec un écran « pas de projet ».

**Multi-onglets** — pas de synchronisation cross-tab. Le dernier onglet à écrire `lastProjectId` gagne au prochain reload.

## Résultats et export

Le **drawer Résumé** (bouton `☷` de la topbar) affiche à la demande :
- Le récapitulatif des achats par type de lame (nombre de lames, coût unitaire et coût total).
- La liste des liens de réutilisation entre chutes. Le survol d'une ligne met en surbrillance les deux rangées concernées sur le canvas.

Le drawer est fermé par défaut au démarrage et peut être redimensionné via son bord gauche. Sa largeur et son état d'ouverture ne sont pas persistés (reset à chaque session).

### Export CSV

Depuis le menu hamburger, l'entrée **Exporter CSV** télécharge un fichier `calepinage-<slug>-<date>.csv` contenant trois sections : résumé matière, liens de réutilisation, paramètres de pose.

Format : séparateur `;`, encodage UTF-8 avec BOM, fin de ligne `\r\n`. Compatible Excel FR et LibreOffice Calc sans configuration. Les noms contenant des caractères spéciaux (`;`, `"`, sauts de ligne) sont échappés conformément à la RFC 4180.

## Fonctionnalité envisagée : clonage de projet

L'utilisateur pourrait choisir les éléments à dupliquer parmi :
- Le catalogue de lames
- Les paramètres de pose
- Les pièces dessinées
- Le plan de fond
