# Étape 10 — Panneaux latéraux

**Statut : à faire** — dépend des étapes 04, 08

## Périmètre

Implémenter tous les panneaux de l'interface : projet, catalogue de lames, paramètres de pose et résultats. S'appuie sur les composants atomiques de l'étape 04.

## Fichiers à créer

| Fichier | Contenu |
| --- | --- |
| `src/components/panels/ProjectPanel.tsx` | Liste des projets, création, suppression (avec confirmation), sélection |
| `src/components/panels/CatalogPanel.tsx` | CRUD types de lames : ajout, édition, suppression, suggestions depuis autres projets |
| `src/components/panels/PoseParamsPanel.tsx` | Formulaire des 4 paramètres de pose (cale, scie, longueur min, écart min) |
| `src/components/panels/ResultsPanel.tsx` | Tableau récapitulatif des achats par type + liste des liens de réutilisation |
| `src/hooks/useResults.ts` | Appelle `computeSummary()` et `computeOffcutLinks()` sur l'état courant |

## Comportement attendu

- Modifications des paramètres de pose → recalcul immédiat de toutes les rangées
- Suppression protégée par confirmation si l'entité a des enfants
- Résultats mis à jour en permanence (dérivés, jamais stockés)

## Références doc

- [project-management.md](../features/project-management.md) — règles de suppression, catalogue, résultats
- [data-model.md](../technical/data-model.md) — ce qui est recalculé via computeSummary
