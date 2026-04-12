# language: fr
Fonctionnalité: Résumé du calepinage et calcul du coût

  Contexte:
    Soit une pièce de 400 cm de large avec une rangée au décalage 0 cm
    Et des paramètres de pose avec une cale de 5 cm et une largeur de scie de 0.1 cm et une longueur minimale de 30 cm

  Scénario: Calcul du nombre de lames et du coût à l'unité
    Soit un type de lame de longueur 120 cm au prix unitaire de 10 €
    Alors le résumé indique 4 lames nécessaires au coût total de 40 €

  Scénario: Calcul du coût au lot avec arrondi au lot supérieur
    Soit un type de lame de longueur 120 cm vendu par lot de 10 à 100 €
    Alors le résumé indique 4 lames nécessaires au coût total de 100 €

  Scénario: La première lame d'une rangée réutilisant une chute n'est pas commandée
    Soit un type de lame de longueur 120 cm au prix unitaire de 10 €
    Et une deuxième rangée au décalage 30.1 cm réutilisant la chute de la première
    Alors le résumé indique 7 lames nécessaires

  Scénario: Un type de lame sans rangée associée n'engendre aucun coût
    Soit un type de lame de longueur 100 cm non utilisé dans la pièce
    Alors le résumé indique 0 lames nécessaires au coût total de 0 €
