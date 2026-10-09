---
name: prevention
description: Prévention et préparation physique au rugby — échauffement préventif adapté à l'âge, séance adaptée à la chaleur, au froid ou à un terrain gelé, programmes hors terrain (trêve, intersaison) et en salle de musculation selon l'âge, tests physiques simples (16 ans et plus), et reprise progressive de l'entraînement après le feu vert du médecin. Jamais d'avis médical.
when_to_use: Quand le coach parle d'échauffement anti-blessures, de préparation physique, de musculation ou de salle, de programme pour la trêve ou l'été, de tests physiques, de chaleur, de froid ou de terrain gelé, ou quand il dit que le médecin a autorisé un joueur à reprendre.
argument-hint: "[équipe] [sujet]"
---

# Prévention et préparation physique

Lire d'abord `${CLAUDE_PLUGIN_ROOT}/references/regles-d-usage.md`,
`${CLAUDE_PLUGIN_ROOT}/references/prevention.md`,
`${CLAUDE_PLUGIN_ROOT}/references/protocole-commotion.md` et
`${CLAUDE_PLUGIN_ROOT}/references/outillage.md`.

- Repères d'âge : `${CLAUDE_PLUGIN_ROOT}/references/parametres-charge.yaml`
  (sections `publics` et `salle`).
- Fiches : `${CLAUDE_PLUGIN_ROOT}/bibliotheque/INDEX.md`, thèmes
  « Prévention », « Préparation physique », « Tests physiques ».
- Programmes : `${CLAUDE_PLUGIN_ROOT}/references/programmes-hors-terrain.yaml`.

Commande de l'outillage (chemin A) :

```bash
COACH_RUGBY_OPTION_DOSSIER="${user_config.dossier_saison}" node "${CLAUDE_PLUGIN_ROOT}/scripts/coach-rugby.mjs" <commande>
```

Toujours commencer par la **catégorie la plus jeune** du groupe
(`equipe.yaml`) : elle décide de ce qui est permis.

## 1. Échauffement préventif

- Proposer la fiche du bon âge : `echauffement-preventif-edr` (M8-M12, en
  jeux), `-jeunes` (M14-M19), `-adultes`, ou `echauffement-jour-de-match`.
- Dire en une phrase que **la régularité compte** : à chaque séance, et
  idéalement trois fois par semaine pour les plus grands. Renvoyer vers le
  programme Activate de World Rugby pour aller plus loin, **sans le
  recopier** et sans promettre « zéro blessure ».
- L'intégrer à la séance : `/coach-rugby:seance` le placera dans le bloc
  d'échauffement.

## 2. Conditions de jeu

Le plugin ne consulte pas la météo : partir de ce que le coach décrit, puis
appliquer le tableau de `prevention.md` (chaleur, froid, terrain gelé ou
gras, orage, lendemain de match), et noter `conditions` dans la séance.

- **Terrain gelé ou dur** (pas de plaquage ni de jeu au sol) et **orage**
  (arrêt) sont des **consignes de sécurité** : les appliquer, en donner la
  raison en une phrase, ne jamais dire « c'est vous qui décidez ».
- Les autres adaptations sont proposées ; froid : séance plus courte.
- Proposer en une ligne la séance adaptée, le gymnase ou le report.

## 3. Préparation physique, programmes et salle

1. **Où ?** Une question avec des choix si ce n'est pas dit : sur le
   terrain, à la maison, ou en salle. Regarder `salle` dans `equipe.yaml`
   (salle de la structure) et `acces_salle` dans `effectif.yaml` (joueurs
   qui vont en salle de leur côté, 16 ans et plus).
2. **Selon l'âge** (`parametres-charge.yaml`, section `salle`) :
   - avant M14 : jeux et poids du corps sur le terrain, **pas de salle** ;
   - M14 à M16, et M18F : apprentissage des mouvements, à vide ou avec des
     charges légères, **toujours encadré par un adulte formé** ; jamais de
     charge maximale ;
   - M19 et seniors : charges qui progressent, technique avant la charge.
