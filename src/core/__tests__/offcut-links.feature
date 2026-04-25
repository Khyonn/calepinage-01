# language: fr
Fonctionnalité: Liens de réutilisation de chutes entre rangées

  Contexte:
    Soit un type de lame de longueur 120 cm et largeur 14 cm
    Et des paramètres de pose avec une cale de 5 cm et une largeur de scie de 0.1 cm et une longueur minimale de 30 cm

  Scénario: Un lien est établi quand la chute d'une rangée correspond au début d'une autre
    Soit une pièce avec une rangée A au décalage 0 cm et une rangée B au décalage 30.1 cm
    Alors un lien est établi de A vers B avec une chute d'environ 89.9 cm

  Scénario: Aucun lien quand la chute est trop petite pour couvrir le début de la rangée suivante
    Soit une pièce avec une rangée A au décalage 0 cm et une rangée B au décalage 10 cm
    Alors aucun lien de réutilisation n'est établi

  Scénario: Réutilisation partielle — la chute couvre le début sans match exact
    Soit une pièce avec une rangée A au décalage 0 cm et une rangée B au décalage 50 cm
    Alors un lien est établi de A vers B avec une longueur réutilisée d'environ 70 cm

  Scénario: Aucun lien quand toutes les rangées démarrent à zéro
    Soit une pièce avec deux rangées démarrant au décalage 0 cm
    Alors aucun lien de réutilisation n'est établi

  Scénario: Un lien peut être établi entre des rangées de pièces différentes
    Soit une pièce "Salon" avec une rangée A au décalage 0 cm
    Et une pièce "Couloir" avec une rangée B au décalage 30.1 cm
    Alors un lien est établi de A vers B
