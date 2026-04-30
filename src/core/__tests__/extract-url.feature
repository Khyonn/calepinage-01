# language: fr
Fonctionnalité: Extraction de la première URL d'un texte

  Scénario: URL simple
    Étant donné le texte "Voir https://example.com"
    Quand j'extrais la première URL
    Alors le résultat est "https://example.com"

  Scénario: URL en milieu de phrase
    Étant donné le texte "Produit: https://example.com/produit disponible"
    Quand j'extrais la première URL
    Alors le résultat est "https://example.com/produit"

  Scénario: Pas d'URL
    Étant donné le texte "Aucune URL ici"
    Quand j'extrais la première URL
    Alors le résultat est null

  Scénario: Plusieurs URLs — première retournée
    Étant donné le texte "https://first.com et https://second.com"
    Quand j'extrais la première URL
    Alors le résultat est "https://first.com"

  Scénario: URL avec parenthèse fermante exclue
    Étant donné le texte "(https://example.com)"
    Quand j'extrais la première URL
    Alors le résultat est "https://example.com"
