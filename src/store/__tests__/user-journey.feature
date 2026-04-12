# language: fr
Fonctionnalité: Parcours utilisateur — cycle de vie d'un projet

  Scénario: Créer, peupler et supprimer un projet
    Quand je crée un projet nommé "Appartement"
    Alors le projet courant s'appelle "Appartement"
    Et la liste contient 1 projet
    Et aucune pièce n'est active

    Quand j'ajoute une pièce "Salon" de 400 cm de large au projet
    Alors le projet courant contient 1 pièce
    Et la pièce n'est pas encore sélectionnée

    Quand je sélectionne la pièce "Salon"
    Alors la pièce active est "Salon"

    Quand j'ajoute un type de lame "Chêne 120cm" de longueur 120 cm au catalogue
    Alors le catalogue contient 1 type de lame

    Quand j'ajoute une rangée avec un décalage de 0 cm dans la pièce "Salon"
    Alors la pièce active contient 1 rangée
    Et la rangée contient 4 lames calculées
    Et le calepinage ne présente aucune violation

    Quand je mets à jour la longueur minimale de lame à 40 cm
    Alors la longueur minimale est à 40 cm
    Et 1 violation est détectée

    Quand je supprime la rangée
    Alors la pièce active ne contient aucune rangée
    Et la suppression de la rangée efface les violations

    Quand je supprime la pièce "Salon"
    Alors le projet ne contient aucune pièce
    Et la sélection de pièce est réinitialisée

    Quand je supprime le projet
    Alors il n'y a pas de projet courant
    Et la liste est vide
