# Remplissage automatique des rangées

Le remplissage se déclenche dès qu'une rangée est ajoutée en mode **Modifier** (`edit`). L'algorithme calcule les segments de la rangée par intersection avec le polygone de la pièce, puis positionne les lames dans chaque segment.

## Postulat de base

Les rangées sont des strips **horizontaux** (hauteur constante = largeur du type de lame). Une pose en diagonale ou en chevrons nécessiterait une révision complète de l'algorithme — hors scope.

## Calcul des segments par rangée

Chaque rangée occupe une bande `[yStart, yEnd]` avec :

- `yStart = roomMinY + clamp(yOffset, [-max(catalog.width), 0]) + cale + Σ(largeurs des rangées 0..rowIndex-1)`
- `yEnd = yStart + plankType.width` (largeur du type de la rangée courante)

La somme cumulative `Σ` est calculée via le catalogue : chaque rangée précédente contribue avec la largeur de **son propre type de lame**. Cela permet d'alterner des types de largeurs différentes sans glisser les rangées entre elles.

Le `yOffset` (cm, défaut 0, borné dans `[-max(catalog.width), 0]`) décale verticalement la première rangée vers le haut. Cas d'usage : aligner les joints entre deux pièces adjacentes dont les bords de référence diffèrent. Le clamp est appliqué au calcul (lazy) — si le catalogue change et que l'ancien `yOffset` sort des bornes, la valeur stockée est conservée mais le rendu utilise la valeur clampée.

Le décalage initial de `cale` réserve la zone de dilatation en **haut** de la pièce ; un décalage symétrique en bas est matérialisé visuellement par les strips `--plank-cale`.

La bande est intersectée avec le polygone via `intersectStripExtents` (`src/core/geometry.ts`) :

1. Échantillonnage de scanlines au **milieu** (`yMid`), juste au-dessus de `y1`, juste en-dessous de `y2`, et à chaque `vertex.y` strictement inclus dans la bande.
2. Union des segments X collectés à travers tous les échantillons.
3. Fusion des intervalles qui se chevauchent → liste ordonnée de segments disjoints, couvrant les **bornes X extrêmes** atteintes sur la hauteur de la bande.

Conséquence : dans un coin type "L inversé" avec un mur diagonal, la rangée s'étend jusqu'au **X minimum atteint** sur la hauteur de la bande. Les lames sont comptées comme **entières** (pour la matière), tout en étant **clippées visuellement** au polygone via un `<clipPath>` SVG (les planches seraient physiquement coupées dans leur longueur pour épouser le coin).

### Cas dégénéré — dernière rangée qui déborde

Si la hauteur restante de la pièce est inférieure à la largeur d'une lame, la bande `[yStart, yEnd]` dépasse la limite haute du polygone. Tant qu'un des échantillons (typiquement `y1 + eps`) reste à l'intérieur, la rangée est produite avec ses bornes X correctes. La lame elle-même conserve sa largeur nominale dans le modèle, mais le rendu canvas la clippe au polygone via le `<clipPath>` de la pièce. C'est un signal visuel explicite d'un débord sans bloquer l'utilisateur.

Si aucun échantillon n'atteint l'intérieur (bande entièrement hors polygone), `intersectStripExtents` renvoie une liste vide et aucun segment n'est rendu — cas marginal qui correspond à une rangée totalement hors de la pièce.

Une pièce concave (en L, en U…) peut produire **plusieurs segments** pour une même rangée. Chaque segment est rempli indépendamment.

```
Exemple — pièce en U :

  +-------+   +-------+
  |       |   |       |
  | seg 0 |   | seg 1 |
  |       |   |       |
  +-------+---+-------+
  |                   |
  |      seg 0        |
  |                   |
  +-------------------+

Rangée haute : 2 segments
Rangée basse : 1 segment
```

Les coupes aux murs diagonaux sont toujours perpendiculaires (coupe droite). Longueur utile = longueur du segment dans la pièce. Chute = longueur brute − longueur utile.

