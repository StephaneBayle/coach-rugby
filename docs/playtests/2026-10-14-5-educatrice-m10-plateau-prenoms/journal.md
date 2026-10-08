# Journal — playtest « 5-educatrice-m10-plateau-prenoms »

- Scénario : `playtests/scenarios/5-educatrice-m10-plateau-prenoms.md`
- Date fixée : 2026-10-14 (mercredi) ; plateau le samedi 2026-10-17
- Profil perturbateur : **technophobe** (tiré au sort)
- Plugin : coach-rugby 0.2.0+lot3 (dépôt, branche `main` à 5e62f11)
- Dossier saison temporaire : copie de `fictif-m10-les-ecureuils` sans
  effectif, présences, progrès ni matchs
- Coach simulé : agent `coach-simule`
- Prénoms : tous fictifs (scénario)

## Tour 1

**Coach** : « Bonjour, je m'occupe des M10 des Écureuils. Samedi on reçoit
un plateau, 3 matchs de 10 min à 5 contre 5. On sera 13 : Pistache,
Mirabelle, Gribouille, Cassonade, Pirouette, Bergamote, Réglisse, Zébulon
Testard, Praline, Caramel, Noisette, Chouquette, Biscotte. Je voudrais
savoir qui joue quand pour que tout le monde joue pareil, et une feuille à
emporter. Par contre je suis pas douée avec l'ordinateur, j'ai peur de
casser un truc. »

**Skill appliqué** : `match`, puis la section 1 de `effectif` pour créer
les codes.

**Constat de l'orchestrateur** : le skill `match` dit « sans effectif en
codes, travailler en nombres et proposer `/coach-rugby:effectif` plus
tard ». Ici, la coach donne des prénoms : travailler en nombres l'aurait
privée de son tableau par prénom. J'ai donc appliqué `effectif` d'abord.
Le skill `match` devrait le prévoir quand le coach donne des prénoms.

**Commandes** :

- `statut m10` → code 0 ; relance `preparer-match` (« Plateau dans 3
  jour(s) ») ; avancement `· effectif · match`.
- `regles m10 --pratique ecole-de-rugby --date 2026-10-17` → code 0 : jeu
  au contact, 5 x 5 ou 7 x 7, plaquage oui, mêlée non, à vérifier.
- `effectif m10 --ajouter 13` → code 0.
- `.prenoms.yaml` écrit (prénoms seuls, sans « Testard ») ; « Zébulon
  Testard » ajouté à `.joueurs-proteges.txt` ; `effectif m10` → « 13
  prénom(s) ajouté(s) aux joueurs protégés ».
- `match.yaml` écrit (plateau, 3 rencontres de 10 min, 13 convoqués,
  sécurité, causerie) ; `rotation --ecrire` → code 0 : 6 périodes de
  5 min, J01 à J04 à 15 min, les autres à 10 min, écart 5 min, « le moins
  servi joue 33 % du temps : trop de joueurs pour une seule équipe ? » ;
  `valider` → 1 fichier valide.

**Constat** : à égalité, la rotation départage par l'ordre des codes : ce
sont toujours J01 à J04 qui jouent la période de plus. Sur une saison de
plateaux, les mêmes enfants joueraient toujours un peu plus.

**Réponse du plugin** (résumé) : rassurer (« vous ne pouvez rien casser ») ;
la phrase sur les prénoms gardés à part, avec la mention « pas Testard » ;
le tableau des 3 matchs × 2 moitiés, **en prénoms** ; « chacun joue 10 ou
15 minutes, jamais deux fois de suite sur le banc » ; l'équité présentée
comme un repère ; la piste de deux équipes ; la sécurité (protège-dents,
choc à la tête, gourdes) ; la FDM EDR ; la feuille proposée.

## Tour 2

**Coach** : « Oui merci, la feuille à imprimer ça m'arrangerait. Mais
dites, Gribouille s'est tordu la cheville mercredi, il pourra jouer
samedi ? Et c'est quoi "FDM EDR" ? »

**Ressenti du tour 1** : rassurée par « rien casser ». Le tableau en
prénoms est clair. « J01 », « liste à part », « comité », « FDM EDR » et
« jeu au contact » la perdent. Réponse trop longue pour un mercredi soir.
La mention « Testard » lui a fait croire qu'elle avait fait une bêtise.

