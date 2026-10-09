# Playtests simulés

Outil de **développement** du dépôt : il n'est pas livré dans le plugin.

Le skill `.claude/skills/playtest` fait jouer un coach fictif (agent
`coach-simule`) face au plugin tel qu'il est dans le dépôt. L'orchestrateur
applique réellement les skills et la CLI, dans un dossier saison temporaire.
L'agent `critique-playtest` écrit ensuite le rapport.

- Scénarios : [`playtests/scenarios/`](../../playtests/scenarios/).
- Résultats : un dossier `<AAAA-MM-JJ>-<scénario>/` par playtest, avec
  `journal.md` et `rapport.md`.

Lancer un playtest depuis une session Claude Code ouverte dans le dépôt :

```text
/playtest 2-entraineur-f3-derby
```

**Limites.** Un coach simulé est plus patient et plus méthodique qu'un vrai
bénévole, et il ne teste ni le terrain, ni le téléphone au soleil, ni
l'imprimante du club. Les playtests préparent les tests avec de **vrais
coachs pilotes** (lot 6) ; ils ne les remplacent pas.

Tout est fictif : aucune donnée réelle dans les journaux ni dans les
rapports.

## Synthèse des playtests du 2026-10-08 (lot 2)

| Scénario | Résultat du coach simulé | Points forts | Défauts majeurs relevés |
|---|---|---|---|
| 1. Éducateur M8 débutant | « Je saurais quoi faire mercredi » | Réponse sur l'asthme sans avis médical ; prénom protégé | Règles des jeux absentes du résumé ; vocabulaire « dossier » anxiogène ; pas d'appel au 15 ou au 112 en cas de détresse ; matériel non disponible demandé |
| 2. Entraîneur F3, derby | « Utilisable jeudi tel quel » | Refus du contact intense argumenté, sans moraliser | Intention incohérente dans le bloc d'affûtage ; ligne Sécurité incomplète (protège-dents, médecin) ; règles « à vérifier » non dites |
| 3. Coach féminines à 7 | Satisfaite (« court, exactement ce qu'il me fallait ») | Réponse courte ; renvoi au club pour la joueuse de 16 ans | Protège-dents absent malgré du plaquage ; pas d'affûtage avant un tournoi ; mise en place des plots jamais donnée ; condition d'admission non sourcée |
| 4. Référent EDR, passage au rugby éducatif à 7 | Satisfait | « Non » net, sourcé et « à vérifier » sur la mêlée ; ruck refusé en décembre par `valider` | Effectif supposé appliqué en silence ; relance de changement de forme trop tardive ; pas de fiche de ruck |

### Corrigé dans ce lot

- **Sécurité, contrôlée par `valider`** :
  - tout bloc avec contact rappelle la conduite en cas de choc à la tête ;
  - toute séance avec plaquage parle du protège-dents.
- **Format de réponse imposé dans le skill `seance`** :
  - règles des jeux en une ou deux phrases ;
  - mise en place et matériel en quantités ;
  - règles du jour « à vérifier », avec leur source ;
  - ligne Sécurité complète ;
  - « si ça coince » ;
  - relecture proposée avant l'export.
- **Règles d'usage** :
  - pas de jargon (dossier, fichier, chemin) ;
  - valeurs supposées annoncées ;
  - parcours express ;
  - réponse courte pour les coachs pressés ;
  - maladie chronique et détresse : appeler le 15 ou le 112 ;
  - groupes qui mêlent mineurs et adultes.
- **Planification** :
  - intention « volume réduit » dans un bloc d'affûtage ;
  - J-n masqué au-delà de 14 jours ou à travers la trêve ;
  - affûtage avant les tournois importants ;
  - relance de changement de forme 35 jours avant.
- **Skills** :
  - `semaine` : conduite quand le coach s'écarte d'un repère, réponse sur la
    « charge », cas d'un seul créneau par semaine ;
  - `saison` : mode « échéance seule » ;
  - `exporter` : fiche remise sans chemin, texte pour Mon Coach Assistant
    seulement si le club l'utilise.
- **Bibliothèque** : 3 nouvelles fiches (ruck éducatif progressif, jeu au
  contact à 5 contre 5, lancements de jeu).

### Reporté (issues ouvertes)

Voir les issues avec le label `type:retour-coach` du jalon Lot 2 et des lots
suivants.

### Biais

Ces quatre playtests ont été joués par **un seul orchestrateur**, qui
connaît bien le plugin et a parfois amélioré les skills en les appliquant
(rapport du scénario 1). Ils mesurent ce que le plugin **peut** faire, pas
encore ce qu'un vrai bénévole en fera. Ils ne remplacent pas les coachs
pilotes du lot 6.

## Synthèse des playtests du lot 3 (2026-10-14 et 2026-10-16)

| Scénario | Résultat du coach simulé | Points forts | Défauts majeurs relevés |
|---|---|---|---|
| 5. Éducatrice M10, plateau avec les prénoms (technophobe) | Satisfaite, avec sa capture d'écran du tableau en prénoms | Prénoms gardés à part, fiche sans prénom ; cheville sans avis médical | Promesse fausse « jamais deux fois de suite sur le banc » ; cible « la moitié du temps » écrite alors qu'intenable ; « s'il a encore mal… » (critère de reprise) ; feuille remise « dans votre dossier » ; effectif créé sans accord ; toujours les mêmes enfants qui jouent la période en plus |
| 6. Entraîneur seniors, compo puis débrief (impatient) | Satisfait (« utilisable », débrief juste) | Compo invalide repérée par `valider` ; J07 écarté sans avis médical ; « nul » non noté pour J10 | Joueur hors de ses postes en première ligne non signalé ; thèmes du débrief placés sur un jour de récupération ; la semaine ignore le débrief ; pas de champ score ; relance « affûtage » le jour du match |

### Corrigé dans ce lot

- **Rotation** : la commande `rotation` annonce l'attente la plus longue et
  dit quand deux attentes de suite sont inévitables ; la cible écrite dit
  « non atteinte ici » quand elle ne peut pas être tenue ; le départage des
  égalités tourne d'un match à l'autre ; le skill `match` ne promet plus
  rien qu'il ne contrôle pas.
- **Sécurité** : `valider` signale un joueur placé en première ligne hors
  de ses postes ; phrase type sans critère de reprise pour « il pourra
  jouer ? » (règles d'usage, skills `effectif` et `match`).
- **Confidentialité et ton** : un seul accord avant de noter l'effectif ;
  nom de famille jamais répété ; fiche remise sans emplacement ; colonne
  « Prénom » vide dans la grille de la fiche A4 ; réponse courte imposée à
  l'école de rugby ; sigles expliqués.
- **Match** : champ `score` ; thèmes du débrief sans jour, repris par le
  skill `semaine` dans les séances de travail ; pas de jugement sur un
  joueur ; remplaçant proposé, pas imposé ; plus de relance « affûtage » le
  jour du match.
- **Outil de playtest** : les réponses du plugin sont consignées mot à mot.

### Reporté

- Statistiques en couples (touches gagnées sur lancées) pour les
  pourcentages.
- Une éval sur « il pourra jouer ? » après une blessure (hors tête).
- Le brouillon de la commande `semaine` ne lit pas encore le débrief : seul
  le skill le reprend.

## Synthèse des playtests du lot 4 (dates simulées 2026-10-10 et 2026-12-09)

| Scénario | Résultat du coach simulé | Points forts | Défauts majeurs relevés |
|---|---|---|---|
| 7. Entraîneur seniors : charge, salle, tests (sceptique) | Satisfait, « moins méfiant qu'au début » | Calcul vérifiable, seuils avoués comme hypothèses, refus du genou, du classement et des kilos sans moraliser | « Pas un risque de blessure » (vocabulaire interdit même nié) ; progrès listés côte à côte, lus comme un classement ; repères (J-2, 30 min, moments des tests) donnés comme des règles ; J-2 mal converti en jour ; relance de semaine le samedi sur la semaine qui finit |
| 8. Éducateur M14 : gel, trêve, reprise (sceptique) | Satisfait | Séance au toucher valide, fiche trêve, salle cadrée selon l'âge | « C'est vous qui décidez » sur le terrain gelé ; « il peut venir ce soir » après une commotion (le plugin choisissait l'étape) ; signes à surveiller absents ; gel non tracé dans la séance |

### Corrigé dans ce lot

- **Sécurité** : terrain gelé et orage deviennent des **consignes de
  sécurité** (champ `conditions` de la séance, contrôlé par `valider`) ;
  pour une reprise après commotion, le plugin demande ce que le médecin a
  autorisé, prévient les parents d'un mineur et dit quoi surveiller ; il ne
  choisit plus l'étape.
- **Charge** : plus aucun vocabulaire de risque ou de blessure, même à la
  forme négative ; seuils annoncés comme hypothèses dès le premier bilan ;
  ligne de calcul ; raison du refus santé et trace neutre (« sans contact
  cette semaine ») ; semaine suivante toujours proposée ; une charge datée
  dans le futur est refusée.
- **Tests** : progression présentée un joueur à la fois, dans l'ordre des
  codes, jamais triée.
- **Repères** : J-n converti en jour (« dernier jour lourd : jeudi » pour un
  match le dimanche) ; seuils d'âge de la salle cités comme repères
  (Lloyd 2014) ; séance plus courte par grand froid.
- **Relance** `preparer-semaine` : du vendredi au dimanche, toujours la
  semaine suivante.

### Reporté

- Programmes de salle individualisés (le plugin reste générique, sans
  charge chiffrée par joueur).
- Contrôle de l'effectif des blocs de jeu (« 11 contre 11 » annoncé pour 22
  enfants sur deux terrains).
- Mise en avant de la relance la plus utile quand `statut` en affiche
  beaucoup.
