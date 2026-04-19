# language: fr
Fonctionnalité: Calibration — calcul d'échelle pixels → cm

  Scénario: Pas de calibration retourne une échelle neutre
    Quand je calcule l'échelle sans calibration
    Alors l'échelle vaut 1

  Scénario: Points distants de 150 pixels pour une distance réelle de 300 cm
    Soit une calibration avec les points (0, 0) et (150, 0) pour une distance réelle de 300 cm
    Quand je calcule l'échelle
    Alors l'échelle vaut 2

  Scénario: Points distants en diagonale
    Soit une calibration avec les points (0, 0) et (30, 40) pour une distance réelle de 100 cm
    Quand je calcule l'échelle
    Alors l'échelle vaut 2

  Scénario: Points confondus retourne une échelle neutre
    Soit une calibration avec les points (50, 50) et (50, 50) pour une distance réelle de 100 cm
    Quand je calcule l'échelle
    Alors l'échelle vaut 1