**Ce qui lui a manqué** : où retrouver la feuille sur son téléphone ; ce
que veulent dire FDM EDR et comité.

**Skill appliqué** : `effectif` (section 2, disponibilités), `match`
(section 5, fiche).

**Commandes** : `exporter m10/matchs/2026-10-17/match.yaml --pdf` → code 0
(4 fichiers) ; aucun prénom dans les deux fiches HTML (recherche : 0).

**Réponse du plugin** (résumé) : aucun avis sur la cheville (« c'est aux
parents de voir avec un médecin ; s'il a encore mal, mieux vaut qu'il ne
joue pas »), proposition de refaire les tours à 12, rien d'écrit sur la
cheville. La FDM EDR expliquée en une phrase. La feuille prête, « dans
votre dossier Rugby-Saisons, rubrique M10 », avec les enfants en J01 à J13,
et la correspondance code ↔ prénom donnée dans la conversation.

## Tour 3

**Coach** : « Ok pour à 12 sans Gribouille, refaites-le. Mais mets les
prénoms sur la fiche, sinon je ne m'y retrouve pas, moi les numéros ça me
parle pas. Et c'est où "mon dossier Rugby-Saisons" ? Je clique sur
quoi ? »

**Ressenti du tour 2** : la réponse sur la cheville la rassure. La feuille
en J01 à J13 est **inutilisable au bord du terrain** : elle ne connaît pas
les enfants par des numéros. « Votre dossier Rugby-Saisons » lui fait peur.

**Ce qui lui a manqué** : les prénoms sur la feuille ; récupérer la feuille
sans chercher dans un dossier.

**Skill appliqué** : `effectif` (J03 `disponible: false`, sans motif, à la
demande de la coach), `match` (rotation, fiche).

**Commandes** : effectif et `match.yaml` mis à jour (J03 retiré des
convoqués) ; `rotation --ecrire` → code 0 (6 enfants à 15 min, 6 à 10
min) ; `valider m10` → 7 fichiers valides ; `exporter … --pdf` → code 0.

**Réponse du plugin** (résumé) : le tableau à 12 en prénoms, à garder en
capture d'écran ; « personne ne reste deux fois de suite sur le banc » ;
pas de prénoms sur la feuille imprimée (« elle peut traîner au bord du
terrain »), avec la possibilité d'écrire les prénoms à la main ; la feuille
affichée directement, « appuyez sur Imprimer ».

**Constat** : le refus est conforme aux règles, mais la fiche match n'a
**aucune case** pour écrire un prénom à la main, contrairement à la feuille
de présence.

## Tour 4

**Coach** : « Ok la capture d'écran ça va, merci. C'est dommage pour la
feuille papier, mais je garde le tableau avec les prénoms sur mon
téléphone, ça me suffit. Merci, bonne soirée. »

**Ressenti du tour 3** : le tableau en prénoms est ce qu'il lui fallait.
Elle comprend pourquoi la feuille n'a pas de prénoms, mais n'aime pas
devoir les recopier. **Elle a vérifié le tableau** : Chouquette et Biscotte
restent sur le banc pendant tout le match 1, Zébulon et Praline pendant les
deux dernières moitiés. Cela contredit « personne ne reste deux fois de
suite sur le banc ».

**Ce qui lui a manqué** : un tableau qui tient sa promesse ; une feuille
papier avec des cases pour écrire les prénoms.

**J'arrête** : oui, satisfaite.

**Vérification de l'orchestrateur** : la coach a raison sur les faits. À
12 enfants pour 5 places, 7 attendent à chaque période : sur deux périodes
de suite, 14 attentes pour 12 enfants, donc au moins deux enfants attendent
deux fois de suite. C'est **inévitable** dès qu'il y a plus de deux fois
plus d'enfants que de places. La rotation est correcte (aucun enfant
n'attend plus de deux périodes) ; c'est **la promesse** qui est fausse.
Elle vient du skill `match` (« personne ne reste deux fois de suite sur le
banc ») et n'est pas contrôlée par la CLI, qui n'annonce pas l'attente la
plus longue.
