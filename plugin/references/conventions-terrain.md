# Conventions des schémas de terrain

Les schémas s'écrivent dans le bloc `schema:` d'une fiche d'exercice (voir
`schemas/exercice.schema.json`) et se dessinent en SVG. Le générateur
(`coach-rugby.mjs terrain`, chemin A) et Claude à la main (chemin B) suivent
exactement les mêmes règles et produisent le même dessin.

## Repère

- **1 unité = 1 mètre.**
- Origine en haut à gauche. **x** suit le sens de l'attaque, de gauche à
  droite ; **y** suit la largeur, la touche gauche en haut.
- Surface : `type` (`terrain`, `demi`, `quart`, `atelier`), `longueur` (x),
  `largeur` (y). Les dimensions doivent être celles de l'`espace` de la fiche.
  Dimensions réglementaires d'un terrain : à vérifier (Lois du jeu, règlements
  de la catégorie).
- `lignes` : lignes verticales en tirets à une abscisse `x`, avec un libellé
  facultatif (`en-but`, `départ`…).

## Échelle

`k = max(1, max(longueur, largeur) / 25)`. Les symboles ont un rayon de
`0,9 × k` (`0,675 × k` pour le ballon et le plot) ; les textes font `1,1 × k`.
Ainsi un atelier de 20 × 15 m et un terrain de 100 × 70 m restent lisibles.

`viewBox = "-2k -2k (longueur + 4k) (largeur + 4k + hauteur de légende)"`.

## Symboles

Ils sont définis une fois dans `gabarits/terrain.svg` (boîte de −1 à 1) et
placés avec `<use href="#…" x="x − r" y="y − r" width="2r" height="2r"/>`.

| `type` | Symbole | Signification |
|---|---|---|
| `attaquant` | disque plein | joueur de l'équipe qui attaque |
| `porteur` | disque plein cerclé | porteur du ballon |
| `defenseur` | triangle vide | défenseur |
| `educateur` | carré marqué « E » | éducateur, entraîneur |
| `ballon` | ovale | ballon posé |
| `plot` | petit triangle gris | plot, coupelle |
| `piquet` | trait vertical | piquet |
| `bouclier` | rectangle arrondi | bouclier, sac de plaquage |

**Les formes priment sur la couleur** : tout reste lisible imprimé en noir et
blanc.

## Trajets

Chemin `M de L a`, ou courbe `M de Q via a` si `via` est donné, avec une flèche
(`marker-end="url(#fleche)"`).

| `type` | Trait |
|---|---|
| `course` | plein |
| `passe` | tirets (`stroke-dasharray="1 0.6"`) |
| `pied` | pointillés (`stroke-dasharray="0.25 0.45"`) |
| `replacement` | plein, fin et grisé |

## Zones

Rectangles hachurés (`fill="url(#hachures)"`) avec un libellé en haut à gauche.

## Étiquettes

- **Uniquement** des codes : `A1`, `A2`… pour les attaquants, `D1`… pour les
  défenseurs (une lettre majuscule et au plus deux chiffres). **Jamais de
  prénom.**
- Placées en haut à droite du symbole.

## Accessibilité et légende

- `<title>` (titre de la fiche) et `<desc>` (but et organisation) sont
  obligatoires.
- Une légende sous le terrain, sur trois colonnes, ne reprend que les symboles
  et trajets utilisés.

## Contrôles

Chaque élément, trajet et zone reste dans la surface ; les types sont connus ;
les étiquettes respectent le format ci-dessus.
