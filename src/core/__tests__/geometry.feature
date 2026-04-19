# language: fr
Fonctionnalité: Géométrie — calibration

  Scénario: Calcul de l'échelle depuis une distance horizontale
    Quand je calibre avec deux points séparés de 3 px pour une distance réelle de 30 cm
    Alors l'échelle est de 10 cm par pixel

  Scénario: Calcul de l'échelle depuis une distance diagonale
    Quand je calibre avec deux points formant un triangle 3-4-5 pixels pour une distance réelle de 50 cm
    Alors l'échelle est de 10 cm par pixel
