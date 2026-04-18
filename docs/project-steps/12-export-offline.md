# Étape 12 — Export CSV & mode hors-ligne

**Statut : à faire** — dépend de l'étape 11

## Périmètre

Finaliser les deux fonctionnalités "sortie" de l'application : l'export CSV des résultats et le Service Worker pour le fonctionnement hors-ligne.

## Export CSV

| Fichier | Contenu |
| --- | --- |
| `src/core/exportCsv.ts` | Fonctions pures `summaryToCsv()` et `offcutLinksToCsv()` → chaînes CSV |
| `src/components/ui/DrawerPanel/` | Bouton "Exporter CSV" → déclenche le téléchargement via `<a download>` |

Deux fichiers exportés :
- `calepinage-achats.csv` — récapitulatif des achats par type de lame
- `calepinage-chutes.csv` — liste des liens de réutilisation entre chutes

## Service Worker

Utiliser le plugin **`vite-plugin-pwa`** plutôt qu'un SW manuel — gestion du cache, précaching des assets et stratégie cache-first inclus.

| Fichier | Contenu |
| --- | --- |
| `vite.config.ts` | Ajout du plugin `vite-plugin-pwa` avec configuration du manifest |
| `src/main.tsx` | Enregistrement du SW au démarrage (via le virtual module du plugin) |

L'application doit fonctionner intégralement sans connexion après le premier chargement.

## Références doc

- [project-management.md](../features/project-management.md) — description de l'export
- [technical/architecture.md](../technical/architecture.md) — contrainte "aucune dépendance réseau"
