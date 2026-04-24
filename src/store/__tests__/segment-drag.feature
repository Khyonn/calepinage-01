# language: fr
Fonctionnalité: Drag et cascade via updateSegmentOffset

  Contexte:
    Étant donné un projet "Test" avec une pièce "Salon" 400×300 cm et un type "Chêne" 120×12 cm sélectionnés

  Scénario: Dispatch sur segment 0 déclenche la cascade
    Étant donné 3 rangées du type "Chêne" générées automatiquement
    Quand je dispatch updateSegmentOffset sur la rangée 0 segment 0 avec xOffset 42
    Alors le xOffset du segment 0 de la rangée 0 vaut 42
    Et les rangées 1 et 2 ont leur segment 0 ajusté à la cascade

  Scénario: Dispatch sur segment > 0 ne déclenche pas la cascade
    Étant donné 3 rangées avec 2 segments chacune et xOffsets [[0, 0], [39.1, 0], [78.2, 0]]
    Quand je dispatch updateSegmentOffset sur la rangée 0 segment 1 avec xOffset 77
    Alors le xOffset du segment 1 de la rangée 0 vaut 77
    Et les rangées 1 et 2 gardent leurs xOffsets initiaux
