# language: fr
Fonctionnalité: Propagation en cascade du xOffset après modification d'une rangée

  Contexte:
    Soit un type de lame "A" de longueur 120 cm et largeur 14 cm
    Et un type de lame "B" de longueur 100 cm et largeur 10 cm
    Et des paramètres de pose avec cale 5 cm, scie 0.1 cm, longueur min 30 cm

  Scénario: Cascade simple — 3 rangées du même type
    Soit une pièce 400×300 contenant 3 rangées A avec xOffsets [0, 99, 99]
    Quand je propage à partir de la rangée d'index 0
    Alors la rangée d'index 1 a un xOffset d'environ 30.1 cm
    Et la rangée d'index 2 a un xOffset d'environ 60.2 cm

  Scénario: Mix de types — seul le type modifié cascade
    Soit une pièce 400×300 contenant A0, B0, A1, B1, A2 avec xOffsets [0, 33, 99, 77, 99]
    Quand je propage à partir de la rangée A0
    Alors la rangée A1 a un xOffset d'environ 30.1 cm
    Et la rangée A2 a un xOffset d'environ 60.2 cm
    Et la rangée B0 garde son xOffset de 33 cm
    Et la rangée B1 garde son xOffset de 77 cm

  Scénario: Source sans chute — downstream retombe à zéro
    Soit une pièce 400×300 sans cale contenant 2 rangées du type "C" 100 cm avec xOffsets [0, 55]
    Quand je propage à partir de la rangée d'index 0
    Alors la rangée d'index 1 a un xOffset de 0 cm
