# Navigation dans le canvas

La navigation est disponible en permanence, **quel que soit le mode actif**.

## Raccourcis

| Action | Geste |
| --- | --- |
| Zoom centré sur la souris | `Ctrl + molette` |
| Pan libre | `Espace + clic gauche + glisser`, ou bouton milieu + glisser |
| Défilement vertical | Molette seule |
| Défilement horizontal | `Shift + molette` |

Pas de pan au clavier : les flèches seront réservées aux actions métier des modes à venir (déplacement de sélection, édition de sommets, etc.).

Un **panneau d'aide** en bas à gauche du canvas liste ces raccourcis en direct — c'est la source de vérité visuelle pour l'utilisateur, mise à jour au fil des modes (les raccourcis propres à chaque mode y seront ajoutés).

## Détail technique : interception du zoom

Le zoom est intercepté via un écouteur `wheel` natif enregistré avec `{ passive: false }`.

Ce détail est important : les écouteurs React sont enregistrés en mode **passif** par défaut, ce qui empêche d'appeler `preventDefault()` et laisse le navigateur zoomer la page entière sur `Ctrl + molette`. L'écouteur natif contourne cette limitation en interceptant l'événement avant qu'il ne remonte au navigateur.

## Détail technique : garde-focus formulaire

Les raccourcis clavier sont ignorés si le focus est sur un `input`, `textarea`, `select` ou un élément `contenteditable`. Cela évite qu'une frappe utilisateur dans un champ du panneau contextuel déclenche un raccourcis (ex. `Espace` qui aurait passé en mode grab au lieu d'ajouter une espace dans le texte).

La même règle s'applique au `keydown` de `Espace` qui active le curseur `grab` sur le SVG : il ne déclenche que si le SVG a explicitement le focus (via `tabIndex={0}` + clic ou `Tab`).
