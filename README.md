# backend-sQuizzGame

## Comment installer le back-end ?
- Si vous ne l'avez pas fait, vous pouvez cloner le repo pour initier votre application : `git clone https://github.com/Naya-01/frontend-sQuizzGame.git`
- Installation des dépendances et démarrage du boilerplate :
```shell
cd frontend-sQuizzGame # (ou le nom donné au répertoire de votre projet)
npm i # (equivalent de npm install)
npm start
```

## Base de données

Le back-end requiert l'utilisation d'une base de donnée.
Pour configurer votre base de données nous vous fournissons un script dans le repository.

## Utilisation de dotEnv
- Attention pour utiliser notre Application vous devez spécifier un accès pour la base de donnée qui comprendra les même tables
- Pour se faire, vous devez créer un fichier .env à la racine du repository et y mettre les données suivantes
```shell
DB_HOST= <dbHostname>
DB_USER= <dbUser>
DB_PASS= <dbPassword>
DB_NAME= <dbName>
DB_PORT= 5432
jwtSecret= <jwtSecret>
```

## Comment utiliser le back-end ?

- Il faut d'abord démarrer le back-end
- Puis il faut démarer le front-end que vous trouvez à cette adresse -> https://github.com/Naya-01/frontend-sQuizzGame

### Vous utiliserez l'adresse localhost:3000 pour explorer les routes du back-end.