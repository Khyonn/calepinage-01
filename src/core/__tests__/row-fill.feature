# language: fr
Fonctionnalité: Remplissage automatique des rangées

  Contexte:
    Soit un type de lame de longueur 120 cm et largeur 14 cm
    Et des paramètres de pose avec une cale de 5 cm et une largeur de scie de 0.1 cm et une longueur minimale de 30 cm

  Scénario: Rangée démarrant avec une planche entière
    Soit une pièce de largeur 400 cm
    Quand je remplis une rangée avec un décalage de 0 cm
    Alors la rangée contient 4 lames
    Et la première lame mesure 120 cm
    Et la dernière lame mesure 30 cm

  Scénario: Rangée démarrant avec une chute
    Soit une pièce de largeur 400 cm
    Quand je remplis une rangée avec un décalage de 50 cm
    Alors la rangée contient 4 lames
    Et la première lame mesure 70 cm
    Et la dernière lame mesure 80 cm

  Scénario: Rangée sans coupe finale (fit exact)
    Soit une pièce de largeur 370 cm
    Quand je remplis une rangée avec un décalage de 0 cm
    Alors la rangée contient 3 lames
    Et chaque lame mesure 120 cm

  Scénario: Calcul de la chute générée en fin de rangée
    Soit une pièce de largeur 400 cm
    Quand je calcule la chute d'une rangée avec un décalage de 0 cm
    Alors la chute mesure 89.9 cm

  Scénario: Aucune chute quand le fit est exact
    Soit une pièce de largeur 370 cm
    Quand je calcule la chute d'une rangée avec un décalage de 0 cm
    Alors il n'y a pas de chute
