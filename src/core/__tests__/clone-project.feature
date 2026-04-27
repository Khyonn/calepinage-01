# language: fr
Fonctionnalité: Cloner un projet existant

  Le clonage produit un nouveau Project avec des UUID régénérés et un sous-ensemble
  configurable des données du projet source. Les dépendances logiques sont enforcées :
  cloner les rangées implique de cloner les pièces et le catalogue.

  Scénario: Clone complet — toutes les options activées
    Soit un projet source avec catalogue, pose personnalisée, pièces, rangées et plan de fond
    Quand je clone le projet avec toutes les options activées sous le nom "Copie complète"
    Alors le clone a un id différent du source
    Et le clone a le nom "Copie complète"
    Et le catalogue du clone contient autant de types que la source
    Et les rangées du clone référencent les nouveaux ids du catalogue cloné
    Et le pose params du clone est identique à la source
    Et le plan de fond est conservé

  Scénario: Clone catalogue seul — pas de pièces
    Soit un projet source avec catalogue, pose, pièces et rangées
    Quand je clone avec uniquement catalogue activé sous le nom "Catalogue seul"
    Alors le clone a 0 pièce
    Et le catalogue du clone contient autant de types que la source

  Scénario: Clone sans pose — pose remplacée par les defaults
    Soit un projet source avec une pose personnalisée cale=2 minPlankLength=50
    Quand je clone avec catalogue et pose désactivés sous le nom "Sans pose"
    Alors le pose params du clone vaut les defaults

  Scénario: Clone des rangées force pièces et catalogue
    Soit un projet source avec catalogue, pièces et rangées
    Quand je clone avec uniquement rangées activé sous le nom "Cascade auto"
    Alors le clone a autant de pièces que la source
    Et le catalogue du clone contient autant de types que la source
    Et les rangées du clone référencent les nouveaux ids du catalogue cloné

  Scénario: Clone pièces sans rangées — vertices conservés rows vidées
    Soit un projet source avec une pièce de 4 sommets et 2 rangées
    Quand je clone avec pièces activé et rangées désactivé sous le nom "Vertices seuls"
    Alors le clone a 1 pièce avec 4 sommets et 0 rangée