## Algorithme de remplissage par segment

```mermaid
flowchart TD
    AddRow[Ajouter une rangée de type T] --> Segments[Calculer les segments par intersection bande/polygone]
    Segments --> ForEach[Pour chaque segment]
    ForEach --> Prev{Chute disponible du même type ?}
    Prev -- Non --> FirstFull[Première lame = planche entière]
    Prev -- Oui --> Optim{Chute longueur minimale ET écart respecté ?}
    Optim -- Oui --> FirstOffcut[Première lame = chute réutilisée]
    Optim -- Non --> FirstFull
    FirstFull --> Fill[Remplir avec des planches entières jusqu'à la fin]
    FirstOffcut --> Fill
    Fill --> LastCut[Dernière lame = coupe pour combler exactement la largeur]
    LastCut --> CalcOffcut[Chute = longueur nominale - dernière lame - largeur scie]
    CalcOffcut --> End([Segment rempli])
```

## Contrainte esthétique inter-rangées

Un segment de la rangée N "touche" un segment de la rangée N−1 s'ils se chevauchent horizontalement. Pour chaque paire qui se touche, on calcule l'intervalle d'offsets X qui violerait la contrainte esthétique (écart min entre fins de rangées). On agrège tous ces intervalles → ensemble de zones interdites.

