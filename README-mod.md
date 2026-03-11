<div align="center">
</div>
<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h1>Structure-Project-Generator</h1>
  <h4>Version 1.0.0</h4>
  <a href="https://github.com/Erik-42">
    <img src="./assets/logo/logo-spg.jpeg" alt="Logo Files-Project-Generation" width="150" height="150">
  </a>
</div>


<!-- ABOUT THE PROJECT -->

## About The Project

<div align="center">


[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Issues][issues-shield]][issues-url]
<br/>
Repo: [![wakatime](https://wakatime.com/badge/github/Erik-42/structure-project-generator.svg)](https://wakatime.com/badge/github/Erik-42/structure-project-generator)
Project: [![wakatime](https://wakatime.com/badge/user/f84d00d8-fee3-4ca3-803d-3daa3c7053a5/project/4560400d-1de2-4e4e-9af4-393e96928dc8.svg)](https://wakatime.com/badge/user/f84d00d8-fee3-4ca3-803d-3daa3c7053a5/project/4560400d-1de2-4e4e-9af4-393e96928dc8)

</div>

cette appli a pour but de créer la structure d'un projet automatiquement a partir d'un fichier json ou de question poser à l'utilisateur


<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Installation

1. Cloner le repository :
```bash
git clone https://github.com/Erik-42/structure-project-generator.git
cd structure-project-generator
```

2. Créer un environnement virtuel et installer les dépendances :
```bash
python -m venv .venv
source .venv/bin/activate  # Sur Linux/Mac
# ou
.venv\Scripts\activate  # Sur Windows
pip install -e .
```

## Guide d'utilisation détaillé

### Interface graphique (GUI)

1. Lancer l'application :
```bash
python src/gui/main_gui.py
```

2. Utiliser l'interface graphique :
   - Cliquez sur "Nouveau Projet" pour créer une structure depuis zéro
   - Cliquez sur "Charger JSON" pour utiliser un template existant
   - Remplissez les informations demandées dans les formulaires

### Format du fichier JSON

Le fichier JSON doit suivre cette structure :
```json
{
  "project_name": "mon-projet",
  "structure": {
    "src": {
      "main.py": "",
      "utils": {
        "helpers.py": ""
      }
    },
    "tests": {
      "test_main.py": ""
    },
    "docs": {},
    "README.md": "# Mon Projet\nDescription du projet"
  }
}
```

### Exemples de structures générées

1. **Structure Web Basic**
```
mon-projet/
├── src/
│   ├── static/
│   ├── templates/
│   └── app.py
├── tests/
└── README.md
```

2. **Structure Python Package**
```
mon-package/
├── src/
│   └── mon_package/
│       ├── __init__.py
│       └── main.py
├── tests/
├── docs/
├── pyproject.toml
└── README.md
```

## Utilisation

dans un terminal: `python src/gui/main_gui.py`


## Testez le projet
### version
  Release v1.0.0
<br/>

### Github
[https://github.com/Erik-42/structure-project-generator](https://github.com/Erik-42/structure-project-generator)


<a href=#>Structure-Project-Generator</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Développement

### Tests

Exécuter les tests :
```bash
pytest
```

Exécuter les tests avec couverture :
```bash
pytest --cov=src --cov-report=term-missing
```

### Style de code

Formatter le code :
```bash
black src tests
```

Vérifier le style :
```bash
flake8 src tests
```

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
    <img src="./assets/img/bmc_qr.png" alt="Buy My Coffee
    " width="20%" style="background-color:grey">
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
[github repo-shield]: https://img.shields.io/badge/Repositories-68-blue
[github repo-url]: https://github.com/Erik-42/Erik-42?tab=repositories
[github followers-shield]: https://img.shields.io/github/followers/Erik-42
[github followers-url]: https://github.com/followers/Erik-42
[contributors-shield]: https://img.shields.io/github/contributors/Erik-42/export-project-structure
[contributors-url]: https://github.com/Erik-42/export-project-structure/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Erik-42/export-project-structure
[forks-url]: https://github.com/Erik-42/export-project-structure/forks
[issues-shield]: https://img.shields.io/github/issues-raw/Erik-42/export-project-structure
[issues-url]: https://github.com/Erik-42/export-project-structure/issues
[stars-shield]: https://img.shields.io/github/stars/Erik-42
[stars-url]: https://github.com/Erik-42?tab=stars
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/erik-mesen/
[html-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[html-url]: https://html.spec.whatwg.org/
[css-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[css-url]: https://www.w3.org/TR/CSS/#css
[javascript-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555