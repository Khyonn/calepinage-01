# language: fr
Fonctionnalité: Validation des contraintes d'une rangée

  Contexte:
    Soit des paramètres de pose avec une longueur minimale de 30 cm et un écart minimal de 15 cm

  Scénario: Rangée valide sans violation
    Soit une rangée avec une première lame de 80 cm et une dernière lame de 60 cm
    Et aucune rangée précédente du même type
    Alors il n'y a aucune violation

  Scénario: Première lame trop courte
    Soit une rangée avec une première lame de 20 cm et une dernière lame de 60 cm
    Et aucune rangée précédente du même type
    Alors il y a une violation de type "first-plank-too-short"

  Scénario: Dernière lame trop courte
    Soit une rangée avec une première lame de 80 cm et une dernière lame de 10 cm
    Et aucune rangée précédente du même type
    Alors il y a une violation de type "last-plank-too-short"

  Scénario: Écart entre fins de rangées trop petit
    Soit une rangée avec une première lame de 80 cm et une dernière lame de 60 cm
    Et une rangée précédente dont la dernière lame mesure 65 cm
    Et une largeur disponible de 390 cm
    Alors il y a une violation de type "row-gap-too-small"

  Scénario: Écart entre fins de rangées suffisant
    Soit une rangée avec une première lame de 80 cm et une dernière lame de 60 cm
    Et une rangée précédente dont la dernière lame mesure 90 cm
    Et une largeur disponible de 390 cm
    Alors il n'y a aucune violation