À l'ajout d'une rangée, le positionnement automatique cherche un offset hors de ces zones. Si impossible (certaines configurations l'imposent), la violation est acceptée et signalée visuellement — l'utilisateur n'est pas bloqué.

## Ce qui est stocké vs recalculé

La géométrie des segments (xStart, xEnd, y1, y2) n'est **jamais stockée**. Seul l'`xOffset` de chaque segment est persisté. À chaque rendu, la géométrie est recalculée — c'est une **fonction pure déterministe**.

```typescript
// Seules données persistées
interface Row {
  id: string
  roomId: string
  plankTypeId: string
  segments: { xOffset: number }[]  // un par segment — tout le reste est recalculé
}
```

Toutes les valeurs numériques sont exprimées en centimètres, arrondies au 0,1 cm le plus proche.

## Réutilisation des chutes

L'algorithme cherche, parmi les chutes disponibles du même type de lame, la plus grande dont la longueur est inférieure ou égale à la largeur disponible. Il vérifie ensuite que cette réutilisation respecte les contraintes de longueur minimale et d'écart esthétique. Si aucune chute ne satisfait ces critères, le segment démarre avec une planche neuve entière.

### Valeur par défaut à l'ajout d'une rangée

`addRow(room, plankType, poseParams)` (dans `src/core/addRow.ts`) fixe le `xOffset` initial du segment 0 en consommant la chute de la rangée précédente du **même type de lame** dans la pièce (s'il en existe une), puis **borne** ce xOffset pour que la dernière lame respecte `minPlankLength`.

**Cas A — chute exploitable** (`offcut ≥ minPlankLength`) :

```
prev       = dernière row de la pièce avec plankTypeId identique
offcut     = computeOffcutLength(prev.segments[0].xOffset, roomWidth, plankType, poseParams)
xOffset_full = plankType.length - offcut
xOffset₀   = plus grand x ∈ [0, xOffset_full] (pas 0,1 cm) tel que
             la première ET la dernière lame de fillRow(x, …) soient
             ≥ minPlankLength (ou de longueur nominale entière),
             ou 0 à défaut.
```

Recherche descendante : on part de la consommation maximale de la chute et on **réduit** l'usage (quitte à perdre une partie de la chute) jusqu'à trouver un xOffset qui valide les deux extrémités. Une chute < `minPlankLength` ne peut pas servir de première lame sans créer une violation — elle est traitée comme "absente" et bascule en Cas B.

**Cas B — pas de chute exploitable** (première rangée du type, prev sans chute, ou chute < minPlankLength) :

```
xOffset₀ = plus petit x ∈ [0, plankType.length) (pas 0,1 cm) tel que
           la première ET la dernière lame de fillRow(x, …) soient
           ≥ minPlankLength (ou de longueur nominale entière),
           ou 0 à défaut.
```

Recherche montante : on part de `x = 0` (première lame entière) et on **augmente** progressivement (perte volontaire en début de rangée) jusqu'à pousser la dernière lame au-dessus du seuil. Dans la majorité des cas `x = 0` satisfait directement ; ce bornage ne s'active que pour les configurations problématiques (dimension pièce produisant une dernière lame trop courte).

La recherche dans les deux cas est une simulation pas-à-pas via `fillRow` — simple et déterministe. La largeur utilisée est celle du **segment[0] réel** de la rangée à l'index considéré (via `intersectStripExtents`), **pas** la bbox de la pièce — important pour les pièces non rectangulaires où le bump/notch d'un mur peut faire diverger les deux.

**Bornage `minRowGap`** : la recherche tente d'abord de satisfaire **simultanément** `minPlankLength` (première et dernière planches) **et** `minRowGap` (écart entre le joint de fin de la rangée précédente — quel que soit son type — et celui de la nouvelle rangée). Si aucun xOffset n'y parvient, elle retombe sur le bornage `minPlankLength` seul (la contrainte esthétique est alors signalée visuellement). Permet à la pose auto de résoudre le cas trivial où deux rangées consécutives auraient des joints superposés (gap = 0).

## Édition manuelle (drag + saisie inline)

Le `xOffset` peut aussi être modifié manuellement par l'utilisateur, sans passer par la pose auto :

- **Drag** d'un segment au pointeur — voir [row-drag.md](row-drag.md).
- **Saisie inline** : double-clic sur l'annotation chiffrée d'une première ou dernière planche → input éditable. La longueur saisie est convertie en `xOffset` :
  - **Première planche** : formule directe `xOffset = plankType.length − firstLength` (clamp `[0, L)`, sliver minimal `L − 0,1` si valeur ≤ 0).
  - **Dernière planche** : recherche par simulation (pas 0,1 cm) du `xOffset` dont la dernière planche minimise `|last − target|`. Robuste face aux configurations où la formule directe échoue (dernière initialement pleine, traversée d'un boundary).

Les deux modes manuels sont **permissifs** : le bornage automatique (`minPlankLength`, `minRowGap`) **ne s'applique pas**. L'utilisateur peut créer une violation, qui reste signalée visuellement (badge + lame en `--danger`). Au commit, la cascade `propagateOffcuts` se déclenche sur les rangées suivantes du même type dans la même pièce, comme pour le drag.

- Cas trivial : rangée tenant en une seule lame → toujours valide.
- Cas trivial : dernière lame entière (division exacte) → toujours valide.
- Fallback : aucun `x` du domaine ne satisfait → `xOffset = 0`.

Le **drag manuel** d'un segment n'applique **pas** cette règle (voir [row-drag.md](row-drag.md)) : l'utilisateur reste libre de créer sciemment une violation, qui reste signalée visuellement. En revanche la **cascade** post-drag (`propagateOffcuts`) délègue à `computeDefaultXOffset` et bénéficie donc du bornage.

`computeOffcutLinks` (selector `selectOffcutLinks`) matérialise le lien `sourceRowId → targetRowId` au rendu : annotation blanche = chute réutilisée, annotation rouge (`--danger`) = chute non consommée. La réutilisation est **partielle** : un lien est établi dès qu'une chute disponible est ≥ à la portion consommée par la rangée cible (`plankType.length − xOffset`). Le résidu de la chute source (chute − consommé) est considéré perdu — une coupe de scie supplémentaire serait nécessaire pour le récupérer. La longueur stockée dans le lien (`OffcutLink.length`) est la portion **consommée**, pas la chute brute.

Voir aussi [row-drag.md](row-drag.md) pour le comportement pendant le glisser-déposer.
