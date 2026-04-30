# language: fr
Fonctionnalité: Section "Détail par pièce" du CSV

  Scénario: Segment commençant par une lame complète
    Étant donné une pièce de 500 cm avec une rangée du type "Chêne" 120×10 cm xOffset 0
    Quand j'exporte le CSV
    Alors la ligne de détail du segment 1 a la première lame vide
    Et la colonne "Lames complètes" vaut "4"
    Et la colonne "Dernière lame" est non vide

  Scénario: Segment d'une seule lame incomplète
    Étant donné une pièce de 50 cm avec une rangée du type "Sapin" 120×10 cm xOffset 0
    Quand j'exporte le CSV
    Alors la ligne de détail du segment 1 a la première lame non vide
    Et la colonne "Lames complètes" est vide dans cette ligne
    Et la colonne "Dernière lame" est vide dans cette ligne

  Scénario: Segment avec source de chute réutilisée
    Étant donné deux rangées dans une pièce de 400 cm du type "Pin" 100×10 cm
    Et la deuxième rangée a xOffset 30 cm
    Et un lien source de la rangée 1 vers la rangée 2
    Quand j'exporte le CSV
    Alors la ligne de la rangée 2 a la colonne "Source" remplie avec "rangée 1"

  Scénario: Segment avec destination de chute réutilisée
    Étant donné deux rangées dans une pièce de 400 cm du type "Pin" 100×10 cm
    Et la deuxième rangée a xOffset 30 cm
    Et un lien source de la rangée 1 vers la rangée 2
    Quand j'exporte le CSV
    Alors la ligne de la rangée 1 a la colonne "Destination" remplie avec "rangée 2"
