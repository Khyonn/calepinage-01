# language: fr
Fonctionnalité: Panneau contextuel en mode nav (pose + catalogue)

  Scénario: Modifier la cale de dilatation met à jour les paramètres de pose
    Soit un projet courant nommé "Appartement"
    Quand je règle la cale de dilatation à 1.2 cm
    Alors la cale de dilatation vaut 1.2 cm

  Scénario: Ajouter un type de lame apparaît dans le catalogue
    Soit un projet courant nommé "Appartement"
    Quand j'ajoute un type de lame "Chêne 120cm" 120 × 14 cm
    Alors le catalogue contient 1 type de lame
    Et le premier type s'appelle "Chêne 120cm"

  Scénario: Supprimer un type de lame utilisé est refusé
    Soit un projet courant nommé "Appartement"
    Et une pièce "Salon" de 400 cm de large dans le projet
    Et un type de lame "Chêne 120cm" 120 × 14 cm dans le catalogue
    Et une rangée utilise ce type de lame dans "Salon"
    Quand je tente de supprimer le type de lame
    Alors le catalogue contient encore 1 type de lame

  Scénario: Éditer un type utilisé ne change pas ses dimensions
    Soit un projet courant nommé "Appartement"
    Et une pièce "Salon" de 400 cm de large dans le projet
    Et un type de lame "Chêne 120cm" 120 × 14 cm dans le catalogue
    Et une rangée utilise ce type de lame dans "Salon"
    Quand je modifie le type en passant la longueur à 240 cm et la largeur à 20 cm
    Alors la longueur du type reste 120 cm
    Et la largeur du type reste 14 cm
