# Étape 01 — Meta-configuration du projet

**Statut : terminé** — 2026-04-12

## Ce qui a été mis en place

### Fichiers de configuration

| Fichier | Modification |
| --- | --- |
| `CLAUDE.md` | Instructions de session pour les agents Claude |
| `vite.config.ts` | Alias `@/` → `src/`, base URL `/calepinage-01/` pour GitHub Pages |
| `tsconfig.app.json` | `strict: true`, alias `@/*` via `baseUrl` + `paths`, `ignoreDeprecations: "6.0"` |
| `vitest.config.ts` | Config Vitest — alias `@/`, globals, include patterns |
| `package.json` | Scripts `test` et `test:watch`, dépendances `vitest@^4.1.4` et `@amiceli/vitest-cucumber@^6.3.0` |

### GitHub Actions

| Workflow | Déclencheur | Ce qu'il fait |
| --- | --- | --- |
| `.github/workflows/ci.yml` | Pull request vers `main` | Vérification TypeScript (`tsc -b`), build Vite, exécution des tests |
| `.github/workflows/deploy.yml` | Push sur `main` | Build → déploiement GitHub Pages → création d'un tag git versionné |

### Conventions de versioning automatique

Lors d'un push sur `main`, le workflow `deploy.yml` crée un tag git en fonction du préfixe du message de commit :

| Préfixe | Action |
| --- | --- |
| `feat:` | Bump version **majeure** (ex: `v1.0.0` → `v2.0.0`) |
| `fix:` | Bump version **mineure** (ex: `v1.0.0` → `v1.1.0`) |
| Autres | Bump version **patch** (ex: `v1.0.0` → `v1.0.1`) |

### Structure de tests

```
src/
  core/
    __tests__/     ← tests unitaires (*.test.ts)
tests/
  features/        ← fichiers .feature (Gherkin)
    steps/         ← définitions de steps (*.steps.ts)
```

## Décisions techniques notables

- **Bun** comme package manager (détecté via `bun.lock` existant)
- **vitest@4.x** requis par `@amiceli/vitest-cucumber@6.x` (peer dependency)
- **`ignoreDeprecations: "6.0"`** dans tsconfig : TypeScript 6 déprécie `baseUrl` standalone ; migration vers la nouvelle résolution à prévoir dans une version future
- **`--passWithNoTests`** sur le script `test` : évite l'échec CI quand le répertoire de tests est vide en début de projet

## Prochaines étapes

Voir [`docs/project-steps/`](./) pour la suite.

Prochaine étape suggérée : définir les types du domaine (`src/core/types.ts`) et la logique métier pure (`core/`).
