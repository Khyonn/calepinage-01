# Étapes de développement

## Étapes fondatrices (terminées)

| Étape | Fichier | Statut |
| --- | --- | --- |
| 01 — Meta-setup | [01-meta-setup.md](01-meta-setup.md) | ✅ Terminé |
| 02 — Domaine core | [02-domain-core.md](02-domain-core.md) | ✅ Terminé |
| 03 — Store & persistance | [03-store.md](03-store.md) | ✅ Terminé |
| 04 — Wireframes & design system | [04-wireframes-design-system.md](04-wireframes-design-system.md) | ✅ Terminé |
| 05 — Révision domaine & store | [05-domain-review.md](05-domain-review.md) | ✅ Terminé |

## Roadmap applicative (jalons 06 → 12)

Chaque jalon apporte une valeur utilisateur observable. Les sous-étapes `NN.M` sont découpées pour être exécutables par un agent léger (cf. [`_template.md`](_template.md)).

### Jalon 06 — Shell applicatif
[06-shell-applicatif.md](06-shell-applicatif.md) — l'application s'ouvre, on gère ses projets, on configure la pose et le catalogue, dark mode et hors-ligne fonctionnent.

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 06.1 | Topbar + layout général | [06.1-topbar-layout.md](06.1-topbar-layout.md) | ⬜ |
| 06.2 | Gestionnaire de projets (reprise + auto-create) | [06.2-project-manager.md](06.2-project-manager.md) | ⬜ |
| 06.3 | Panneau contextuel en mode `nav` | [06.3-nav-panel.md](06.3-nav-panel.md) | ⬜ |
| 06.4 | Dark mode | [06.4-dark-mode.md](06.4-dark-mode.md) | ⬜ |

### Jalon 07 — Canvas SVG navigable
[07-canvas-navigable.md](07-canvas-navigable.md) — on peut se déplacer dans l'espace monde, grille, zoom/pan.

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 07.1 | Scene + viewport + grille | [07.1-scene-viewport.md](07.1-scene-viewport.md) | ⬜ |
| 07.2 | Événements natifs pan/zoom | [07.2-canvas-events.md](07.2-canvas-events.md) | ⬜ |
| 07.3 | Raccourcis clavier + helper | [07.3-keyboard-helper.md](07.3-keyboard-helper.md) | ⬜ |

### Jalon 08 — Plan de fond
[08-background-plan.md](08-background-plan.md) — import, repositionnement et calibration du plan de fond.

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 08.1 | Mode `plan` + import image | [08.1-plan-import.md](08.1-plan-import.md) | ✅ |
| 08.2 | Repositionnement | [08.2-plan-reposition.md](08.2-plan-reposition.md) | ✅ |
| 08.3 | Calibration | [08.3-calibration.md](08.3-calibration.md) | ✅ |

### Jalon 09 — Pièces dessinées et éditables
[09-rooms.md](09-rooms.md) — tracé de polygones avec snap axial, rendu, édition de sommets.

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 09.1 | Mode `draw` : tracé polygone | [09.1-room-draw.md](09.1-room-draw.md) | ✅ |
| 09.2 | Composant `Room` : rendu | [09.2-room-render.md](09.2-room-render.md) | ✅ |
| 09.3 | Mode `edit` sans rangées | [09.3-room-edit-vertices.md](09.3-room-edit-vertices.md) | ✅ |

### Jalon 10 — Rangées et calepinage
[10-rows-calepinage.md](10-rows-calepinage.md) — ajout de rangées, rendu segments/lames, annotations et violations.

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 10.1 | Ajouter une rangée | [10.1-add-row.md](10.1-add-row.md) | ✅ |
| 10.2 | Composants `Row` / `Segment` | [10.2-row-segment-render.md](10.2-row-segment-render.md) | ✅ |
| 10.3 | Annotations de réutilisation | [10.3-annotations.md](10.3-annotations.md) | ✅ |
| 10.4 | Violations de contraintes | [10.4-constraint-violations.md](10.4-constraint-violations.md) | ✅ |

