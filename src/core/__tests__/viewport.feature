# language: fr
Fonctionnalité: Viewport — conversions et échelles

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

  Scénario: Zoom borné au minimum
    Quand je clampe le zoom 0.01
    Alors le zoom résultant est 0.1

  Scénario: Zoom borné au maximum
    Quand je clampe le zoom 100
    Alors le zoom résultant est 10

  Scénario: Zoom autour d'un point garde le point écran invariant
    Soit un viewport zoom 2 décalage (50, 60) et le point écran (100, 80)
    Quand je zoome de facteur 1.5 autour de ce point
    Alors le point monde sous le point écran est inchangé

  Scénario: Échelle ronde pour un span donné
    Quand je choisis l'échelle ronde pour un span monde de 37 cm
    Alors la valeur est 20 et l'unité cm

  Scénario: Échelle ronde bascule en mètres au-delà de 1 m
    Quand je choisis l'échelle ronde pour un span monde de 240 cm
    Alors la valeur est 2 et l'unité m
