# language: fr
Fonctionnalité: Transformations de coordonnées

  Scénario: Conversion monde vers écran avec zoom et décalage
    Quand je convertis le point monde (10, 20) avec un zoom de 2 et un décalage de (5, 10)
    Alors le point écran est (25, 50)

  Scénario: Conversion monde vers écran sans transformation
    Quand je convertis le point monde (100, 200) avec un zoom de 1 et aucun décalage
    Alors le point écran est (100, 200)

  Scénario: La conversion écran vers monde est l'inverse de monde vers écran
    Soit le point monde (10, 20) converti vers l'écran avec un zoom de 2 et un décalage de (5, 10)
    Quand je reconvertis ce point vers le repère monde
    Alors j'obtiens le point monde d'origine (10, 20)

  Scénario: Calcul de l'échelle depuis une distance horizontale
    Quand je calibre avec deux points séparés de 3 px pour une distance réelle de 30 cm
    Alors l'échelle est de 10 cm par pixel

  Scénario: Calcul de l'échelle depuis une distance diagonale
    Quand je calibre avec deux points formant un triangle 3-4-5 pixels pour une distance réelle de 50 cm
    Alors l'échelle est de 10 cm par pixel
