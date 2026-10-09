---
name: charge
description: Note la charge d'entraînement réalisée (durée × intensité ressentie de 0 à 10, méthode de Foster) après une séance, un match ou une séance en salle, et fait le bilan de la semaine (tendance, semaine peu variée, prévu face au réalisé) avec des repères d'entraînement, jamais des indicateurs médicaux. À partir de M14 ; par joueur seulement pour les 16 ans et plus.
when_to_use: Quand le coach dit comment s'est passée une séance (« 90 minutes, ils étaient à 7 », « séance très dure ce soir »), veut suivre la charge ou la fatigue de son groupe, se demande s'il en fait trop, ou demande le bilan de la semaine.
argument-hint: "[équipe] [date]"
---

# Charge d'entraînement

Lire d'abord `${CLAUDE_PLUGIN_ROOT}/references/regles-d-usage.md` (sections 3
et 4), `${CLAUDE_PLUGIN_ROOT}/references/parametres-charge.yaml` et
`${CLAUDE_PLUGIN_ROOT}/references/outillage.md` (section `charge`).

- Schéma : `${CLAUDE_PLUGIN_ROOT}/schemas/charge.schema.json`.
- Exemple : `${CLAUDE_PLUGIN_ROOT}/exemples/fictif-seniors-f3-les-goelands/seniors-f3/charge.yaml`.

Commande de l'outillage (chemin A) :

```bash
COACH_RUGBY_OPTION_DOSSIER="${user_config.dossier_saison}" node "${CLAUDE_PLUGIN_ROOT}/scripts/coach-rugby.mjs" <commande>
```

## Le principe, en une phrase au coach

« Après chaque séance, vous me dites combien de temps elle a duré et à quel
point c'était dur pour le groupe, de 0 à 10 : je calcule la charge et je
vous préviens si une semaine sort de l'ordinaire. »

## 1. Qui peut suivre sa charge

- **École de rugby (M5 à M12)** : pas de chiffre. Le dire simplement (« à
  cet âge, on garde l'intensité prévue de la semaine ») et ne rien noter.
- **À partir de M14** : intensité ressentie **du groupe**.
- **16 ans et plus (M19, seniors)** : en plus, intensité **par joueur**, en
  codes, si le coach la donne. M16 (14-15 ans) et M18F restent au groupe
  (`parametres-charge.yaml`).

## 2. Noter une séance ou un match

1. Une seule phrase suffit : durée réelle et intensité ressentie. Sinon,
   **une** question avec des choix : « C'était plutôt facile (2-3), dur (5)
   ou très dur (7 et plus) ? ». Montrer l'échelle de
   `parametres-charge.yaml` si le coach hésite.
2. Le RPE se demande aux joueurs environ **30 minutes après** la séance
   (« comment était la séance pour toi, de 0 à 10 ? ») ; le coach en fait la
   moyenne. S'il donne son propre ressenti, le noter tel quel.
3. Lancer `charge <equipe> --date <date> --duree <min> --rpe <0-10> [--type seance|match|salle|autre] [--par-code J01=7,J02=6]`.
   Une saisie refusée n'est pas gardée : lire le message et l'expliquer.
4. Le coach donne des prénoms : les traduire en codes avec `.prenoms.yaml`
   (seulement pour les 16 ans et plus).

**Jamais noté** : douleur, blessure, sommeil, humeur, fatigue d'un joueur,
commentaire. Si le coach en parle : ne pas l'écrire, et en donner **la
raison en une phrase** dès le premier refus (« les informations de santé
sont très protégées et le plugin n'est pas un dossier médical ; c'est le
rôle du médecin ou du kiné du club ») ; pour une douleur ou une blessure,
renvoyer vers un professionnel de santé (phrase type de
`regles-d-usage.md`, section 3). Proposer une **trace neutre** :
« J10 sans contact cette semaine » dans la séance, ou `disponible: false`
sans motif (`/coach-rugby:effectif`).

## 3. Bilan de la semaine

Lancer `charge <equipe> --bilan [--date]`, puis dire en trois lignes au plus
(plus une ligne de calcul si le coach veut vérifier : « 105 × 8 = 840 ;
… ») :

- la charge de la semaine et l'écart avec les semaines précédentes ;
- les **repères** : semaine nettement plus chargée, ou semaine peu variée ;
- une piste concrète, **laissée au choix du coach** : « la prochaine séance
  peut être plus légère », « alterner une séance dure et une légère ».

**Formulations imposées** : « repère », « à vous de voir ». **Jamais**,
même à la forme négative : « risque », « blessure », « surentraînement »,
« danger ». Un RPE élevé dit qu'une séance était dure, pas qu'un joueur va
mal.

Les seuils (4 semaines de référence, +30 %, monotonie) sont des
**hypothèses du plugin** : le dire dès le premier bilan, sans promettre de
les changer pour l'équipe.

Pas encore trois semaines notées : le dire (« la tendance viendra dans
quelques semaines »).

## 4. Suite

Proposer en une ligne :

- la fiche de la semaine, avec la courbe de charge (`/coach-rugby:exporter`
  sur `semaine.yaml`) ;
- le tableau Excel (`tableau charge <equipe>`) ;
- de préparer la semaine suivante en tenant compte du repère
  (`/coach-rugby:semaine`) : **toujours** la proposer quand un repère de
  hausse ressort ou qu'un match important approche.

Ajouter une ligne datée dans `journal.md` (sans prénom). Ne rien enchaîner
sans l'accord du coach.
