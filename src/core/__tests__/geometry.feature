# language: fr
Fonctionnalité: Géométrie — calibration et intersections

  Scénario: Calcul de l'échelle depuis une distance horizontale
    Quand je calibre avec deux points séparés de 3 px pour une distance réelle de 30 cm
    Alors l'échelle est de 10 cm par pixel

  Scénario: Calcul de l'échelle depuis une distance diagonale
    Quand je calibre avec deux points formant un triangle 3-4-5 pixels pour une distance réelle de 50 cm
    Alors l'échelle est de 10 cm par pixel

  Scénario: Extents d'une bande sur un L inversé étend vers le x minimum
    Quand je calcule les extents de la bande y=[0,20] sur le polygone L inversé (50,0) (200,0) (200,100) (0,100) (0,50)
    Alors il y a 1 segment
    Et le segment a x_start ≈ 30 et x_end = 200
