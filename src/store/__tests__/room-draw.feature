# language: fr
Fonctionnalité: Dessin d'une pièce — intégration store

  Scénario: Je dessine un rectangle et le nomme
    Soit un projet courant nommé "Appartement"
    Quand je dispatch addRoom avec le nom "Salon" et les sommets [(0,0), (300,0), (300,200), (0,200)]
    Alors le projet contient 1 pièce
    Et la pièce s'appelle "Salon"
    Et la pièce a 4 sommets

  Scénario: Dessiner une pièce la rend active
    Soit un projet courant nommé "Appartement"
    Quand je dispatch addRoom avec l'id "room-1" et le nom "Cuisine" et les sommets [(0,0), (200,0), (200,150), (0,150)]
    Et je dispatch setActiveRoom avec "room-1"
    Alors la pièce active a l'id "room-1"

  Scénario: Dessiner une deuxième pièce les ajoute toutes les deux
    Soit un projet courant nommé "Appartement"
    Quand je dispatch addRoom avec le nom "Salon" et les sommets [(0,0), (300,0), (300,200), (0,200)]
    Et je dispatch addRoom avec le nom "Cuisine" et les sommets [(400,0), (600,0), (600,200), (400,200)]
    Alors le projet contient 2 pièces
