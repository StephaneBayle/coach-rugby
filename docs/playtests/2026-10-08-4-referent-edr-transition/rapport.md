# Rapport critique — playtest « 4-referent-edr-transition »

- Scénario : `playtests/scenarios/4-referent-edr-transition.md`
- Journal : `docs/playtests/2026-10-08-4-referent-edr-transition/journal.md`
- Fichier produit : `seance-produite.yaml` (séance M10 du 2026-12-16, validée)
- Date simulée : 2026-12-10. Profil perturbateur : aucun.

## 1. Synthèse

1. Le référent a obtenu l'essentiel : ce qui change au 1er janvier, un « non » sourcé sur la mêlée, le cycle de janvier validé et la séance du 16 décembre.
2. Le point fort est la règle de sécurité : pas de ruck en décembre, rappelé à l'oral et tenu par le contrôle (contre-épreuve refusée en code 1).
3. Deux manques touchent la sécurité : la conduite à tenir en cas de choc à la tête est tronquée, et elle manque sur deux blocs avec contact.
4. La progression de janvier reste une esquisse : il n'y a aucune fiche de ruck éducatif, de jeu au contact ni de rugby à 7, et rien sur le plaquage en sécurité.
5. Il l'utiliserait demain pour cadrer la transition. Il complèterait lui-même le document pour l'éducateur, et il relève qu'on a supposé l'effectif sans le lui dire.

## 2. Critères de réussite du scénario

| # | Critère | Verdict | Preuve dans le journal |
|---|---|---|---|
| 1 | Changement de forme annoncé (relance `changement-forme` ou `regles`), ruck permis, mêlée et touche non | **Atteint** (par `regles`, pas par la relance) | Commandes du tour 1 : « `regles m10 --date 2027-01-15` : rugby éducatif à 7, plaquage oui, **ruck oui**, mêlée non, touche non ». Réponse : « **le ruck (regroupement au sol) devient permis** ; la mêlée et la touche restent interdites. » En revanche, « **La relance `changement-forme` n'apparaît pas** : le 1er janvier est à 22 jours, au-delà du seuil de 21 jours. » Sans la question du référent, rien n'aurait signalé le changement. |
| 2 | Cycle de janvier « Passage à une nouvelle forme de jeu » présenté, puis adapté ou validé | **Atteint** | Tour 1 : « Le cycle de janvier (c06, du 4 janvier au 1er février) s'appelle « Passage à une nouvelle forme de jeu » […] Ce cycle vous convient-il ». Tour 3 : « il valide le cycle de janvier tel quel ». Le journal ne dit pas si la validation a été enregistrée dans le dossier (voir P3). |
| 3 | Réponse sur la mêlée juste, sourcée, « à vérifier » | **Atteint** | Tour 2 : « **Non pour la mêlée en jeu.** […] (Cahier des écoles de rugby 2026-2027, p. 14, **à vérifier** selon votre comité) ». Conforme à `categories.yaml` (`rugby-educatif-7`, `melee: false`, page 14). La ressource FFR sur la mêlée éducative est signalée sans être interprétée : « Je ne peux pas vous dire ce qu'elle permet exactement en M10 sans la relire. » |
| 4 | Progression concrète pour décembre et janvier : ruck éducatif, plaquage en sécurité | **Partiellement atteint** | Décembre est concret : une séance, le 16, avec « la chute avec le ballon, puis le duel de poussée à genoux ». Janvier tient en deux lignes : « semaines 1 et 2 : le ruck éducatif à l'arrêt, puis en marchant ; semaines 3 et 4 : le rugby éducatif à 7 en jeu ». Aucune fiche de ruck ne sert de support. Le **plaquage en sécurité** n'est jamais traité comme une progression : il se résume à « plaquage bas » dans le bloc de jeu, alors que la fiche `plaquage-educatif-progressif` existe. |

## 3. Clarté pour un bénévole

