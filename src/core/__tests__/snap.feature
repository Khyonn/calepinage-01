# language: fr
Fonctionnalité: Snap axial — alignement du curseur sur les sommets existants

  Scénario: Snap actif en X uniquement
    Soit un sommet en (100, 100) et un curseur en (102, 200)
    Quand je calcule le snap avec un zoom de 1 et un rootFontPx de 16
    Alors snappedX vaut 100
    Et snappedY est absent
    Et x vaut 100 et y vaut 200

  Scénario: Snap simultané X et Y sur deux sommets différents
    Soit un sommet en (100, 50) et un sommet en (200, 400) et un curseur en (102, 402)
    Quand je calcule le snap avec un zoom de 1 et un rootFontPx de 16
    Alors snappedX vaut 100
    Et snappedY vaut 400
    Et x vaut 100 et y vaut 400

  Scénario: Aucun snap hors seuil
    Soit un sommet en (0, 0) et un curseur en (50, 50)
    Quand je calcule le snap avec un zoom de 1 et un rootFontPx de 16
    Alors snappedX est absent
    Et snappedY est absent
    Et x vaut 50 et y vaut 50

  Scénario: Le seuil monde dépend du zoom
    Soit un sommet en (0, 0) et un curseur en (10, 0)
    Quand je calcule le snap avec un zoom de 2 et un rootFontPx de 16
    Alors snappedX est absent

  Scénario: Au zoom faible, le seuil monde s'élargit
    Soit un sommet en (0, 0) et un curseur en (20, 0)
    Quand je calcule le snap avec un zoom de 0.5 et un rootFontPx de 16
    Alors snappedX vaut 0
