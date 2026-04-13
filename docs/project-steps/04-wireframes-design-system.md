# Étape 04 — Wireframes & design system

**Statut : terminé**

## Périmètre

Définir l'apparence de l'application avant d'implémenter les composants métier.

## ✅ Wireframe

Prototype HTML autonome itéré jusqu'à validation. Itération finale : [`docs/wireframe-iterations/01-layout.html`](../wireframe-iterations/01-layout.html).

Layout et comportements documentés dans :
- [ui-specifications.md](../features/ui-specifications.md) — structure, panneaux, drawer, helper
- [interaction-modes.md](../features/interaction-modes.md) — comportement par mode, règles catalogue

## Design tokens — `index.css`

Définir le jeu complet de custom properties :

| Catégorie | Exemples |
| --- | --- |
| Couleurs | palette principale, états (hover, active, disabled), sémantique (danger, warning) |
| Typographie | font-family, tailles, line-height, font-weight |
| Espacements | échelle cohérente (4px, 8px, 12px, 16px…) |
| Formes | border-radius, shadows |

Chaque token doit avoir une variante `[data-theme="dark"]` — voir [code-conventions.md](../technical/code-conventions.md).

## Composants atomiques

Fichiers à créer dans `src/components/ui/` — **aucune logique métier**, style uniquement :

| Composant | Notes |
| --- | --- |
| `Button.tsx` | Variantes : primary, secondary, ghost, danger |
| `Input.tsx` | Text, number — avec label et message d'erreur |
| `Textarea.tsx` | Redimensionnable verticalement |
| `Checkbox.tsx` | Avec label |
| `Combobox.tsx` | Utilise l'attribut `popover` (natif HTML) pour le dropdown |

## Page de démo

`src/components/ui/Demo.tsx` — page isolée listant tous les composants dans leurs variantes, en mode clair et sombre. Supprimée une fois l'intégration terminée.

## Références doc

- [ui-specifications.md](../features/ui-specifications.md) — structure visuelle de l'interface
- [interaction-modes.md](../features/interaction-modes.md) — comportement par mode
- [code-conventions.md](../technical/code-conventions.md) — custom properties CSS, jamais de valeurs en dur
