# Spécifications UI

Style Excalidraw : canvas plein écran, éléments UI flottants par-dessus. Référence visuelle : [`docs/wireframe-iterations/01-layout.html`](../wireframe-iterations/01-layout.html).

## Design tokens

Définis dans `src/index.css`. Toutes les valeurs sont exprimées via des custom properties — jamais de valeur en dur dans un composant.

### Palette — bordeaux vin

| Token | Clair | Sombre | Rôle |
| --- | --- | --- | --- |
| `--accent` | `#8B1A3A` | `#C4546A` | Actions, sélection, focus |
| `--accent-hover` | `#6D1430` | `#D4687C` | État hover des éléments accent |
| `--accent-light` | `rgba(139,26,58,.10)` | `rgba(196,84,106,.14)` | Fond des éléments sélectionnés |
| `--accent-border` | `rgba(139,26,58,.40)` | `rgba(196,84,106,.40)` | Bordure accent atténuée |
| `--danger` | `#dc2626` | `#f87171` | Erreurs, suppressions |
| `--warning` | `#d97706` | `#fbbf24` | Violations de contrainte |
| `--success` | `#16a34a` | `#4ade80` | Validation |

### Surfaces & texte

| Token | Clair | Sombre |
| --- | --- | --- |
| `--bg` | `#f5f4f4` | `#1c1a1a` |
| `--surface` | `#ffffff` | `#2a2727` |
| `--surface-raised` | `#faf9f9` | `#312e2e` |
| `--text` | `#1a1718` | `#f4f2f2` |
| `--text-muted` | `#78716c` | `#a8a29e` |
| `--text-disabled` | `#a8a29e` | `#6b6360` |

### Autres tokens

| Catégorie | Tokens |
| --- | --- |
| Forme | `--radius-sm` (4px) · `--radius` (8px) · `--radius-lg` (12px) |
| Ombres | `--shadow-sm` · `--shadow` · `--shadow-lg` |
| Espacements | `--space-1` à `--space-6` (4px → 24px) |
| Typographie | `--font-sans` · `--font-mono` · `--text-xs` (11px) à `--text-md` (15px) |

### Dark mode

Piloté par l'attribut `data-theme` sur `<html>` (`"light"` ou `"dark"`). Le choix "system" lit `prefers-color-scheme` au chargement et positionne l'attribut en conséquence. Voir [code-conventions.md](../technical/code-conventions.md).

### Canvas

| Token | Rôle |
| --- | --- |
| `--canvas-bg` | Fond du canvas |
| `--grid-color` | Couleur de la grille (toujours visible, même avec plan chargé) |
| `--room-fill` / `--room-stroke` | Pièces à l'état normal |
| `--room-active-fill` | Pièce active (mode `edit`) |
| `--room-dim-fill` / `--room-dim-stroke` | Pièces atténuées (mode `edit`, ou `plan`) |

---

## Composants atomiques

Tous dans `src/components/ui/`. Structure par dossier : `NomComposant/index.tsx` · `NomComposant/NomComposant.module.css` · `NomComposant/useNomComposant.ts` (si logique).

| Composant | Variantes / props notables |
| --- | --- |
| `Button` | `variant`: primary · secondary · ghost · danger — `size`: sm · md — `iconOnly` |
| `Input` | `label`, `error` — types text et number |
| `Textarea` | `label`, `error` — resize vertical |
| `Checkbox` | `label` |
| `Slider` | `label`, `unit`, `min/max/step` — affiche la valeur en temps réel |
| `RadioGroup` | `options`, navigation clavier ←→ — style segmented control |
| `Combobox` | `options`, filtre par saisie, navigation clavier ↑↓, `clearable` |
| `Dialog` | `title`, `actions` — portal, piégeage du focus, fermeture Échap |
| `Drawer` | panneau latéral droit — largeur variable entre `min(50vw, 20rem)` et `50vw`, redimensionnable par drag sur le bord gauche, toggle via topbar |

---

## Layout

### Topbar

Trois zones fixes :

| Zone | Contenu |
| --- | --- |
| Gauche | Bouton hamburger + nom du projet éditable (côte à côte) |
| Centre | Sélecteur de modes — voir [interaction-modes.md](interaction-modes.md) |
| Droite | Bouton toggle pour ouvrir/fermer le drawer tableaux |

**Nom du projet éditable** — bouton texte avec icône crayon au survol. Clic → champ texte. Validation par `Entrée` ou perte du focus.

**Menu hamburger** — popover au clic, sous-menus flyout à droite :
- **Nouveau projet** → "From scratch" / "À partir d'un projet existant"
- **Ouvrir un projet** → liste des projets existants
- **Exporter en CSV**
- **Supprimer le projet**
- **Thème** : switch dark / light / system

### Panneau contextuel (haut à gauche)

Collapsible via clic sur l'en-tête. Contenu variable selon le mode actif — voir [interaction-modes.md](interaction-modes.md).

### Drawer tableaux (droite)

- Se superpose au canvas (ne le pousse pas)
- Largeur variable entre `min(50vw, 20rem)` et `50vw`, redimensionnable par drag sur le bord gauche
- Toggle via bouton topbar droite
- Contenu : résumé des achats par type de lame, liens de réutilisation de chutes, bouton export CSV

### Helper contrôles (bas à gauche)

Panneau flottant collapsible, présent dans tous les modes. Libellés accessibles (ex. "Déplacer la vue" plutôt que "Pan").

### Canvas

- Grille toujours visible en fond, même lorsqu'un plan de fond est chargé
- Éléments du projet centrés à l'ouverture
