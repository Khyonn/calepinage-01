# language: fr
Fonctionnalité: Sérialisation JSON des projets — export / import / round-trip

  Scénario: Round-trip export → import — projet sans plan
    Étant donné un projet "Appart" avec catalogue, pièces et rangées
    Quand je sérialise le projet en JSON puis le re-parse
    Alors le projet résultant a le même nom
    Et le catalogue a les mêmes tailles et descriptions aux ids près
    Et les pièces ont les mêmes vertices et rangées aux ids près
    Et row.plankTypeId pointe vers le bon plankType remappé
    Et tous les ids sont régénérés

  Scénario: Round-trip avec plan de fond — image incluse en base64
    Étant donné un projet "AppartPlan" avec un backgroundPlan sans imageFile
    Quand je sérialise en JSON avec une image "data:image/png;base64,AAA"
    Alors le JSON contient la section image avec le dataUrl
    Et le backgroundPlan du JSON ne contient pas imageFile

  Scénario: Validation — version inconnue → erreur "Format non supporté"
    Étant donné un JSON avec version 999 et un project valide
    Quand je tente de parser le JSON
    Alors une erreur "Format non supporté" est levée

  Scénario: Validation — champ requis manquant → erreur "Fichier corrompu"
    Étant donné un JSON sans poseParams dans project
    Quand je tente de parser le JSON
    Alors une erreur "Fichier corrompu" est levée

  Scénario: Validation — JSON invalide → erreur "Fichier corrompu"
    Étant donné une chaîne qui n'est pas du JSON
    Quand je tente de parser le JSON
    Alors une erreur "Fichier corrompu" est levée

  Scénario: Désambiguïsation du nom en cas de collision
    Étant donné une liste de projets existants ["Appart", "Appart (importé)"]
    Quand je désambiguïse le nom "Appart"
    Alors le nom résultant est "Appart (importé 2)"

  Scénario: Import JSON clampe un yOffset hors bornes
    Étant donné un JSON valide avec une pièce yOffset -99 cm et un type de lame de largeur 14 cm
    Quand je parse le JSON
    Alors la pièce importée a un yOffset clampé à -14 cm
