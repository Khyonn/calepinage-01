# Navigation dans le canvas

La navigation est disponible en permanence, **quel que soit le mode actif**.

## Raccourcis

| Action | Geste |
| --- | --- |
| Zoom centré sur la souris | `Ctrl + molette` |
| Pan libre | Clic gauche + glisser (mode Navigation), ou bouton milieu partout |
| Pan au clavier | `Ctrl + ↑ ↓ ← →` |
| Défilement vertical | Molette seule |
| Défilement horizontal | `Shift + molette` |

## Détail technique : interception du zoom

Le zoom est intercepté via un écouteur `wheel` natif enregistré avec `{ passive: false }`.

Ce détail est important : les écouteurs React sont enregistrés en mode **passif** par défaut, ce qui empêche d'appeler `preventDefault()` et laisse le navigateur zoomer la page entière sur `Ctrl + molette`. L'écouteur natif contourne cette limitation en interceptant l'événement avant qu'il ne remonte au navigateur.
