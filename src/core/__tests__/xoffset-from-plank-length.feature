# language: fr
Fonctionnalité: Conversion longueur planche → xOffset

  Scénario: Première planche — formule directe
    Étant donné un type de lame de longueur 120 cm
    Quand je calcule le xOffset pour une première planche de 80 cm
    Alors le xOffset vaut 40 cm

  Scénario: Première planche supérieure à la longueur nominale → planche pleine
    Étant donné un type de lame de longueur 120 cm
    Quand je calcule le xOffset pour une première planche de 130 cm
    Alors le xOffset vaut 0 cm

  Scénario: Première planche égale à la longueur nominale → planche pleine
    Étant donné un type de lame de longueur 120 cm
    Quand je calcule le xOffset pour une première planche de 120 cm
    Alors le xOffset vaut 0 cm

  Scénario: Première planche nulle → clamp à L - 0,1 (sliver)
    Étant donné un type de lame de longueur 120 cm
    Quand je calcule le xOffset pour une première planche de 0 cm
    Alors le xOffset vaut 119,9 cm

  Scénario: Dernière planche atteignable — simulation produit la valeur exacte
    Étant donné un type 120 cm, pièce 400 cm utile, cale 0
    Quand je cherche le xOffset pour une dernière planche de 50 cm
    Alors la dernière planche du fillRow résultant est environ 50 cm

  Scénario: Dernière planche initialement pleine → simulation trouve un xOffset adapté
    Étant donné un type 100 cm, pièce 300 cm utile, cale 0
    Quand je cherche le xOffset pour une dernière planche de 30 cm
    Alors la dernière planche du fillRow résultant est environ 30 cm
    Et le xOffset est strictement positif

  Scénario: Dernière planche cible impossible → meilleur match
    Étant donné un type 100 cm, pièce 300 cm utile, cale 0
    Quand je cherche le xOffset pour une dernière planche de 200 cm
    Alors la dernière planche du fillRow résultant est aussi proche que possible de 200 cm
