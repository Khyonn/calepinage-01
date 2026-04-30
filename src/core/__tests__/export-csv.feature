# language: fr
Fonctionnalité: Export CSV d'un projet

  Contexte:
    Soit un projet nommé "Démo" avec paramètres de pose cale 0.5 cm scie 0.1 cm min 30 cm écart 15 cm

  Scénario: La sortie commence par le BOM UTF-8 et utilise les séparateurs attendus
    Quand j'exporte le projet en CSV
    Alors la sortie commence par le BOM UTF-8
    Et la sortie utilise "\r\n" comme fin de ligne
    Et la sortie utilise ";" comme séparateur de colonnes
    Et la sortie contient la section résumé matière

  Scénario: Le résumé matière contient une ligne par type avec coût
    Soit un catalogue contenant "Chêne" 120×14 cm au prix unitaire 10 €
    Et une pièce "Salon" de 400 cm avec une rangée du type "Chêne"
    Quand j'exporte le projet en CSV
    Alors la section résumé contient "Chêne 120×14 cm;4;10.00;40.00"
    Et la section résumé contient "Total;;;40.00"
    Et la section détail contient "# Détail — Salon"

  Scénario: Les caractères spéciaux dans les noms sont échappés
    Soit un catalogue contenant "Hêtre; premium" 120×14 cm au prix unitaire 12 €
    Et une pièce "Salle \"principale\"" de 400 cm avec une rangée du type "Hêtre; premium"
    Quand j'exporte le projet en CSV
    Alors la section résumé contient "\"Hêtre; premium 120×14 cm\";4;12.00;48.00"

  Scénario: Un projet vide produit une section résumé sans lignes de données
    Quand j'exporte le projet en CSV
    Alors la section résumé ne contient que son en-tête
