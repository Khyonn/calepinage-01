# Sous-étape NN.M — <Titre court>

> Template pour toute sous-étape de la roadmap (jalons 06 → 12). Un fichier `NN.M-slug.md` décrit **une unité de travail exécutable** apportant une valeur observable à l'utilisateur final.

## 1. Objectif utilisateur

Une seule phrase, formulée du point de vue de l'utilisateur. Doit être observable (pas un "implémenter X").

> Exemple : "L'utilisateur peut créer un nouveau projet vide depuis le menu hamburger et le retrouver au prochain chargement."

## 2. Dépendances

- Sous-étapes **prérequises** (doivent être terminées avant de démarrer celle-ci).
- Mentionner aussi les dépendances **soft** (ex. "peut démarrer sans X mais sera plus complet avec X").

## 3. Fichiers à créer / modifier

Lister les chemins explicites. Séparer création et modification. Préciser les composants atomiques UI à réutiliser (déjà dans `src/components/ui/`).

**Créer :**
- `src/.../Foo/index.tsx`
- `src/.../Foo/Foo.module.css`
- `src/.../Foo/useFoo.ts` (si logique)

**Modifier :**
- `src/.../Bar.tsx` (ajouter tel handler)
- `src/store/xxxSlice.ts` (ajouter telle action)

## 4. Comportement attendu

Checklist observable. Chaque ligne est un cas concret que l'utilisateur (ou un test) peut vérifier. Privilégier l'énumération courte à la prose.

- [ ] Au clic sur X, Y se produit.
- [ ] Si Z est absent, un message "…" s'affiche.
- [ ] Le raccourci `…` déclenche l'action `…` sauf si le focus est sur un formulaire.

## 5. Tests

- **Unitaires** (`src/core/__tests__/*.test.ts`) — pour toute logique pure ajoutée au domaine.
- **BDD** (`tests/features/*.feature` + `.steps.ts`) — pour les cas d'usage métier. Scénarios orientés usage utilisateur, pas transitions reducer. Assertions via selectors uniquement.
- **Tests composants / UI** — à ce stade du projet, non imposés (pas d'infra Playwright/Testing Library). Documenter à la place le protocole de test manuel dans la section 7.

## 6. Références doc

Lien explicite vers les fichiers `docs/features/*.md` et `docs/technical/*.md` qui cadrent cette sous-étape. L'agent doit lire ces fichiers avant d'écrire du code.

- [features/…](../features/….md)
- [technical/…](../technical/….md)
- [ui-specifications.md](../features/ui-specifications.md) — **toujours à consulter pour le layout et les tokens**.

## 7. Critères d'acceptation

Conditions de merge. Chaque item doit être cochable sans subjectivité.

- [ ] `bun run test` passe (aucune régression).
- [ ] `tsc --noEmit` passe (pas de `any`, pas de type cassé).
- [ ] Comportement manuel vérifié dans le navigateur (lister les clics exacts).
- [ ] Doc mise à jour si l'implémentation a révélé une divergence avec la spec (voir `CLAUDE.md`).
- [ ] Aucune convention code violée (taille fichier ≤ 150 lignes, pas d'hex en dur en CSS, `import type` pour les types purs).

## Notes pour l'agent

- Ne jamais committer ni pusher sans consigne explicite de l'utilisateur.
- Ne pas dépasser le périmètre décrit ici — si un besoin non anticipé émerge, l'insérer comme nouvelle sous-étape (`NN.M.extra-…`) plutôt que l'absorber.
- Toujours relire `CLAUDE.md` et `docs/README.md` en début de session.
