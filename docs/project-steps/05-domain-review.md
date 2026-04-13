# Étape 05 — Révision domaine & store

**Statut : à faire**

## Périmètre

Réviser le domaine et le store à la lumière des décisions UI prises à l'étape 04 (wireframes). Les règles métier liées à l'édition du catalogue n'étaient pas modélisées dans `src/core/` ni dans le store.

Cette étape inclut également une revue des spécifications de fonctionnalités existantes au regard de ce que les specs UI (`ui-specifications.md`, `interaction-modes.md`) semblent nécessiter :

- **Fonctionnalité manquante** → créer ou compléter le fichier `docs/features/` correspondant
- **Fonctionnalité incohérente avec la UI** → mettre à jour la spec avant d'implémenter
- **Fonctionnalité évoquée dans la UI mais non documentée** → trancher et documenter la décision

L'objectif est d'éviter de découvrir des trous de spec au moment de l'implémentation des composants.

## Règles métier à implémenter

### Catalogue — lock des dimensions si type utilisé

Un type de lame utilisé dans au moins une rangée du projet ne peut pas voir ses dimensions (longueur, largeur) modifiées. Changer les dimensions invaliderait silencieusement les calculs de remplissage existants.

- `updatePlankType` doit ignorer (ou rejeter) toute modification de `length` ou `width` si le type est référencé dans une rangée
- Les autres champs (nom, tarif, description) restent modifiables sans restriction

### Catalogue — suppression gardée

Un type de lame ne peut être supprimé que s'il n'est référencé dans aucune rangée du projet.

- `deletePlankType` doit être sans effet si le type est utilisé
- La garde peut vivre dans le reducer ou être vérifiée côté UI avant dispatch — à décider

## Sélector à ajouter

`selectUsedPlankTypeIds(state: AppState): Set<string>`

Retourne l'ensemble des `plankTypeId` référencés dans au moins une rangée de toutes les pièces du projet courant. Utilisé par :
- Le renderer du catalogue (lecture seule vs modifiable)
- Les gardes de `updatePlankType` et `deletePlankType`

## Fonctionnalités à spécifier (découvertes à l'étape 04)

### Mode `plan` — déplacement de l'image par drag

Le wireframe montre un panneau contextuel avec import / calibration / opacité, mais le repositionnement du plan de fond n'est pas documenté. En mode `plan`, l'utilisateur doit pouvoir glisser l'image pour l'aligner avec les pièces déjà dessinées.

- L'offset de position (`x`/`y`) sera stocké dans `BackgroundPlan` et persisté en IndexedDB
- Ajouter les champs `x` et `y` au type `BackgroundPlan` dans `src/core/types.ts` et mettre à jour le schéma IDB en conséquence
- Mettre à jour `docs/features/background-plan.md` avec la section déplacement

## Questions ouvertes

- La garde de `deletePlankType` — dans le reducer (silencieux) ou dans le selector + UI (feedback explicite) ?
- Faut-il une `ConstraintViolationType` pour signaler une tentative d'action invalide, ou suffit-il de désactiver le bouton côté UI ?

## Références doc

- [ui-specifications.md](../features/ui-specifications.md) — structure visuelle et composants UI
- [interaction-modes.md](../features/interaction-modes.md) — comportements par mode et règles catalogue
- [project-management.md](../features/project-management.md) — règles d'édition du catalogue