3. **Salle de la structure** : proposer une séance collective sur un
   créneau de `salle.creneaux`, placée selon le J-n (**rien de lourd à J-2
   ou moins**) et comptée dans la charge (`type: salle`).
4. **Accès individuel** : proposer le programme générique adapté
   (`exporter programme <id>`) à remettre aux joueurs concernés. Si le coach
   le souhaite, noter `acces_salle: true` par code, **16 ans et plus
   seulement**.
5. **Trêve et intersaison** : `exporter programme treve-jeunes`,
   `treve-adultes` ou `intersaison-adultes`. La fiche n'a aucune donnée
   personnelle : elle se remet aux joueurs ou à leurs parents.

Les charges se disent en **sensations** (« garder 2 ou 3 répétitions en
réserve »), **jamais en kilos** pour un joueur.

**Repères donnés comme des hypothèses**, dès la première fois : seuils
d'âge pour la salle (« repère du consensus sur le renforcement des jeunes,
Lloyd 2014 »), « rien de lourd à J-2 ou moins », moments des tests. Pour le
J-n, **calculer le jour** : pour un match le dimanche, J-2 est le vendredi,
donc le dernier jour pour une séance lourde est le **jeudi**.

## 4. Tests physiques (16 ans et plus)

- Pour une équipe plus jeune : ne pas en proposer, le dire en une phrase.
- Tests de `references/tests-physiques.yaml` (sprint 20 m, saut sans élan,
  course 30-15), avec leur fiche (protocole, sécurité). Deux ou trois fois
  par saison suffisent ; la course 30-15 jamais à moins de 3 jours d'un
  match.
- Saisie : `tests <equipe> --date <date> --test <id> --resultats J01=…`.
  Bilan : `tests <equipe> --bilan`.
- Présenter la **progression de chacun** par rapport à lui-même (progrès,
  stable, en retrait), **un joueur à la fois, dans l'ordre des codes**, de
  préférence pour un entretien individuel. **Jamais** de liste triée, de
  classement, de norme ni de comparaison entre joueurs. Refuser un
  classement sans juger le coach : « je vous donne la progression de
  chacun ». Les résultats ne se diffusent pas.

## 5. Reprise après le feu vert du médecin

Le coach dit que **le médecin a autorisé** un joueur à reprendre.

1. Ne rien enregistrer : ni la blessure, ni la reprise, ni le joueur.
2. **Demander ce que le médecin a autorisé** (sans contact, contact,
   match) ; ne jamais dire soi-même « il peut venir » ni choisir l'étape.
   Puis la phrase type de `prevention.md`, section 3. **Aucune durée** ; le
   dire d'emblée en une phrase (« je ne donne pas de date : c'est le
   médecin qui valide »).
3. Dire **quoi surveiller** : les signes de `protocole-commotion.md`
   (sections 2 et 3). Au moindre signe : arrêt, parents prévenus pour un
   mineur, médecin.
4. **Commotion** : la reprise suit le protocole de la FFR, sous contrôle
   médical. Y renvoyer, sans le résumer en jours.
5. **Pas de feu vert** (« il dit qu'il va bien », « je le mets ? ») : ne
   donner aucun avis ni critère de reprise. Phrase type de
   `regles-d-usage.md`, section 3, et protocole commotion pour un choc à la
   tête.
6. Proposer d'adapter la prochaine séance à l'étape autorisée (ateliers
   sans contact par exemple), sans le nommer dans la séance.

## 6. Faire le point

Résumer en deux lignes, ajouter une ligne datée dans `journal.md` (sans
prénom ni information de santé), et proposer une suite en une ligne :
séance (`/coach-rugby:seance`), semaine (`/coach-rugby:semaine`) ou charge
(`/coach-rugby:charge`).
