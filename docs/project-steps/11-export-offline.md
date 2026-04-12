# Étape 11 — Export CSV & mode hors-ligne

**Statut : à faire** — dépend de l'étape 10

## Périmètre

Finaliser les deux fonctionnalités "sortie" de l'application : l'export CSV des résultats et le Service Worker pour le fonctionnement hors-ligne.

## Export CSV

| Fichier | Contenu |
| --- | --- |
| `src/core/exportCsv.ts` | Fonctions pures `summaryToCsv()` et `offcutLinksToCsv()` → chaînes CSV |
| `src/components/panels/ResultsPanel.tsx` | Bouton "Exporter CSV" → déclenche le téléchargement via `<a download>` |

Deux fichiers exportés :
- `calepinage-achats.csv` — récapitulatif des achats par type de lame
- `calepinage-chutes.csv` — liste des liens de réutilisation entre chutes

## Service Worker

| Fichier | Contenu |
| --- | --- |
| `public/sw.js` | Cache les assets au premier chargement (cache-first strategy) |
| `src/main.tsx` | Enregistrement du SW au démarrage |

L'application doit fonctionner intégralement sans connexion après le premier chargement.

## Références doc

- [project-management.md](../features/project-management.md) — description de l'export
- [architecture.md](../technical/architecture.md) — contrainte "aucune dépendance réseau"
