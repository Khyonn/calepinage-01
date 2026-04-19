# language: fr
Fonctionnalité: Gestion des projets (liste + projet courant)

  Scénario: Créer un projet l'ajoute à la liste et le rend courant
    Soit une application sans projet
    Quand je crée un projet nommé "Maison"
    Alors la liste contient 1 projet
    Et le projet courant est "Maison"

  Scénario: Supprimer le projet courant vide la liste et le projet courant
    Soit un projet courant nommé "Maison"
    Quand je supprime le projet courant
    Alors la liste est vide
    Et il n'y a pas de projet courant

  Scénario: Ouvrir un autre projet bascule le projet courant
    Soit un projet courant nommé "Maison"
    Et un projet existant "Atelier" en base
    Quand j'ouvre le projet "Atelier"
    Alors le projet courant est "Atelier"
    Et la liste contient 2 projets

  Scénario: Renommer le projet courant met à jour la liste
    Soit un projet courant nommé "Maison"
    Quand je renomme le projet courant en "Villa"
    Alors le projet courant est "Villa"
    Et la liste contient l'entrée "Villa"