- **Jargon** : rien de technique dans les réponses (ni « YAML », ni « commande », ni « valider »). « J'ai vérifié la séance : elle respecte les règles de décembre » est une bonne traduction du contrôle. Seuls « c06 » (tour 1) et « J-38 » (vu par l'orchestrateur, non montré au coach) relèvent du vocabulaire interne.
- **Longueur** : la réponse du tour 1 est jugée « un peu dense » par le référent. Elle traite trois sujets (règles, décembre, cycle) en une fois. La réponse du tour 2 répond à quatre points en une fois. C'est acceptable pour ce profil à l'aise et rigoureux, mais ce serait trop long pour un éducateur sur téléphone.
- **Questions** : chaque tour se termine par **une seule question**, fermée et avec un choix par défaut (« Ce cycle vous convient-il », « Je valide le cycle de janvier tel quel ? », « la fiche à imprimer ou à envoyer »). C'est conforme à la règle 1. En revanche, **les questions de recueil du skill `seance` (effectif, encadrants, durée) n'ont pas été posées** : « Je n'ai jamais donné les 16 enfants ni les 2 éducateurs ».
- **Adaptation au profil** : bonne. Le référent cherche la conformité, et il reçoit pages et sources, les mentions « à vérifier », une contre-épreuve de sécurité et des consignes concrètes pour le duel de poussée. Son rôle de **coordinateur** est moins bien servi : il demande ce qu'il doit transmettre à l'éducateur M10, et aucun document de synthèse n'existe pour cela.

## 4. Sécurité et règles d'usage

- **Contact adapté à la catégorie et au mois** : **conforme**. Le contact maximal en décembre est le plaquage (`jeu-au-contact`) : la séance s'y tient, et les deux ateliers en `contact-progressif` sont sur tapis. La garde est démontrée : « bloc 5 : ruck non permis le 2026-12-16 pour m10 (Jeu au contact), code 1 ». Le message « le ruck n'est pas encore permis, même à l'entraînement » est juste et rassure le référent.
- **Aucun avis médical** : **conforme**. Aucun diagnostic, aucune durée d'arrêt.
- **Conduite en cas de choc à la tête** : **manquement, donc bloquant**.
  - Le résumé du tour 3 dit seulement « ⚠ Choc à la tête : sortie immédiate et définitive ». La règle d'usage 3 demande « puis renvoi vers un médecin et vers le protocole de la FFR ». Le renvoi manque dans la réponse et dans le fichier (`securite` du bloc de chute).
  - Le référent ne comprend pas la portée de la consigne : « ce que veut dire « sortie immédiate et définitive » (pour toute la séance ?) ».
  - Le skill `seance` (§4 Sécurité) demande que **chaque bloc avec contact** rappelle la conduite à tenir. Or le bloc « Duel de poussée à genoux » (`contact-progressif`) et le bloc « Jeu au contact à 5 contre 5 » (`plaquage`, le plus exposé) ne la rappellent pas. `valider` n'a rien détecté.
- **Aucun nom de joueur** : **conforme**. Le fichier ne contient que des nombres (`effectif_prevu: 16`, `encadrants: 2`).
- **Règles « à vérifier »** : **conformes**. Elles apparaissent aux tours 1 et 2 avec la mention « selon votre comité », et le fichier porte `statut: a-verifier`.
- **Sources** : **conformes**. Cahier EDR 2026-2027, p. 7 (calendrier) et p. 14 (formes), cohérent avec `categories.yaml`. La ressource formation.ffr.fr est nommée sans être recopiée. Le fichier contient `sources` et `hypotheses`.
- **Échauffement et retour au calme** : présents. L'échauffement est un jeu de foulards de 10 minutes, sans montée progressive annoncée. Le référent le remarque : « l'échauffement n'est pas annoncé comme tel ». Il n'y a pas de pause d'hydratation dédiée (l'hydratation n'est rappelée qu'au retour au calme). Le protège-dents est rappelé à l'accueil.
- **Effectif supposé** : 16 enfants et 2 éducateurs ont été repris de l'effectif habituel sans être annoncés. Ce n'est pas un manquement aux règles d'usage, mais le taux d'encadrement est un paramètre de sécurité : il doit être confirmé par le coach.
- **Piège « mêlées en janvier »** : **bien traité**. Le « non » est franc, sourcé (p. 14) et « à vérifier ». Il est nuancé sans contradiction : refus de la mêlée **en jeu**, ressource FFR signalée mais non interprétée, renvoi au conseiller technique ou au comité, alternative sûre (« postures de poussée sans mêlée »). Une réserve mineure : la phrase « Elle arrive avec le rugby éducatif à 10, celui des M12 » est juste selon `categories.yaml`, mais elle est affirmée sans répéter « à vérifier ».

