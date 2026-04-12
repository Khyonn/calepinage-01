# Glossaire

| Terme | Définition |
| --- | --- |
| **Calepinage** | Planification de la disposition des lames de parquet dans une ou plusieurs pièces, en optimisant la réutilisation des chutes pour minimiser les coûts. |
| **Lame** | Une planche de parquet individuelle, caractérisée par une longueur et une largeur. Synonyme : planche. |
| **Type de lame** | Spécification d'un modèle de lame (dimensions, tarif, description) dans le catalogue du projet. Plusieurs rangées peuvent référencer le même type. |
| **Rangée** | Suite de lames disposées côte à côte, couvrant la pièce sur toute sa largeur disponible. Chaque rangée appartient à une pièce et référence un type de lame. |
| **Chute** | Morceau de lame résultant d'une coupe en fin de rangée. Sa longueur utilisable est la longueur brute moins la largeur de la lame de scie. Elle peut être réutilisée comme première lame d'une rangée suivante du même type. |
| **Perte matière** | Chute qui n'est réutilisée dans aucune autre rangée. Signalée par une annotation rouge. |
| **xOffset** | Décalage horizontal du motif d'une rangée, en centimètres. Représente la longueur de la portion de planche entière qui se trouverait théoriquement à gauche du mur. `xOffset = 0` signifie que la rangée commence avec une planche neuve entière. |
| **yOffset** | Décalage vertical optionnel d'une rangée par rapport à sa position calculée automatiquement. Permet d'assurer une continuité visuelle avec une pièce adjacente. |
| **Cale de dilatation** | Espace (en cm) laissé entre les lames et les murs pour permettre la dilatation thermique. Appliqué des deux côtés : `largeur disponible = largeur pièce − 2 × cale`. |
| **Largeur de la lame de scie** | Épaisseur de l'outil de découpe (en cm), déduite de la longueur brute d'une chute pour obtenir sa longueur utilisable. |
| **Pose rectiligne** | Mode de pose où toutes les rangées sont parallèles entre elles, par opposition à la pose en diagonale ou en chevrons. |
| **Pièce active** | La pièce sélectionnée dans la barre d'outils, sur laquelle portent les opérations en cours (ajout de rangées, drag, affichage des annotations). |
| **Annotation** | Texte affiché à l'extérieur des lames (à gauche ou à droite) indiquant la longueur d'une pièce partielle et son lien éventuel de réutilisation. Visible uniquement en mode Lames. |
| **Plan de fond** | Image importée par l'utilisateur et affichée en arrière-plan du canvas SVG comme guide de dessin des pièces. |
| **Calibration** | Opération consistant à indiquer la distance réelle (en cm) entre deux points identifiables du plan de fond, permettant à l'application de calculer l'échelle pixels → centimètres. |
| **Unités monde** | Système de coordonnées en centimètres dans lequel sont exprimées les positions des pièces, des lames et du plan de fond. Distinct des coordonnées pixels de l'écran, converties via le viewport (pan + zoom). |
| **Viewport** | Fenêtre de visualisation définie par un niveau de zoom et un décalage de pan. Permet de convertir des coordonnées écran en unités monde et inversement. |
