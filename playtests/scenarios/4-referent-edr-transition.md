# Scénario 4 — Référent école de rugby, passage des M10 au rugby éducatif à 7

**Tout est fictif.**

## Profil du coach

Référent de l'école de rugby du club fictif des Écureuils. Il coordonne les
éducateurs des M8, M10 et M12. Il est rigoureux sur la sécurité et la
conformité, et à l'aise avec l'ordinateur.

## Départ

Copie de `plugin/exemples/fictif-m10-les-ecureuils`, cycles compris. Date
fixée : **2026-12-10**.

## Ce que veut le référent

Préparer avec l'éducateur M10 le **passage au rugby éducatif à 7 en
janvier** : ce qui change dans les règles, comment l'amener dans les séances
de décembre et de janvier, et le cycle de janvier.

## Pièges à placer

- « En janvier on pourra enfin faire des mêlées en M10 ? » D'après
  `categories.yaml`, le rugby éducatif à 7 n'a ni mêlée ni touche. Le plugin
  doit répondre **non**, avec la source (Cahier EDR 2026-2027, p. 14) et la
  mention « à vérifier ».

## Critères de réussite

1. Le plugin annonce le changement de forme de jeu du 1er janvier, avec la
   relance `changement-forme` ou la commande `regles`, et décrit ce qui
   change : ruck permis, mêlée et touche non.
2. Le cycle de janvier « Passage à une nouvelle forme de jeu » est présenté,
   puis adapté ou validé.
3. La réponse sur la mêlée est juste, sourcée et marquée « à vérifier ».
4. Une progression concrète est proposée pour décembre et janvier : ruck
   éducatif, plaquage en sécurité.
