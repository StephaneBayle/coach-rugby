# Prévention : échauffement, conditions, reprise progressive

Ce que coach-rugby propose pour **réduire les risques à l'entraînement**. Ce
n'est **jamais un avis médical**. Les repères ci-dessous sont des
**hypothèses pédagogiques**, sauf mention d'une source
(`references/sources.yaml`).

## 1. Échauffement préventif

- Un échauffement qui travaille l'**équilibre**, le **renforcement**, les
  **sauts et réceptions** et les **changements d'appui**, refait à
  **chaque séance**. La régularité compte plus que la durée.
- Le programme de référence est **Activate**, de World Rugby
  (`world-rugby-activate`). coach-rugby en reprend les principes dans des
  fiches originales, sans copier ses exercices :
  - `echauffement-preventif-edr` (M8 à M12, en jeux) ;
  - `echauffement-preventif-jeunes` (M14 à M19) ;
  - `echauffement-preventif-adultes` ;
  - `echauffement-jour-de-match` (version courte).
- Les effets annoncés concernent surtout les équipes qui le font **trois
  fois ou plus par semaine** (`world-rugby-activate`, `hislop-2017-activate`).
  C'est une piste sérieuse, pas une garantie : ne jamais promettre « zéro
  blessure ».

## 2. Conditions de jeu (décrites par le coach)

Le plugin ne consulte pas la météo : il adapte la séance à ce que le coach
décrit, et note la condition dans la séance (`conditions` : gel, chaleur,
froid, pluie, vent, orage).

Deux consignes sont des **consignes de sécurité du plugin**, appliquées
toujours, même si elles ne viennent pas d'une source : **terrain gelé = ni
plaquage ni jeu au sol** ; **orage = arrêt et mise à l'abri**. `valider` les
contrôle. On en donne la raison en une phrase, sans dire « c'est vous qui
décidez ». Les autres lignes sont des adaptations proposées.

| Situation | Adaptation proposée (hypothèses) |
|---|---|
| **Chaleur** | Séance aux heures les plus fraîches ; pause d'hydratation toutes les 15 à 20 minutes ; intensité et durée réduites ; zone d'ombre ; chacun a sa gourde |
| **Froid** | Échauffement plus long ; couches de vêtements retirées au fil de l'échauffement ; pas d'attente immobile ; séance plus courte (par exemple 60 à 75 minutes au lieu de 90) et plus continue |
| **Terrain gelé ou dur** | **Consigne de sécurité : pas de plaquage ni de jeu au sol** (chaque chute se termine sur un sol dur, les appuis glissent) ; jeux au toucher, passes, déplacements ; ou séance reportée ou déplacée en gymnase |
| **Terrain gras ou pluie** | Moins de vitesse et de changements d'appui brusques ; crampons adaptés ; contacts réduits si les appuis sont mauvais ; ballons séchés |
| **Orage** | **Consigne de sécurité** : arrêter la séance et mettre tout le monde à l'abri |
| **Après un match** | Récupération à J+1 ou J+2, sans gros contact : la fatigue et les douleurs sont les plus marquées 12 à 36 h après un match et s'estompent le plus souvent entre 24 et 72 h (`naughton-2021-fatigue-rugby`) |

En cas de malaise d'un joueur, appliquer `regles-d-usage.md`, section 3
(détresse : 15 ou 112).

## 3. Reprise progressive après le feu vert du médecin

Le coach dit que **le médecin a autorisé la reprise** (après une blessure ou
une commotion). coach-rugby propose alors une **progression
d'entraînement**, rien de plus.

- **Rien n'est enregistré** : ni la blessure, ni la reprise, ni le joueur.
- **Aucune durée** n'est donnée. Chaque étape est validée par le coach, et
  par le médecin quand il l'a demandé.
- **Commotion** : la reprise suit le **protocole gradué de la FFR**, sous
  contrôle médical (`ffr-cahier-edr-2026-2027`, p. 17-18 ;
  `world-rugby-commotion`). Le plugin y renvoie, sans le reproduire ni le
  résumer en durées.

- **Le plugin ne décide pas de l'étape** et ne dit jamais « il peut venir »
  ou « c'est une bonne première étape ». Il demande **ce que le médecin a
  autorisé** (reprise sans contact ? contact ? match ?) et adapte la séance
  à cette étape. Pour un mineur, les **parents** sont informés de la reprise.
- **Ce qu'il faut surveiller** à chaque séance : les signes de
  `protocole-commotion.md` (sections 2 et 3 : maux de tête, vertiges,
  nausées, fatigue anormale, trouble de l'équilibre, comportement
  inhabituel…). Au moindre signe : arrêt, parents prévenus, médecin.

Étapes d'entraînement proposées (hypothèse pédagogique), à suivre selon ce
que le médecin a autorisé :

1. **Sans contact** : course, passes, jeux au toucher, à intensité
   croissante.
2. **Contact contrôlé** : boucliers, contact à genoux ou au ralenti, avec un
   partenaire choisi.
3. **Contact plein** à l'entraînement.
4. **Match**.

On passe à l'étape suivante si l'étape en cours se passe **sans gêne**. Au
moindre signe qui revient, on revient en arrière et on en parle au médecin.
Phrase type :

> Le médecin a donné son feu vert : qu'a-t-il autorisé exactement (reprise
> sans contact, avec contact, match) ? Je prépare la séance pour cette
> étape. La suite se fait par étapes : sans contact, contact contrôlé,
> contact plein, puis match ; on n'avance que si tout se passe bien. Au
> moindre signe (maux de tête, vertiges, fatigue inhabituelle…), on arrête,
> on prévient les parents et on revoit le médecin. Pour une commotion, c'est
> le protocole de la FFR qui fixe les étapes, sous contrôle médical.

## 4. Salle de musculation ou de fitness

Les repères d'âge sont dans `parametres-charge.yaml`, section `salle` :

- **avant M14** : pas de salle, poids du corps et jeux seulement ;
- **M14 à M16, et M18F** : apprentissage des mouvements à vide ou avec des
  charges légères, **toujours encadré par un adulte formé**, la technique
  avant la charge (`lloyd-2014-renforcement-jeunes`) ;
- **M19 et seniors** : des charges qui progressent sur plusieurs semaines
  (`nsca-essentials-2016`).

Les charges s'expriment en **sensations** (« garder 2 ou 3 répétitions en
réserve »), jamais en kilos propres à un joueur. Pas de séance lourde à J-2
ou moins d'un match.
