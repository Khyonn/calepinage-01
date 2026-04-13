# Étape 12 — Polish & finalisation

**Statut : à faire** — dépend de toutes les étapes précédentes

## Périmètre

Révision globale avant livraison : accessibilité, couverture de tests, cohérence visuelle et cas limites.

## Accessibilité

- Navigation clavier complète (focus visible, tab order logique)
- Attributs `aria` sur les éléments interactifs non-standard (canvas, drag handles)
- Contrastes conformes WCAG AA
- Labels explicites sur tous les champs de formulaire

## Tests

- Compléter la couverture des tests unitaires `core/` (cas limites : pièce très étroite, chutes toutes invalides, catalogue vide…)
- Scénarios BDD couvrant les parcours utilisateur complets (étape 02 → 10)
- Vérifier que tous les tests passent en CI

## Révisions potentielles

Zone à réévaluer après implémentation des étapes précédentes :
- Pertinence du clonage de projet (fonctionnalité envisagée, voir [project-management.md](../features/project-management.md))
- `yOffset` sur `Row` — décalage vertical inter-pièces (complexité vs valeur)
- Performance du recalcul à chaque rendu sur de grands projets (nombreuses pièces/rangées)

## Références doc

- [code-conventions.md](../technical/code-conventions.md)
- [technical/architecture.md](../technical/architecture.md)
