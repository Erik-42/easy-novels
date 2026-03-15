<div align="center">
</div>
<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h1>Easy-Novel</h1>
  <h4>Version 1.0.0</h4>
  <a href="https://github.com/Erik-42">
    <img src="./assets/img/intro.jpg" alt="Logo Easy-Novel" width="150" height="150">
  </a>
</div>

<!-- ABOUT THE PROJECT -->

## About The Project

<div align="center">

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Issues][issues-shield]][issues-url]
<br/>
Repo: [![wakatime](https://wakatime.com/badge/github/Erik-42/easy-novels.svg)](https://wakatime.com/badge/github/Erik-42/easy-novels)
Project: [![wakatime](https://wakatime.com/badge/user/f84d00d8-fee3-4ca3-803d-3daa3c7053a5/project/a67896cc-3846-42b3-8c9f-7e6abd84e21a.svg)](https://wakatime.com/badge/user/f84d00d8-fee3-4ca3-803d-3daa3c7053a5/project/a67896cc-3846-42b3-8c9f-7e6abd84e21a)

</div>

Application web pour écrire et structurer des romans. Gestion de la bibliothèque, de l’esquisse (personnages, lieux, intrigues), des scènes, de la structure (actes/chapitres) et des objectifs d’écriture. Données stockées localement dans le navigateur ; export possible au format Markdown.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Installation

1. Cloner le repository :
```bash
git clone https://github.com/Erik-42/web-novelist-app.git
cd web-novelist-app
```

2. Lancer un serveur HTTP (les modules ES ne fonctionnent pas en `file://`) :
```bash
python -m http.server 9000
```

3. Ouvrir dans le navigateur : **http://localhost:9000/** ou **http://localhost:9000/index-web.html**

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Guide d'utilisation détaillé

### Fonctionnalités

- **Bibliothèque** — Créer, ouvrir, renommer et supprimer des livres.
- **Esquisser** — Catégories personnalisables (ex. Personnages, Lieux, Intrigues) et fiches avec titre et synopsis.
- **Écrire** — Scènes avec titre, synopsis, texte et statut (todo, draft, revised, done) ; compteur de mots en direct.
- **Organiser** — Sections (actes, chapitres) et rattachement des scènes pour composer le manuscrit.
- **Programmer** — Objectif de mots, échéance, calcul du quota quotidien et suivi de la progression.
- **Export Markdown** — Bouton « Exporter (Markdown) » dans la barre du livre : téléchargement du livre complet (esquisse + manuscrit structuré) en `.md`.
- **Modales** — Toutes les interactions (saisie, confirmation) passent par des modales intégrées.

### Stack technique

- **Front** : HTML5, JavaScript (ES modules), CSS (BEM, un fichier par composant).
- **Données** : `localStorage` (clé `web-novelist-db`), pas de backend.
- **Build** : Aucun (fichiers statiques uniquement).

### Structure du projet (partie Easy-Novel)

```
web-novelist-app/
├── index-web.html          # Point d’entrée de l’app Easy-Novel
├── README.md
└── src/
    ├── app.js              # Routeur hash, rendu principal, topbar
    ├── app.css             # Layout global, sidebar, topbar
    ├── services/
    │   ├── db.js           # Base de données (projets, outline, writing, organize, schedule)
    │   ├── storage.js     # Compatibilité ancienne API
    │   └── exportMarkdown.js
    └── components/
        ├── Library/        # Bibliothèque de livres (CRUD)
        ├── Outline/        # Esquisse (catégories + fiches)
        ├── Writing/        # Scènes et éditeur
        ├── Organize/       # Structure (sections + rattachement scènes)
        ├── Schedule/       # Objectifs et progression
        └── Modal/          # Modales (prompt, confirm, alert)
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Utilisation

Dans un terminal :

```bash
python -m http.server 9000
```

Puis ouvrir **http://localhost:9000/index-web.html** dans le navigateur.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Testez le projet

### Version

Release v1.0.0

<br/>

### Github

[https://github.com/Erik-42/web-novelist-app](https://github.com/Erik-42/web-novelist-app)

<a href="#">Easy-Novel</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Développement

Projet statique (HTML / JS / CSS), sans build ni suite de tests. Les composants sont organisés par dossier avec un fichier JS et un fichier CSS (BEM).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the GNU GENERAL PUBLIC LICENSE
Version 3.<br>
See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

<div align="center">

[![GitHub followers][github followers-shield]][github followers-url]
[![Stargazers][stars-shield]][stars-url]
[![GitHub repo][github repo-shield]][github repo-url]
[![wakatime](https://wakatime.com/badge/user/f84d00d8-fee3-4ca3-803d-3daa3c7053a5.svg)](https://wakatime.com/@f84d00d8-fee3-4ca3-803d-3daa3c7053a5)

[![Github Badge][github badge-shield]][github badge-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

[https://buymeacoffee.com/meseneriko](https://buymeacoffee.com/meseneriko)

<a href="https://buymeacoffee.com/meseneriko">
    <img src="./assets/img/bmc_qr.png" alt="Buy My Coffee" width="20%" style="background-color:grey">
</a>  
<p></p>
<p></p>
<a href = 'https://basillecorp.dev'> <img width = '32px' align= 'center' src="https://raw.githubusercontent.com/rahulbanerjee26/githubAboutMeGenerator/main/icons/portfolio.png"/> basillecorp.dev</a>

mesen.erik@gmail.com

</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[wakatime-shield]: https://wakatime.com/badge/user/f84d00d8-fee3-4ca3-803d-3daa3c7053a5.svg
[wakatime-url]: https://wakatime.com/@f84d00d8-fee3-4ca3-803d-3daa3c7053a5
[github badge-shield]: https://img.shields.io/badge/Github-Erik--42-155?style=for-the-badge&logo=github
[github badge-url]: https://github.com/Erik-42
[github repo-shield]: https://img.shields.io/badge/Repositories--blue
[github repo-url]: https://github.com/Erik-124/Erik-42?tab=repositories
[github followers-shield]: https://img.shields.io/github/followers/Erik-42
[github followers-url]: https://github.com/followers/Erik-42
[contributors-shield]: https://img.shields.io/github/contributors/Erik-42/web-novelist-app
[contributors-url]: https://github.com/Erik-42/web-novelist-app/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Erik-42/web-novelist-app
[forks-url]: https://github.com/Erik-42/web-novelist-app/forks
[issues-shield]: https://img.shields.io/github/issues-raw/Erik-42/web-novelist-app
[issues-url]: https://github.com/Erik-42/web-novelist-app/issues
[stars-shield]: https://img.shields.io/github/stars/Erik-42
[stars-url]: https://github.com/Erik-42?tab=stars
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/erik-mesen/
[html-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[html-url]: https://html.spec.whatwg.org/
[css-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[css-url]: https://www.w3.org/TR/CSS/#css
[javascript-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
