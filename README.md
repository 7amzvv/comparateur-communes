# Comparateur de communes

Une page web pour rechercher deux communes françaises et comparer leur population.

## Lancement

1. Téléchargez ou clonez le dépôt.
2. Ouvrez `index.html` dans un navigateur avec une connexion Internet.
3. Choisissez **Commune A**, recherchez un nom ou un code postal et cliquez sur un résultat.
4. Choisissez **Commune B** et recommencez. Les deux fiches affichent la population, le département, la région et les codes postaux.

Vous pouvez remplacer chaque commune avec le sélecteur d’emplacement. La comparaison se met à jour automatiquement. Les fiches restent visibles pendant les recherches.

## Recherche et comparaison

Une saisie de cinq chiffres est recherchée comme un code postal. Les autres saisies sont recherchées comme un nom. La liste affiche jusqu’à cinq résultats avec leur département pour distinguer les homonymes.

L’écart est la différence absolue entre les populations retournées. Si une population manque, la comparaison affiche un message. La page utilise les chiffres fournis par l’API, sans sélection de millésime.

## Vérifications

- Rechercher **Caen** ou **14000**, puis **Évreux** et comparer les populations.
- Rechercher **Saint-Denis** et distinguer les départements.
- Remplacer une commune et vérifier que l’autre reste affichée.
- Tester une saisie vide, une recherche sans résultat et une coupure réseau.

## Technique et données

Le projet utilise HTML, CSS et JavaScript, avec `fetch` pour les appels HTTP. Aucun paquet ni clé API à installer.

Les données proviennent de l’API Découpage administratif. [Documentation officielle](https://geo.api.gouv.fr/decoupage-administratif/communes)
