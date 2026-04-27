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

### Export / Import JSON

L'export reste accessible depuis le menu hamburger ; l'import est intégré au sous-menu **Nouveau projet** (cf. ci-dessous).

- **Exporter JSON** — télécharge `calepinage-<slug>-<date>.json` contenant l'intégralité du projet (catalogue, paramètres de pose, pièces, rangées, plan de fond avec image en base64). Désactivé si pas de projet courant.
- **Nouveau projet → Depuis un fichier JSON** — ouvre un file picker, lit un fichier exporté précédemment, **crée un nouveau projet** avec des ids régénérés. Toujours activé.

Format : JSON indenté 2 espaces, encodage UTF-8. Schéma versionné (`version: 1`) — voir [technical/data-model.md](../technical/data-model.md). Un import avec un nom déjà utilisé appendera ` (importé)` au nom (puis ` (importé 2)`, etc.). L'image du plan de fond est encodée en base64 dans le JSON (gonflement ~+33 %). Aucun schéma serveur : tout reste local.

Erreurs gérées : JSON invalide (`Fichier corrompu`), version non reconnue (`Format non supporté`), champs requis manquants (`Fichier corrompu`). Une alerte s'affiche, aucun projet n'est modifié.

## Sous-menu Nouveau projet

L'entrée **Nouveau projet** du menu hamburger expose trois points d'entrée :

- **À partir de rien** — formulaire « nom du projet » + bouton Créer. Un projet vide est créé.
- **Depuis un fichier JSON** — file picker, parsing, création (cf. section ci-dessus).
- **Depuis un projet existant** — clonage configurable (cf. section suivante).

## Cloner un projet

L'utilisateur sélectionne un projet source dans la liste, choisit les éléments à reprendre via des cases à cocher, puis donne un nom au nouveau projet. Le clone reçoit des identifiants UUID régénérés ; le projet source reste inchangé.

**Éléments clonables :**
- Catalogue
- Paramètres de pose
- Plan de fond (avec image)
- Pièces (sommets uniquement, sans rangées)
- Rangées

**Dépendances enforcées :**
- Cocher *Rangées* coche automatiquement *Pièces* et *Catalogue* (et désactive leur décochage).
- Décocher *Pièces* ou *Catalogue* décoche aussi *Rangées*.

**Comportement par défaut :** Catalogue, Paramètres de pose, Pièces et Rangées cochés ; Plan de fond décoché.

**Pose non clonée :** si *Paramètres de pose* est décoché, le clone démarre avec les valeurs par défaut (`cale 0.5`, `sawWidth 0.1`, `minPlankLength 30`, `minRowGap 15`).

**Nom :** par défaut `<source> (copie)`. Si déjà utilisé, suffixé via la même règle que l'import (` (importé)`, etc.).

## Sous-menu Ouvrir un projet

L'entrée **Ouvrir un projet** déploie en flyout la liste des autres projets disponibles. Click sur un projet → switch immédiat. Désactivée s'il n'y a aucun autre projet en base.
