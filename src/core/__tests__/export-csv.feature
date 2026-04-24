# language: fr
Fonctionnalité: Export CSV d'un projet

  Contexte:
    Soit un projet nommé "Démo" avec paramètres de pose cale 0.5 cm scie 0.1 cm min 30 cm écart 15 cm

  Scénario: La sortie commence par le BOM UTF-8 et utilise les séparateurs attendus
    Quand j'exporte le projet en CSV
    Alors la sortie commence par le BOM UTF-8
    Et la sortie utilise "\r\n" comme fin de ligne
    Et la sortie utilise ";" comme séparateur de colonnes
    Et la sortie contient les trois sections attendues

  Scénario: Le résumé matière contient une ligne par type avec coût
    Soit un catalogue contenant "Chêne" 120×14 cm au prix unitaire 10 €
    Et une pièce "Salon" de 400 cm avec une rangée du type "Chêne"
    Quand j'exporte le projet en CSV
    Alors la section résumé contient "Chêne 120×14 cm;4;10.00;40.00"
    Et la section résumé contient "Total;;;40.00"

  Scénario: Les liens de réutilisation sont écrits avec les numéros de rangée 1-indexés
    Soit un catalogue contenant "Pin" 100×10 cm au prix unitaire 5 €
    Et une pièce "Chambre" de 400 cm avec deux rangées du type "Pin"
    Et un lien de réutilisation de 30 cm entre la rangée 1 et la rangée 2
    Quand j'exporte le projet en CSV
    Alors la section liens contient "Chambre;1;Chambre;2;30.0"

  Scénario: Les caractères spéciaux dans les noms sont échappés
    Soit un catalogue contenant "Hêtre; premium" 120×14 cm au prix unitaire 12 €
    Et une pièce "Salle \"principale\"" de 400 cm avec une rangée du type "Hêtre; premium"
    Quand j'exporte le projet en CSV
    Alors la section résumé contient "\"Hêtre; premium 120×14 cm\";4;12.00;48.00"
    Et la section liens commence par l'en-tête "Pièce source;Rangée source;Pièce cible;Rangée cible;Longueur réutilisée (cm)"

  Scénario: Un projet vide produit des sections sans lignes de données
    Quand j'exporte le projet en CSV
    Alors la section résumé ne contient que son en-tête
    Et la section liens ne contient que son en-tête
    Et la section paramètres contient "0.5;0.1;30.0;15.0"
