# Étape 11 — Panneaux & layout

**Statut : à faire** — dépend des étapes 04, 09

## Périmètre

Implémenter tous les éléments d'interface autour du canvas : topbar, panneau contextuel (gauche), drawer tableaux (droite), helper contrôles (bas gauche). S'appuie sur les composants atomiques de l'étape 04.

## Fichiers à créer

Structure par dossier : `NomComposant/index.tsx` · `NomComposant/NomComposant.module.css` · `NomComposant/useNomComposant.ts` (si logique).

| Fichier | Contenu |
| --- | --- |
| `src/components/ui/Topbar/` | Hamburger + nom projet éditable + sélecteur de modes + toggle drawer |
| `src/components/ui/ContextPanel/` | Panneau collapsible gauche — contenu variable selon le mode actif |
| `src/components/ui/CatalogSection/` | Catalogue de lames : CRUD, badge d'utilisation, guards dimensions/suppression |
| `src/components/ui/PoseParamsSection/` | Formulaire des 4 paramètres de pose |
| `src/components/ui/DrawerPanel/` | Panneau droit overlay : résumé achats, liens réutilisation, export CSV |
| `src/components/ui/DrawerPanel/useResults.ts` | Calcule `computeSummary()` et `computeOffcutLinks()` sur l'état courant |
| `src/components/ui/HelperControls/` | Panneau flottant bas gauche collapsible — libellés accessibles par mode |

## Contenu du panneau contextuel par mode

| Mode | Contenu |
| --- | --- |
| `nav` | Paramètres de pose + catalogue de lames |
| `draw` | Instructions de tracé + renvoi helper contrôles |
| `plan` | Import image + slider opacité + boutons rotation + déclencheur calibration |
| `edit` | Catalogue de lames + liste des rangées de la pièce active + bouton "Ajouter une rangée" |

## Comportement attendu

### Catalogue de lames

- Affichage par type : nom + dimensions + badge d'utilisation + boutons d'action
- Type utilisé dans une rangée : dimensions en lecture seule, suppression désactivée (guards déjà en place côté store — étape 05)
- Type non utilisé : toutes les propriétés modifiables, suppression disponible

### Paramètres de pose

- Modification → recalcul immédiat de toutes les rangées (dérivé, jamais stocké)

### Drawer tableaux

- Se superpose au canvas (ne le pousse pas)
- Largeur variable `min(50vw, 20rem)` → `50vw`, redimensionnable par drag sur le bord gauche
- Résultats toujours à jour (dérivés via `useResults`)

### Topbar

- Nom du projet : bouton texte + icône crayon au survol → champ texte au clic, validation `Entrée` ou perte de focus
- Menu hamburger : Nouveau projet (scratch / clone) · Ouvrir projet · Exporter CSV · Supprimer projet · Thème (dark/light/system)

## Références doc

- [ui-specifications.md](../features/ui-specifications.md) — layout, composants atomiques, design tokens
- [interaction-modes.md](../features/interaction-modes.md) — contenu du panneau contextuel par mode
- [project-management.md](../features/project-management.md) — règles catalogue et résultats
