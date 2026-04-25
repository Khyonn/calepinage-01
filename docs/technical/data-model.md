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
| `poseParams` | `PoseParams` | Paramètres de pose (1:1, embedded) |

> **Reprise de session** : le dernier projet ouvert est identifié par `localStorage.calepinage.lastProjectId` — pas de champ `lastOpenedAt` dans le modèle. Au boot, l'app charge uniquement le projet courant en entier + la liste minimale `{ id, name }` des autres projets (pour le menu hamburger). Si aucun projet n'existe, un projet vide est créé automatiquement.

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
| `projectId` | `string` | FK → `projects` (dénormalisé pour cleanup — absent du modèle domaine) |
| `plankTypeId` | `string` | FK → `plankTypes` |
| `segments` | `{ xOffset: number }[]` | Un élément par segment géométrique de la rangée (pièces concaves → plusieurs segments). Seul le `xOffset` de chaque segment est persisté ; la géométrie des segments est recalculée à partir des `vertices` de la pièce. |
| `order` | `number` | Index de la rangée dans `room.rows` (0 = top). Persisté explicitement car `IDBIndex.getAll()` trie par clé primaire (UUID) à index keys égales — l'ordre d'insertion n'est pas conservé sans ce champ. |

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
| `x` | `number` | Position horizontale (cm) — repositionnement en mode `plan`, défaut 0 |
| `y` | `number` | Position verticale (cm) — repositionnement en mode `plan`, défaut 0 |

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
        string projectId
        string plankTypeId
        segments segments
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
        number x
        number y
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

## Format de sérialisation JSON (export / import)

Schéma versionné utilisé par l'export / import JSON (voir [features/project-management.md](../features/project-management.md)). Contrairement au stockage IndexedDB (relationnel), le JSON est **imbriqué** : un seul fichier contient le projet complet plus l'image encodée en base64.

### Schéma v1

```json
{
  "version": 1,
  "exportedAt": "2026-04-24T10:00:00.000Z",
  "project": {
    "id": "…",
    "name": "Appartement",
    "poseParams": { "cale": 0.5, "sawWidth": 0.1, "minPlankLength": 30, "minRowGap": 15 },
    "catalog": [ { "id": "…", "projectId": "…", "name": "Chêne", "length": 120, "width": 14,
                   "pricing": { "type": "lot", "pricePerLot": 45, "lotSize": 8 }, "description": "" } ],
    "rooms": [ { "id": "…", "projectId": "…", "name": "Salon", "vertices": [ { "x": 0, "y": 0 } ],
                 "rows": [ { "id": "…", "roomId": "…", "plankTypeId": "…",
                             "segments": [ { "xOffset": 0 } ] } ] } ],
    "backgroundPlan": { "id": "…", "projectId": "…",
                        "calibration": { "point1": {…}, "point2": {…}, "realDistance": 200 },
                        "opacity": 0.7, "rotation": 0, "x": 0, "y": 0 }
  },
  "image": { "name": "plan.png", "mimeType": "image/png",
             "dataUrl": "data:image/png;base64,iVBORw0KGgo…" }
}
```

### Invariants

- `project.backgroundPlan.imageFile` n'existe **jamais** dans le JSON — l'image est factorisée au niveau racine (`image`).
- `image` est omis si le projet n'a pas de plan de fond.
- À l'import : tous les ids (projet, catalogue, pièces, rangées, plan) sont **régénérés** ; les FK (`row.plankTypeId`, `row.roomId`, `plankType.projectId`, etc.) sont remappées via un `Map<oldId, newId>`. Primitive réutilisable pour le clonage de projet (jalon futur 15.5).
- Validation à l'import : `version === 1`, champs requis (`project.id`, `project.name`, `project.poseParams`, `project.catalog` tableau, `project.rooms` tableau). Pas de dépendance externe (validation manuelle).
- Encodage UTF-8, indentation 2 espaces. Pas de BOM.

### Migrations futures

Une v2 nécessitera une migration explicite dans `src/core/projectSerialize.ts` (lecture v1 → upgrade → hydratation). `version` inconnu → erreur `Format non supporté`, jamais de tentative silencieuse.

## Ce qui est recalculé à chaque rendu

| Donnée | Fonction | Source |
| --- | --- | --- |
| `Plank[]` | `fillRow(xOffset, ...)` | `xOffset` + dimensions du type |
| `RowGeometry` | `computeRowGeometry()` + `intersectStripExtents()` | `Room.vertices` + `rowIndex` + `PoseParams` + `PlankType` |
| `OffcutLink[]` | `computeOffcutLinks()` | Comparaison des offcuts par type, à l'échelle projet |
| `ConstraintViolation[]` (inclut `value` mesurée) | `validateRow()` | `Plank[]` de la rangée + `Plank[]` précédente + `PoseParams` |
| Résultats financiers | `computeSummary()` | `Plank[]` + tarifs du catalogue |
