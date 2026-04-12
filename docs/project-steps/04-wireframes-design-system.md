# Étape 04 — Wireframes & design system

**Statut : à faire** — peut être parallélisée avec l'étape 03

## Périmètre

Définir l'apparence de l'application avant d'implémenter les composants métier. Deux livrables : les wireframes dans `docs/images/` et les composants atomiques réutilisables.

## Wireframes

Fichiers SVG à produire dans `docs/images/` :

| Fichier | Contenu |
| --- | --- |
| `docs/images/layout.svg` | Structure générale : canvas SVG central, panneaux latéraux, barre d'outils |
| `docs/images/toolbar.svg` | Barre d'outils avec les 4 modes + sélecteur de pièce active |
| `docs/images/panel-project.svg` | Panneau projet : liste des projets, paramètres de pose, catalogue de lames |
| `docs/images/panel-results.svg` | Panneau résultats : tableau récapitulatif + bouton export CSV |

## Design system — `index.css`

Compléter les custom properties :
- Couleurs (déjà définies pour le canvas, à étendre pour l'UI)
- Typographie (font-family, tailles, line-height)
- Spacing (échelle cohérente)
- Border-radius, shadows

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

`src/components/ui/Demo.tsx` — page isolée listant tous les composants dans leurs variantes. Supprimée une fois l'intégration terminée.

## Références doc

- [code-conventions.md](../technical/code-conventions.md) — custom properties CSS, jamais de valeurs en dur
- [interaction-modes.md](../features/interaction-modes.md) — icônes suggérées pour la toolbar (Lucide)
