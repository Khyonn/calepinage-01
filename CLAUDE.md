# CLAUDE.md — Calepinage

## Démarrage de session

**Toujours commencer par lire [`docs/main.md`](docs/main.md)** avant toute action. Cette documentation est la **source de vérité** du projet : elle décrit l'application, ses fonctionnalités, les règles techniques et le glossaire.

Les sous-dossiers `docs/` ne doivent être chargés qu'à la demande, selon la tâche en cours :

| Dossier | Contenu |
| --- | --- |
| [`docs/project-steps/`](docs/project-steps/) | État d'avancement du développement, étapes réalisées |
| [`docs/features/`](docs/features/) | Spécifications détaillées de chaque fonctionnalité |
| [`docs/technical/`](docs/technical/) | Décisions d'architecture, ADR, choix techniques |
| [`docs/images/`](docs/images/) | Maquettes, wireframes, captures d'écran |

## Gestion des tokens

- Si une tâche nécessite une réflexion estimée à **plus de 5 minutes** ou risque de consommer trop de tokens, **poser des questions d'affinage à l'utilisateur avant de se lancer**.
- Toujours **réserver du budget token pour la mise à jour de la documentation** en fin de session.
- Pour les tâches complexes, utiliser `TaskCreate` pour découper et suivre la progression.

## Fin de session

Avant de terminer, vérifier si la documentation doit être mise à jour :
- Nouvelles décisions techniques prises dans la session
- Fonctionnalités implémentées ou modifiées
- Étapes de développement avancées (mettre à jour `docs/project-steps/`)

## Conventions de commit

Suivre les [Conventional Commits](https://www.conventionalcommits.org/) :

| Prefix | Usage | Impact tag |
| --- | --- | --- |
| `feat:` | Nouvelle fonctionnalité | bump version **majeure** |
| `fix:` | Correction de bug | bump version **mineure** |
| `docs:` | Documentation uniquement | bump version **patch** |
| `chore:` | Maintenance, config, dépendances | bump version **patch** |
| `refactor:` | Refactorisation sans changement de comportement | bump version **patch** |
| `test:` | Ajout ou modification de tests | bump version **patch** |

## Architecture du code

Voir [`docs/main.md`](docs/main.md) — section 5 pour les contraintes techniques complètes.

Structure `src/` :

```
src/
├── core/        ← logique métier pure — ZÉRO React, ZÉRO DOM
├── store/       ← état global (useReducer) + persistance IndexedDB
├── hooks/       ← hooks React + logique DOM extraite
└── components/  ← rendu JSX uniquement, aucune logique métier
```

**Règles strictes :**
- Taille max par fichier : **~150 lignes** — extraire si dépassement
- TypeScript strict : **pas de `any`**, unions discriminées narrowées, `import type` pour les types purs
- CSS : uniquement via **custom properties** définies dans `index.css`, jamais de valeur hexadécimale en dur

## Tests

- **Tests unitaires** : `src/core/__tests__/*.test.ts` — logique métier pure
- **Tests fonctionnels BDD** : `tests/features/*.feature` + `tests/features/steps/*.steps.ts`
- Runner : **Vitest** + **`@amiceli/vitest-cucumber`** pour les scénarios BDD
- Commande : `bun run test`

## Stack technique

```
React 19 + TypeScript (strict) + Vite
Persistance : IndexedDB (wrapper natif, sans librairie tierce)
Package manager : Bun
Tests : Vitest + @amiceli/vitest-cucumber
Déploiement : GitHub Pages via GitHub Actions
```
