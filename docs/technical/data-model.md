# Modèle de données

## Principe

**Seules les données saisies par l'utilisateur sont stockées.** Tout ce qui peut être dérivé est recalculé à chaque rendu.

## Schéma de stockage IndexedDB

Le stockage est **relationnel** : chaque entité a son propre object store, avec des clés étrangères (FK) explicites. IndexedDB persiste les records via le **Structured Clone Algorithm** — pas de JSON : les types natifs (`File`, `Blob`, `Map`…) sont supportés nativement.

### Object stores

#### `projects`
| Champ | Type | Description |
| --- | --- | --- |
| `id` | `string` | Clé primaire |
| `name` | `string` | Nom du projet |
| `lastOpenedAt` | `number` | Timestamp de dernière ouverture |
| `poseParams` | `PoseParams` | Paramètres de pose (1:1, embedded) |

#### `rooms`
| Champ | Type | Description |
| --- | --- | --- |
| `id` | `string` | Clé primaire |
| `projectId` | `string` | FK → `projects` |
| `name` | `string` | Nom de la pièce |
| `vertices` | `Point[]` | Sommets du polygone en coordonnées monde (cm) |

#### `rows`
| Champ | Type | Description |
| --- | --- | --- |
| `id` | `string` | Clé primaire |
| `roomId` | `string` | FK → `rooms` |
| `plankTypeId` | `string` | FK → `plankTypes` |
| `xOffset` | `number` | Décalage horizontal (cm) — seule donnée de position persistée |
| `yOffset` | `number?` | Décalage vertical optionnel (cm) |

#### `plankTypes`
| Champ | Type | Description |
| --- | --- | --- |
| `id` | `string` | Clé primaire |
| `projectId` | `string` | FK → `projects` |
| `name` | `string` | Nom du type |
| `length` | `number` | Longueur nominale (cm) |
| `width` | `number` | Largeur (cm) |
| `pricing` | `PlankTypePricing` | Tarif (à l'unité ou au lot) |
| `description` | `string` | Note libre (URL fournisseur, référence…) |

#### `files`
| Champ | Type | Description |
| --- | --- | --- |
| `id` | `string` | Clé primaire |
| `file` | `File` | Fichier image brut (Structured Clone natif) |

#### `plans`
| Champ | Type | Description |
| --- | --- | --- |
| `id` | `string` | Clé primaire |
| `projectId` | `string` | FK → `projects` |
| `fileId` | `string?` | FK nullable → `files` (absent si aucune image importée) |
| `calibration` | `Calibration?` | Points de référence + distance réelle |
| `opacity` | `number` | Opacité 0–1 |
| `rotation` | `number` | Rotation en degrés (0, 90, 180, 270) |

### Diagramme

```mermaid
erDiagram
    projects ||--o{ rooms : "projectId"
    projects ||--o{ plankTypes : "projectId"
    projects ||--o| plans : "projectId"
    rooms ||--o{ rows : "roomId"
    files ||--o| plans : "fileId (nullable)"

    projects {
        string id
        string name
        number lastOpenedAt
        PoseParams poseParams
    }

    rooms {
        string id
        string projectId
        string name
        Point[] vertices
    }

    rows {
        string id
        string roomId
        string plankTypeId
        number xOffset
        number yOffset
    }

    plankTypes {
        string id
        string projectId
        string name
        number length
        number width
        PlankTypePricing pricing
        string description
    }

    files {
        string id
        File file
    }

    plans {
        string id
        string projectId
        string fileId
        Calibration calibration
        number opacity
        number rotation
    }
```

## Types domaine vs records de stockage

Les **records** (ci-dessus) sont les données brutes stockées dans IndexedDB. Le store layer (`src/store/`) est responsable de les **assembler** en types domaine utilisés par la logique métier (`src/core/`) :

| Type domaine (`src/core/types.ts`) | Assemblé depuis |
| --- | --- |
| `Project` | `projects` + catalog + rooms + backgroundPlan |
| `Room` | `rooms` + ses `rows` |
| `PlankType` | `plankTypes` |
| `BackgroundPlan` | `plans` + `files` (résolution du `File`) |

## Ce qui est recalculé à chaque rendu

| Donnée | Fonction | Source |
| --- | --- | --- |
| `Plank[]` | `fillRow(xOffset, ...)` | `xOffset` + dimensions du type |
| `OffcutLink[]` | `computeOffcutLinks()` | Comparaison des offcuts par type, à l'échelle projet |
| `ConstraintViolation[]` | `validateRow()` | `Plank[]` + `PoseParams` |
| Résultats financiers | `computeSummary()` | `Plank[]` + tarifs du catalogue |
