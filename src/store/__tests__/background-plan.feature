# language: fr
Fonctionnalité: Plan de fond — import et réglages

  Scénario: Import d'un plan attache une image au projet
    Soit un projet courant nommé "Appartement"
    Quand j'importe un plan de fond avec une image "plan.png"
    Alors le plan de fond existe
    Et le nom de fichier du plan vaut "plan.png"
    Et l'opacité du plan vaut 0.6
    Et la rotation du plan vaut 0

  Scénario: Modifier l'opacité du plan
    Soit un projet courant nommé "Appartement"
    Et un plan de fond importé avec une image "plan.png"
    Quand je règle l'opacité du plan à 0.3
    Alors l'opacité du plan vaut 0.3

  Scénario: Modifier la rotation du plan
    Soit un projet courant nommé "Appartement"
    Et un plan de fond importé avec une image "plan.png"
    Quand je règle la rotation du plan à 90
    Alors la rotation du plan vaut 90

  Scénario: Repositionner le plan de fond
    Soit un projet courant nommé "Appartement"
    Et un plan de fond importé avec une image "plan.png"
    Quand je repositionne le plan à (50, 30)
    Alors la position du plan vaut (50, 30)

  Scénario: Calibrer le plan change l'échelle
    Soit un projet courant nommé "Appartement"
    Et un plan de fond importé avec une image "plan.png"
    Quand je calibre le plan avec les points (0, 0) et (100, 0) pour une distance de 200 cm
    Alors l'échelle du plan vaut 2

  Scénario: Supprimer le plan de fond
    Soit un projet courant nommé "Appartement"
    Et un plan de fond importé avec une image "plan.png"
    Quand je supprime le plan de fond
    Alors le plan de fond n'existe pas
