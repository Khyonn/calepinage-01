# language: fr
Fonctionnalité: Règles de pose et calculs dérivés

  Scénario: Augmenter la longueur minimale invalide les rangées existantes
    Soit un projet courant nommé "Appartement"
    Et une pièce "Salon" de 400 cm de large dans le projet
    Et un type de lame "Chêne 120cm" de longueur 120 cm dans le catalogue
    Et une rangée avec un décalage de 0 cm dans la pièce "Salon"
    Et aucune violation n'est détectée
    Quand je mets à jour la longueur minimale de lame à 40 cm
    Alors 1 violation est détectée
    Et la violation est de type "last-plank-too-short"

  Scénario: Supprimer une rangée invalide efface ses violations
    Soit un projet courant nommé "Appartement"
    Et une pièce "Salon" de 400 cm de large dans le projet
    Et un type de lame "Chêne 120cm" de longueur 120 cm dans le catalogue
    Et une rangée avec un décalage de 0 cm dans la pièce "Salon"
    Et la longueur minimale de lame est de 40 cm
    Quand je supprime la rangée
    Alors aucune violation n'est détectée

  Scénario: Un décalage insuffisant entre deux rangées provoque une violation de joint
    Soit un projet courant nommé "Appartement"
    Et une pièce "Salon" de 400 cm de large dans le projet
    Et un type de lame "Chêne 120cm" de longueur 120 cm dans le catalogue
    Et une rangée avec un décalage de 0 cm dans la pièce "Salon"
    Quand j'ajoute une rangée avec un décalage de 3 cm dans la pièce "Salon"
    Alors 1 violation est détectée
    Et la violation est de type "row-gap-too-small"

  Scénario: La réutilisation d'une chute réduit le nombre de lames commandées
    Soit un projet courant nommé "Appartement"
    Et une pièce "Salon" de 400 cm de large dans le projet
    Et un type de lame "Chêne 120cm" de longueur 120 cm dans le catalogue
    Et une rangée avec un décalage de 0 cm dans la pièce "Salon"
    Et une rangée avec un décalage de 39.1 cm dans la pièce "Salon"
    Alors le résumé indique 7 lames à commander pour "Chêne 120cm"
    Et un lien de réutilisation de chute est établi

  Scénario: Sans réutilisation, chaque rangée consomme ses propres lames
    Soit un projet courant nommé "Appartement"
    Et une pièce "Salon" de 400 cm de large dans le projet
    Et un type de lame "Chêne 120cm" de longueur 120 cm dans le catalogue
    Et une rangée avec un décalage de 0 cm dans la pièce "Salon"
    Et une rangée avec un décalage de 10 cm dans la pièce "Salon"
    Alors le résumé indique 8 lames à commander pour "Chêne 120cm"
    Et aucun lien de réutilisation de chute n'est établi
