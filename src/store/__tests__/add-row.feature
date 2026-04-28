# language: fr
Fonctionnalité: Ajout de rangées via le thunk addRow

  Contexte:
    Étant donné un projet "Test" avec une pièce "Salon" de 400×300 cm et un type de lame "Chêne" 120×12 cm sélectionnés

  Scénario: Ajouter une rangée à une pièce vide
    Quand je déclenche le thunk addRow
    Alors la pièce active contient 1 rangée
    Et la première rangée référence le type "Chêne"
    Et chaque segment de la rangée a un xOffset de 0

  Scénario: Ajouter plusieurs rangées successives
    Quand je déclenche le thunk addRow 3 fois
    Alors la pièce active contient 3 rangées
    Et toutes les rangées référencent le type "Chêne"

  Scénario: Ajouter une rangée consomme la chute de la rangée précédente
    Quand je déclenche le thunk addRow 2 fois
    Alors le xOffset du segment 0 de la rangée 2 consomme la chute de la rangée 1

  Scénario: Ajouter une rangée est ignoré quand la fin de la précédente dépasse Y max
    Quand je déclenche le thunk addRow 30 fois
    Alors la pièce active contient exactement 25 rangées
    Et le sélecteur indique qu'aucune rangée supplémentaire ne peut être ajoutée
