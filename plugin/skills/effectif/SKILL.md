---
name: effectif
description: Tient l'effectif d'une équipe de rugby en codes (J01, J02…) avec les prénoms gardés seulement sur l'ordinateur du coach, note les disponibilités (sans motif), les présences (y compris un sondage Mon Coach Assistant collé) et les progrès par compétences, et produit la feuille de présence et les tableaux Excel ou CSV.
when_to_use: Quand le coach parle de ses joueurs un par un (« voici ma liste », « J'ai 18 gamins, je te donne les prénoms »), dit qui était là ou qui sera absent, colle un sondage de présence, veut suivre l'assiduité ou les progrès, ou demande une feuille de présence ou un tableau Excel.
argument-hint: "[équipe]"
---

# Effectif, présences et progrès

Lire d'abord `${CLAUDE_PLUGIN_ROOT}/references/regles-d-usage.md`
(section 4, confidentialité) et `${CLAUDE_PLUGIN_ROOT}/references/outillage.md`
(sections `effectif`, `presences`, `tableau`).

- Schémas : `${CLAUDE_PLUGIN_ROOT}/schemas/effectif.schema.json`,
  `presences.schema.json`, `progres.schema.json`.
- Exemples : `${CLAUDE_PLUGIN_ROOT}/exemples/fictif-m10-les-ecureuils/m10/`
  (`effectif.yaml`, `presences.yaml`, `progres.yaml`).
- Grille de compétences : `${CLAUDE_PLUGIN_ROOT}/references/competences.yaml`.

Commande de l'outillage (chemin A) :

```bash
COACH_RUGBY_OPTION_DOSSIER="${user_config.dossier_saison}" node "${CLAUDE_PLUGIN_ROOT}/scripts/coach-rugby.mjs" <commande>
```

## Le principe, à dire au coach en une phrase

« Je garde les prénoms seulement sur votre ordinateur, dans une liste à part ;
vos fiches et tableaux utilisent des codes (J01, J02…), vous n'avez rien à
faire. »

Ne pas parler de RGPD, de fichier ni de table. Ne jamais demander de nom de
famille, de date de naissance, de licence, de téléphone ni d'information de
santé.

## 1. Créer ou compléter l'effectif

1. Lancer `effectif <equipe> --prenoms` : il affiche les codes et, pour le
   coach seulement, les prénoms connus.
2. Le coach donne un **nombre** : `effectif <equipe> --ajouter N`.
3. Le coach donne des **prénoms** :
   - créer un code par joueur (`--ajouter N`) ;
   - écrire les prénoms **seulement** dans `<equipe>/.prenoms.yaml`, une
     ligne `J01: Prénom` par joueur ; deux prénoms identiques reçoivent un
     chiffre ;
   - s'il donne aussi des noms de famille : ne garder que le prénom, et
     ajouter le nom complet à `<dossier saison>/.joueurs-proteges.txt` ;
   - relancer `effectif <equipe>` : les prénoms deviennent des noms
     protégés.
4. Seniors et jeunes à XV : noter les `postes` si le coach les donne.
5. Groupe qui mêle plusieurs catégories : noter la `categorie` de chacun.
6. Lancer `valider <equipe>/effectif.yaml`.

**Jamais** de prénom dans `effectif.yaml`, `presences.yaml`, `progres.yaml`
ou `match.yaml`, ni dans `journal.md`.

## 2. Disponibilités

- Un joueur indisponible : `disponible: false`, **sans motif**.
- Si le coach donne une raison de santé (blessure, maladie, choc) : ne pas
  l'écrire, ne donner aucun avis médical, rappeler en une phrase que la
  reprise se décide avec un professionnel de santé
  (`${CLAUDE_PLUGIN_ROOT}/references/protocole-commotion.md` pour un choc à
  la tête).
- Retour du joueur : `disponible: true`.

## 3. Présences

1. Le coach dit qui était là, en prénoms ou en codes. Traduire les prénoms
   en codes avec `.prenoms.yaml`.
2. Lancer `presences <equipe> --date <date> --presents J01,J03… [--excuses …] [--type seance|match|plateau|tournoi]`.
3. **Sondage Mon Coach Assistant collé** (clubs qui l'utilisent) :
   - traduire chaque prénom en code avec la table ;
   - un prénom inconnu : demander s'il faut lui créer un code ;
   - ajouter `--source sondage-mca` ;
   - ne garder que les codes, ne recopier aucun nom ailleurs ;
   - un nom complet du sondage va dans `.joueurs-proteges.txt`, en le disant
     simplement au coach.
4. `presences <equipe> --bilan` donne les taux et les **absences répétées**
   (trois dernières dates). Présenter les absents au coach avec leur prénom,
   et suggérer de prendre des nouvelles, **sans demander de motif**.

## 4. Progrès par compétences

1. Choisir dans `competences.yaml` les compétences de la catégorie
   (`a_partir_de`) dont les phases (`exige`) sont permises par la forme de
   jeu du jour (`regles`).
2. **Au plus trois compétences par séance**, observées sur le terrain.
3. Trois niveaux seulement : `a-travailler`, `en-cours`, `acquis`, avec la
   date. Aucune note, aucun commentaire sur la personne.
4. Ajouter les observations dans `<equipe>/progres.yaml`, puis lancer
   `valider`.
5. Dire au coach que la grille est une **aide à l'observation** (hypothèse
   pédagogique), pas un référentiel officiel.

Les compétences « à travailler » du groupe nourrissent les objectifs des
prochaines séances (`/coach-rugby:seance`).

## 5. Feuille de présence et tableaux

- **Feuille à imprimer** : `exporter <equipe>/effectif.yaml --pdf`. Codes et
  colonne « Prénom » vide, que le coach remplit à la main.
- **Tableaux** : `tableau presences|progres <equipe>` produit un CSV et un
  fichier Excel dans `<equipe>/exports/`. Sans outillage (code 3), suivre le
  chemin B de `outillage.md`.
- Toujours en codes. Si le coach veut les prénoms dans le tableau : il les
  ajoute lui-même dans la colonne prévue, sur son ordinateur.

## 6. Faire le point

Résumer en deux lignes (nombre de joueurs, présences notées, compétences
observées), ajouter une ligne datée dans `journal.md` (sans prénom), puis
proposer une suite en une ligne : préparer la séance (`/coach-rugby:seance`)
ou le prochain match (`/coach-rugby:match`).
