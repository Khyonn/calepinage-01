# language: fr
Fonctionnalité: Édition des sommets d'une pièce — intégration store

  Scénario: Je déplace un sommet d'une pièce sans rangées
    Soit un projet avec une pièce "Salon" de 4 sommets [(0,0), (300,0), (300,200), (0,200)]
    Quand je dispatch updateRoom avec les nouveaux sommets [(0,0), (350,0), (350,200), (0,200)]
    Alors le sommet 1 a pour coordonnées (350, 0)
    Et le sommet 2 a pour coordonnées (350, 200)

  Scénario: Push mur Shift décale 3 sommets du même delta
    Soit un projet avec une pièce "Salon" de 4 sommets [(0,0), (300,0), (300,200), (0,200)]
    Quand je dispatch updateRoom avec les sommets modifiés par un delta (20, 0) sur l'index 1 et ses voisins
    Alors le sommet 0 a pour coordonnées (20, 0)
    Et le sommet 1 a pour coordonnées (320, 0)
    Et le sommet 2 a pour coordonnées (320, 200)
    Et le sommet 3 a pour coordonnées (0, 200)

  Scénario: Selector indique si la pièce active a des rangées
    Soit un projet avec une pièce "Salon" sans rangée active
    Alors selectActiveRoomHasRows retourne false