### Jalon 11 — Drag interactif des segments
[11-drag-segments.md](11-drag-segments.md) — drag souris, preview temps réel, cascade au release.

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 11.1 | Drag segment + preview | [11.1-drag-preview.md](11.1-drag-preview.md) | ✅ |
| 11.2 | Cascade offcut-links au release | [11.2-cascade-offcut.md](11.2-cascade-offcut.md) | ✅ |

### Jalon 12 — Résultats et export
[12-results-export.md](12-results-export.md) — drawer résumé, tableau des réutilisations, export CSV.

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 12.1 | Drawer droit : résumé matière | [12.1-drawer-summary.md](12.1-drawer-summary.md) | ✅ |
| 12.2 | Tableau des liens de réutilisation | [12.2-offcut-table.md](12.2-offcut-table.md) | ✅ |
| 12.3 | Export CSV | [12.3-export-csv.md](12.3-export-csv.md) | ✅ |

## Roadmap polish (jalons 13 → 15)

Après la livraison du jalon 12, retours d'usage → trois jalons polish ciblent la robustesse domaine, le drawer de résumé, et la navigation générale.

### Jalon 13 — Robustesse domaine & portabilité
[13-domain-robustness.md](13-domain-robustness.md) — pose auto bornée par `minPlankLength`, fix rendu dernière rangée, export/import JSON, robustesse pose auto et persistance.

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 13.1 | Pose auto : respecter `minPlankLength` | [13.1-pose-min-length.md](13.1-pose-min-length.md) | ✅ |
| 13.2 | Fix dernière rangée invisible (`R < plankWidth/2`) | [13.2-last-row-visible.md](13.2-last-row-visible.md) | ✅ |
| 13.3 | Export / Import JSON | [13.3-json-import-export.md](13.3-json-import-export.md) | ✅ |
| 13.4 | Robustesse pose auto, géométrie réelle, ordre persisté | [13.4-robustesse-pose-persistance.md](13.4-robustesse-pose-persistance.md) | ✅ |

### Jalon 14 — Drawer résumé & récapitulatif
[14-drawer-recap.md](14-drawer-recap.md) — primitive tooltip, restructuration tableau coûts, récapitulatif par rangée avec hover granulaire.

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 14.1 | Primitive `Tooltip` (design system) | [14.1-tooltip-primitive.md](14.1-tooltip-primitive.md) | ⬜ |
| 14.2 | SummaryTable : colonnes « Lames / Quantité / Coût unit. / Coût total » | [14.2-summary-columns.md](14.2-summary-columns.md) | ⬜ |
| 14.3 | Récapitulatif par rangée avec hover granulaire | [14.3-row-recap.md](14.3-row-recap.md) | ⬜ |

### Jalon 15 — Navigation & menus
[15-navigation-menus.md](15-navigation-menus.md) — fusion `nav`/`edit`, auto-fit viewport, menus hiérarchiques, import/clone de projet.

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 15.1 | Catalogue & pose params visibles en édition | [15.1-catalog-in-edit.md](15.1-catalog-in-edit.md) | ⬜ |
| 15.2 | Fusion modes `nav` + `edit` | [15.2-merge-nav-edit.md](15.2-merge-nav-edit.md) | ⬜ |
| 15.3 | Auto-fit viewport à l'ouverture | [15.3-viewport-autofit.md](15.3-viewport-autofit.md) | ⬜ |
| 15.4 | Ouvrir projet via sous-menu | [15.4-open-submenu.md](15.4-open-submenu.md) | ⬜ |
| 15.5 | Nouveau projet — sous-menu scratch / import / clone | [15.5-new-submenu.md](15.5-new-submenu.md) | ⬜ |

## Remarques

- **Service Worker / mode hors-ligne** reste hors roadmap polish. À cadrer en jalon dédié si besoin (manifest + `vite-plugin-pwa`).
- Structure attendue pour une sous-étape : voir [`_template.md`](_template.md).
- Parallélisation possible au sein d'un jalon : voir la section "Ordre et parallélisation" de chaque fichier `NN-…md`.
- Les étapes peuvent être insérées en cours de route si une décision de conception révèle des besoins non anticipés — renuméroter les suivantes en conséquence.
