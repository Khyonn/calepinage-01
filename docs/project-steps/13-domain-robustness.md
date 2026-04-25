# Jalon 13 — Robustesse domaine & portabilité

**Valeur utilisateur :** quatre corrections / ajouts côté domaine et données. Les trois premiers étaient prévus, le quatrième a été ouvert en cours de jalon après tests manuels sur un projet utilisateur réel.

1. L'ajout / le cascade automatique d'une rangée ne produit plus de dernière lame courte quand on peut l'éviter : la réutilisation de la chute précédente est bornée pour respecter `minPlankLength`.
2. La dernière rangée d'une pièce s'affiche correctement, y compris quand la hauteur restante est inférieure à la moitié de la largeur de lame.
3. L'utilisateur peut exporter un projet complet (catalogue, pose, pièces, rangées, plan de fond) en JSON, puis le réimporter — sauvegarde, partage, migration.
4. La pose auto reste cohérente sur pièces **non rectangulaires** (segWidth réel vs bbox), respecte la première lame et `minRowGap`, et l'**ordre des rangées** est préservé d'une session à l'autre.

Ce jalon regroupe des améliorations **à faible couplage UI** : elles touchent principalement `src/core/*`, `src/persistence/*` et les thunks. Idéal comme première passe après jalon 12 — zéro dépendance sur les refontes UI des jalons 14 et 15.

## Sous-étapes

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 13.1 | Pose auto : respecter `minPlankLength` | [13.1-pose-min-length.md](13.1-pose-min-length.md) | ✅ |
| 13.2 | Fix dernière rangée invisible | [13.2-last-row-visible.md](13.2-last-row-visible.md) | ✅ |
| 13.3 | Export / Import JSON | [13.3-json-import-export.md](13.3-json-import-export.md) | ✅ |
| 13.4 | Robustesse pose auto, géométrie réelle, ordre persisté | [13.4-robustesse-pose-persistance.md](13.4-robustesse-pose-persistance.md) | ✅ |

## Ordre et parallélisation

- 13.1, 13.2, 13.3 ont été livrés en parallèle (faible couplage).
- 13.4 a été ouvert en réaction aux tests sur projet utilisateur réel après livraison de 13.1–13.3 — étend le bornage et corrige la persistance de l'ordre. À reproduire en méthode pour les prochains jalons : tester sur données réelles avant clôture.

## Dépendances

- Jalon 10 ✅ (rangées + segments).
- Jalon 11 ✅ (cascade `propagateOffcuts` — réutilisée par 13.1).
- Jalon 12 ✅ (export CSV — 13.3 s'aligne sur le pattern hamburger).
- Aucune nouvelle dépendance externe.

## Références doc transverses

- [features/row-fill.md](../features/row-fill.md) — algo de remplissage, à mettre à jour pour 13.1.
- [features/row-drag.md](../features/row-drag.md) — cascade, impactée par 13.1.
- [features/project-management.md](../features/project-management.md) — à mettre à jour pour 13.3.
- [technical/data-model.md](../technical/data-model.md) — schéma JSON v1 à documenter.

## Ce qui n'est PAS couvert

- Refonte du drawer / tableau résumé → jalon 14.
- Fusion des modes `nav` / `edit` → jalon 15.
- Clonage de projet depuis un autre projet existant → 15.5 (utilisera les primitives introduites par 13.3 pour la régénération d'ids + le remap des références).
- PWA / Service Worker → backlog hors roadmap.
