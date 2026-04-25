# language: fr
Fonctionnalité: Géométrie d'une rangée — strip Y + segments X + lames

  Scénario: Pièce rectangulaire 300×100 cm — 1 segment par rangée
    Étant donné une pièce rectangulaire 300 cm sur 100 cm à l'origine
    Et un type de lame "Chêne" de 100 cm par 20 cm
    Et des paramètres de pose par défaut
    Quand je calcule la géométrie de la rangée d'index 0
    Alors la bande occupe Y de 0,5 à 20,5
    Et la rangée compte 1 segment
    Et le segment couvre X de 0 à 300
    Et le segment contient 3 lames

  Scénario: Pièce concave en U — rangée du haut coupée en 2 segments
    Étant donné une pièce en U de 200×120 avec une encoche centrale 100×60
    Et un type de lame "Chêne" de 100 cm par 20 cm
    Et des paramètres de pose par défaut
    Quand je calcule la géométrie de la rangée d'index 0
    Alors la rangée compte 2 segments

  Scénario: Pièce concave en U — rangée du bas en un seul segment
    Étant donné une pièce en U de 200×120 avec une encoche centrale 100×60
    Et un type de lame "Chêne" de 100 cm par 20 cm
    Et des paramètres de pose par défaut
    Quand je calcule la géométrie de la rangée d'index 5
    Alors la rangée compte 1 segment

  Scénario: Pièce 400×49 — la 4e rangée déborde mais reste visible (bug correctif)
    Étant donné une pièce rectangulaire 400 cm sur 49 cm à l'origine
    Et un type de lame "Chêne" de 100 cm par 14 cm
    Et des paramètres de pose par défaut
    Quand je calcule la géométrie de la rangée d'index 3
    Alors la rangée compte 1 segment
    Et le segment couvre X de 0 à 400
