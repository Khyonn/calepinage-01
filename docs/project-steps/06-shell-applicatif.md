# Jalon 06 — Shell applicatif

**Valeur utilisateur :** l'application s'ouvre sur un projet immédiatement utilisable (dernier ouvert ou création auto), on gère ses projets, on configure la pose et le catalogue de lames, on personnalise le thème. Pas encore de canvas interactif — zone canvas vide mais présente.

Le polish UI de base (dark mode, nom projet éditable inline) est intégré ici plutôt que reporté : ces éléments vivent dans la topbar / le hamburger et structurent la première version livrable. **Le Service Worker est reporté hors de ce jalon** — pas nécessaire pour une première version jouable.

## Sous-étapes

| # | Titre | Fichier | Statut |
|---|---|---|---|
| 06.1 | Topbar + layout général | [06.1-topbar-layout.md](06.1-topbar-layout.md) | ⬜ |
| 06.2 | Gestionnaire de projets (reprise, auto-create) | [06.2-project-manager.md](06.2-project-manager.md) | ⬜ |
| 06.3 | Panneau contextuel `nav` (pose + catalogue) | [06.3-nav-panel.md](06.3-nav-panel.md) | ⬜ |
| 06.4 | Dark mode | [06.4-dark-mode.md](06.4-dark-mode.md) | ⬜ |

## Ordre et parallélisation

- 06.1 doit être fait en premier (base UI partagée).
- 06.2 et 06.3 dépendent de 06.1 mais peuvent se faire dans n'importe quel ordre.
- 06.4 peut démarrer dès 06.1 terminé — parallélisable avec 06.2/06.3.

## Dépendances

- Jalon 05 (domaine révisé) — ✅ merged.
- Aucune dépendance canvas : ce jalon livre une version utilisable sans SVG.

## Références doc transverses

- [features/ui-specifications.md](../features/ui-specifications.md) — tokens, topbar, panneaux, drawer.
- [features/interaction-modes.md](../features/interaction-modes.md) — panneaux contextuels par mode.
- [features/project-management.md](../features/project-management.md) — création, reprise, multi-projets.
- [wireframe-iterations/01-layout.html](../wireframe-iterations/01-layout.html) — prototype HTML.
