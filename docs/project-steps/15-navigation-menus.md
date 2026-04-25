# Jalon 15 — Navigation & menus

**Valeur utilisateur :** refonte de la navigation globale pour réduire la friction d'usage quotidien.

1. Le catalogue et les paramètres de pose restent visibles quand on édite une pièce (précurseur indispensable à la fusion).
2. Les modes `nav` et `edit` fusionnent en un seul mode « travail » — l'édition des sommets ou des rangées est conditionnée uniquement à la pièce active, plus au choix d'un mode distinct. `draw` et `plan` restent séparés.
3. À l'ouverture d'un projet, le viewport s'ajuste automatiquement pour centrer le contenu (pièces + plan de fond) avec un padding.
4. Le dialog « Ouvrir un projet » disparaît au profit d'un sous-menu directement dans le hamburger.
5. L'entrée « Nouveau projet » devient parent de trois options : depuis rien, depuis un fichier JSON (réutilise 13.3), depuis un clonage d'un projet existant (avec checkboxes : catalogue / pose / plan / pièces / rangées).

## Sous-étapes

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 15.1 | Catalogue & pose params visibles en édition | [15.1-catalog-in-edit.md](15.1-catalog-in-edit.md) | ⬜ |
| 15.2 | Fusion modes `nav` + `edit` | [15.2-merge-nav-edit.md](15.2-merge-nav-edit.md) | ⬜ |
| 15.3 | Auto-fit viewport à l'ouverture | [15.3-viewport-autofit.md](15.3-viewport-autofit.md) | ⬜ |
| 15.4 | Ouvrir projet via sous-menu | [15.4-open-submenu.md](15.4-open-submenu.md) | ⬜ |
| 15.5 | Nouveau projet — sous-menu scratch / import / clone | [15.5-new-submenu.md](15.5-new-submenu.md) | ⬜ |

## Ordre et parallélisation

- 15.1 d'abord (précurseur léger qui élimine la divergence doc/code).
- 15.2 après 15.1 (les deux panneaux fusionnent plus simplement si le catalogue est déjà partagé).
- 15.3 indépendant — peut démarrer dès que 15.1 est bouclé (ou en parallèle).
- 15.4 et 15.5 partagent la même primitive `ui/Menu/` (sous-menu cascade). Faire 15.4 en premier pour créer la primitive, 15.5 enchaîne et ajoute les options de clonage.
- 15.5 dépend de 13.3 (import JSON) — doit être planifiée **après** la livraison du jalon 13.

## Dépendances

- Jalon 06 ✅ (topbar, hamburger).
- Jalon 13.3 ✅ (import JSON, remap d'ids — prérequis pour 15.5).
- Jalon 09 ✅ (édition de sommets).
- Jalon 10 ✅ (édition de rangées).

## Ce qui n'est PAS couvert

- Modification du domaine ou du calcul — uniquement UX et navigation.
- Nouvelle primitive tooltip → traitée en 14.1.
- PWA / Service Worker → backlog.

## Références doc transverses

- [features/interaction-modes.md](../features/interaction-modes.md) — refonte complète pour 15.2.
- [features/canvas-navigation.md](../features/canvas-navigation.md) — section auto-fit à ajouter.
- [features/project-management.md](../features/project-management.md) — sections clone / sous-menus à compléter.