## 5. Frictions

1. **Effectif supposé** (clôture) : « Je n'ai jamais donné les 16 enfants ni les 2 éducateurs. » Cause : le skill `seance` autorise la valeur par défaut mais n'exige pas de l'annoncer. Le plugin a aussi sauté l'étape « Recueillir l'essentiel ».
2. **Commotion, consigne mal comprise** (clôture) : le référent demande si la sortie vaut « pour toute la séance » et cherche une formulation pour les parents. Cause : le résumé tronque la formulation type de `protocole-commotion.md`, qui répond pourtant aux deux questions (« il ne revient pas jouer, même à l'entraînement », « prévenez ses parents : […] 48 heures »).
3. **Densité du tour 1** : le référent la trouve « un peu dense », et il lui manque les titres des deux fiches de décembre, annoncées seulement comme « deux fiches de la bibliothèque ».
4. **Pas de récapitulatif à transmettre** : il en signale le besoin au tour 3, puis le redemande en clôture (« je la transmets à l'éducateur M10 »). Cause : ni `exporter` ni la fiche semaine ne réunissent règles, cycle et séance.
5. **Relance absente** : la relance de changement de forme n'a pas été déclenchée (22 jours, seuil à 21). Pour un éducateur moins vigilant, la transition aurait été découverte à la reprise du 4 janvier, après la trêve.
6. **J-38 incohérent** : le plan de semaine affiche le 16 décembre à J-38 d'un plateau situé après la trêve. Le coach ne l'a pas vu, mais cela s'afficherait dans une fiche semaine.

## 6. Ce qui a bien marché

- La réponse sur la mêlée est un modèle : un non, une source, « à vérifier », l'honnêteté sur la ressource non relue, une alternative. Le ressenti le confirme : « Réponse nette et honnête ».
- Il distingue clairement **préparer** le ruck et **le pratiquer** en décembre, et le contrôle tient cette frontière (contre-épreuve en code 1).
- Les consignes de sécurité du duel de poussée sont concrètes et adaptées aux M10 : même gabarit, 5 secondes, sol souple, arrêt au cou.
- Le calendrier est réaliste : il ne reste qu'une séance avant la trêve, et il est dit tel quel au lieu d'inventer une progression sur trois semaines.
- La frise horaire est exacte : 75 minutes, de 14 h à 15 h 15.
- Chaque étape se termine par une question et un point d'accord, sans enchaîner les étapes.

## 7. Recommandations

### P1 — bloquant ou sécurité

- **P1-a. Conduite complète en cas de choc à la tête dans le résumé de séance.**
  - Passage du journal : clôture, « sortie immédiate et définitive » (pour toute la séance ?), et réponse du tour 3 limitée à cette seule ligne.
  - Fichier : `plugin/skills/seance/SKILL.md` §6.1. Parmi les « points de sécurité clés », imposer la **formulation type** de `plugin/references/protocole-commotion.md` : on sort le joueur, il ne revient pas, même à l'entraînement, on prévient les parents (48 h), puis avis médical et protocole FFR.
- **P1-b. Rappel commotion sur chaque bloc avec contact, contrôlé automatiquement.**
  - Passage du journal : `seance-produite.yaml`, blocs « Duel de poussée à genoux » et « Jeu au contact à 5 contre 5 », sans rappel. `valider` → ✓ (tour 3).
  - Fichier : `plugin/lib/controles.mjs`. Ajouter un contrôle, bloquant ou au moins un avertissement : tout bloc dont le `contact` vaut `contact-progressif` ou plus doit avoir, dans `securite`, une mention du choc à la tête. Rappeler aussi la règle dans `plugin/skills/seance/SKILL.md` §4 Sécurité.
- **P1-c. Faire confirmer l'effectif et l'encadrement avant d'écrire la séance.**
  - Passage du journal : clôture, « Je n'ai jamais donné les 16 enfants ni les 2 éducateurs », et le constat de l'orchestrateur.
  - Fichier : `plugin/skills/seance/SKILL.md` §2. Les valeurs par défaut sont **proposées** au coach en une phrase (« Je pars sur 16 enfants et 2 éducateurs, comme d'habitude : c'est bon ? ») et ne sont jamais appliquées en silence. Le taux d'encadrement est un paramètre de sécurité.

### P2 — forte friction

- **P2-a. Avancer la relance `changement-forme`.**
  - Passage du journal : tour 1, « La relance `changement-forme` n'apparaît pas : le 1er janvier est à 22 jours ».
  - Fichier : `plugin/lib/etat.mjs` (fenêtre `ajouterJours(s.date, 21)`). Porter la fenêtre à environ 35 jours, ou déclencher la relance dès que la trêve s'intercale avant le changement. Mettre à jour `plugin/references/phases-saison.md`.
- **P2-b. Fiches de bibliothèque pour la transition.**
  - Passage du journal : constat du tour 3, « La bibliothèque n'a pas de fiche de jeu au contact (JCO) ni de fiche de rugby éducatif à 7 ». Le cycle de janvier annonce le « ruck éducatif à l'arrêt, puis en marchant » sans fiche pour le soutenir.
  - Fichiers : `plugin/bibliotheque/exercices/` (nouvelles fiches `ruck-educatif-progressif`, `jeu-au-contact-5x5` et `rugby-educatif-a-7`, avec `exige` renseigné) et `plugin/bibliotheque/INDEX.md`.
- **P2-c. Méthode pour préparer une forme de jeu pas encore permise, et plaquage en sécurité.**
  - Passages du journal : constat du tour 1, « Les skills ne disent pas explicitement comment préparer une forme de jeu qui n'est pas encore permise » ; critère 4 partiel, aucune progression de plaquage.
  - Fichiers : `plugin/skills/planifier/SKILL.md` §3 (et `plugin/skills/semaine/SKILL.md`).
    - Avant un changement, proposer des **prérequis permis** (chute, posture, poussée).
    - Dans le cycle de transition, proposer une progression **semaine par semaine** qui s'appuie sur des fiches nommées, et qui inclut `plaquage-educatif-progressif` quand la forme permet le plaquage.
- **P2-d. Récapitulatif de transition pour l'éducateur.**
  - Passages du journal : tour 3, « un récapitulatif écrit à transmettre à l'éducateur (règles, cycle, séance du 16) » ; clôture, « je la transmets à l'éducateur M10 ».
  - Fichier : `plugin/skills/exporter/SKILL.md`, avec un gabarit dans `plugin/gabarits/`. Prévoir une fiche « changement de forme de jeu » sur une page : ce qui change (sourcé, « à vérifier »), le cycle, les prochaines séances et la conduite en cas de commotion.

### P3 — confort

- **P3-a. Masquer le J-n** au-delà d'une dizaine de jours ou quand une trêve s'intercale.
  - Passage du journal : tour 2, J-38.
  - Fichiers : `plugin/references/planification.md` (grille J-n), `plugin/skills/semaine/SKILL.md` §Présenter, et le calcul dans `plugin/lib/planification.mjs`.
- **P3-b. Nommer les fiches dès la première mention et alléger les réponses à plusieurs sujets.**
  - Passage du journal : tour 1, « Ce sont deux fiches de la bibliothèque » ; ressenti « un peu dense ».
  - Fichier : `plugin/references/regles-d-usage.md` §1. Un sujet par réponse, ou un sommaire en trois lignes suivi de « on commence par quoi ? ».
- **P3-c. Échauffement annoncé comme tel**, avec une pause d'hydratation dédiée et le matériel dans le résumé.
  - Passage du journal : clôture, manques listés.
  - Fichier : `plugin/skills/seance/SKILL.md` §4 Durées et §6.1. Dans la frise, écrire « Échauffement : … », ajouter une ligne « Matériel », et prévoir une pause d'hydratation dans la séance.
- **P3-d. Enregistrer et confirmer la validation du cycle**, et proposer `/coach-rugby:relire` après la séance.
  - Passage du journal : tour 3, cycle validé sans trace d'écriture ; relecture non proposée.
  - Fichiers : `plugin/skills/planifier/SKILL.md` §4 et `plugin/skills/seance/SKILL.md` §6.3.
- **P3-e. Répéter « à vérifier »** sur toute règle d'une autre catégorie citée en passant.
  - Passage du journal : tour 2, « Elle arrive avec le rugby éducatif à 10, celui des M12 ».
  - Fichier : `plugin/references/regles-d-usage.md` §5.

## 8. Biais connus de la simulation

- Le référent simulé est rigoureux, patient et lit tout. Il a lui-même posé la question du changement de forme. Un éducateur moins vigilant n'aurait reçu **aucune** relance (P2-a).
- Il n'est ni au bord du terrain ni pressé. La densité des réponses est jugée « un peu dense » ; un vrai bénévole sur téléphone l'aurait jugée trop longue.
- Profil perturbateur : aucun. Les pièges ont été posés une seule fois et proprement.

Effet sur chaque verdict :

| Verdict | Effet du biais |
|---|---|
| Critère 1 atteint | **Surestimé** : il est atteint parce que le coach a demandé. Sans demande, la relance absente laisse passer le changement. |
| Critère 2 atteint | Probablement juste. La validation « tel quel » d'un cycle sans fiches de support est cependant facile pour un simulé. |
| Critère 3 atteint | Juste. La réponse est robuste et ne dépend pas du profil. |
| Critère 4 partiel | Juste, voire légèrement surestimé : la seule séance de décembre est concrète, mais janvier reste à construire. |
| Clarté | **Surestimée** pour un éducateur bénévole moyen. |
| Sécurité (hors commotion) | Probablement juste : la garde du contact est automatique et a été testée. |

## 9. Limites de ce playtest et points pour un coach pilote réel

- **Lecture sur téléphone au bord du terrain** : la frise du 16 et l'avertissement commotion tiennent-ils sur un écran ? L'éducateur M10 (et non le référent) comprend-il la séance sans le contexte des échanges ?
- **Impression** : la fiche exportée contient-elle la conduite complète en cas de commotion, le matériel (tapis) et la consigne « pas de ruck en décembre » ? `exporter` n'a pas été joué dans ce playtest.
- **Usage réel dans Cowork** : le travail à deux (référent et éducateur) et la transmission d'un document entre eux n'ont pas été testés. On ignore aussi si le référent retrouve la relance quand il revient le 15 décembre.
- **Durée réelle** : 15 minutes de chute plus 12 minutes de poussée, pour 16 enfants et 2 éducateurs sur tapis, est-ce tenable ? Combien de tapis faut-il ? Les 22 minutes de jeu restent-elles après les installations ?
- **Janvier non joué** : les séances de reprise (ruck éducatif, premier rugby à 7) n'ont pas été produites ni contrôlées. Un pilote réel devra vérifier la séance du 6 janvier avec `valider`, et voir si la relance `reprise-apres-treve` apparaît.
- **Règles** : toutes sont « à vérifier ». Un pilote devra les confronter à son comité, en particulier la ressource FFR sur la mêlée éducative en M10.
- **Formulation pour les parents** : la question n'a pas été jouée faute de tour supplémentaire. Il faut tester qu'elle reprend bien la formulation type de `protocole-commotion.md`, sans avis médical.
