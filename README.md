# Démo RDAP dans le navigateur

Une page statique de démonstration de [`@portable/rdap`](https://github.com/portablejs/portable/tree/main/packages/rdap) pour consulter les données RDAP d’une adresse IPv4 ou IPv6.

La requête est déclenchée uniquement lorsque l’utilisateur clique sur **Rechercher**. La page affiche les informations d’enregistrement publiées par le registre RDAP (plage, CIDR, pays d’enregistrement, type de réseau et organisations disponibles). Elle ne fait pas de géolocalisation.

## Lancer en local

Pré-requis : Node.js 24 ou supérieur et npm.

```sh
npm install
npm run dev
```

Vite indique ensuite l’URL locale à ouvrir.

Pour vérifier la version de production :

```sh
npm run build
npm run preview
```

## Publier sur GitHub Pages

Le workflow `.github/workflows/pages.yml` construit puis publie automatiquement le dossier `dist` à chaque push sur `main`.

1. Créez un dépôt GitHub et poussez-y le contenu de ce dossier sur la branche `main`.
2. Dans **Settings → Pages**, choisissez **GitHub Actions** comme source de publication.
3. Le workflow publiera le site ; son URL apparaîtra dans l’exécution GitHub Actions et dans les paramètres Pages.

Vite utilise des chemins relatifs pour que le site fonctionne aussi dans un dépôt de projet, par exemple `https://<utilisateur>.github.io/<nom-du-depot>/`.

## Confidentialité et limites

- Aucun appel RDAP n’est effectué au chargement de la page.
- Au clic, le navigateur télécharge si nécessaire les fichiers bootstrap RDAP d’IANA, puis interroge le serveur RDAP déterminé pour l’adresse saisie. L’adresse IP est donc communiquée au serveur de registre concerné.
- Les serveurs RDAP peuvent refuser les requêtes cross-origin (CORS). Dans ce cas, le navigateur ne peut pas lire leur réponse ; il faut alors envisager un proxy côté serveur.
- Les données sont fournies par les registres et peuvent être absentes ou inexactes. Le pays affiché est une information d’enregistrement, pas une position géographique garantie.
- Cette démo n’envoie pas l’IP à un fournisseur de GeoIP.

## Licence

Le code de cette démo est placé sous licence MIT (voir [`LICENSE`](LICENSE)). `@portable/rdap` et ses dépendances conservent leurs licences respectives.
