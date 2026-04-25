# language: fr
Fonctionnalité: Calcul du xOffset par défaut — pose auto bornée par minPlankLength

  Scénario: Reuse complet ne viole pas minPlankLength — xOffset = xOffset_full
    Étant donné une pièce rectangulaire 400 cm sur 280 cm
    Et un type de lame de longueur 120 cm et largeur 14 cm
    Et des paramètres cale 0,5 scie 0,1 minPlankLength 30
    Et une rangée existante du même type avec xOffset 0
    Quand je calcule le xOffset par défaut pour une nouvelle rangée du même type
    Alors le xOffset vaut environ 39,1 cm
    Et la dernière lame de la rangée est supérieure ou égale à 30 cm

  Scénario: Reuse complet violerait minPlankLength — xOffset borné
    Étant donné une pièce rectangulaire 161 cm sur 200 cm
    Et un type de lame de longueur 100 cm et largeur 10 cm
    Et des paramètres cale 0,5 scie 0,1 minPlankLength 30
    Et une rangée existante du même type avec xOffset 0
    Quand je calcule le xOffset par défaut pour une nouvelle rangée du même type
    Alors le xOffset est strictement inférieur à 60,1 cm
    Et la dernière lame de la rangée est supérieure ou égale à 30 cm

  Scénario: Première rangée — bornage applique sans chute préalable pour satisfaire minPlankLength
    Étant donné une pièce rectangulaire 280 cm sur 200 cm
    Et un type de lame de longueur 125,7 cm et largeur 14 cm
    Et des paramètres cale 0,5 scie 0,1 minPlankLength 30
    Quand je calcule le xOffset par défaut pour une nouvelle rangée du même type sans rangée précédente
    Alors le xOffset vaut environ 2,4 cm
    Et la dernière lame de la rangée est supérieure ou égale à 30 cm

  Scénario: Aucun xOffset ne satisfait — fallback xOffset 0
    Étant donné une pièce rectangulaire 130 cm sur 100 cm
    Et un type de lame de longueur 100 cm et largeur 10 cm
    Et des paramètres cale 0 scie 0,1 minPlankLength 61
    Et une rangée existante du même type avec xOffset 0
    Quand je calcule le xOffset par défaut pour une nouvelle rangée du même type
    Alors le xOffset vaut 0 cm
