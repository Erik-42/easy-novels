<div align="center">

# 📚 Novelist

### Application d'écriture de bureau sans distraction pour les auteurs

_Votre compagnon créatif pour écrire des romans longs avec clarté et précision._

[![GitHub stars](https://img.shields.io/github/stars/cogrow4/Novelist?style=for-the-badge&logo=github&color=6366f1)](https://github.com/cogrow4/Novelist/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/cogrow4/Novelist?style=for-the-badge&logo=github&color=6366f1)](https://github.com/cogrow4/Novelist/network)
[![GitHub issues](https://img.shields.io/github/issues/cogrow4/Novelist?style=for-the-badge&logo=github&color=6366f1)](https://github.com/cogrow4/Novelist/issues)
[![License](https://img.shields.io/badge/License-Unlicense-6366f1?style=for-the-badge)](./LICENSE)

[![Built with Electron](https://img.shields.io/badge/Built_with-Electron-47848f?style=for-the-badge&logo=electron)](https://www.electronjs.org/)
[![Powered by Quill](https://img.shields.io/badge/Powered_by-Quill-1d4ed8?style=for-the-badge)](https://quilljs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)

[🐛 Signaler un bug](https://github.com/cogrow4/Novelist/issues) • [✨ Demander une fonctionnalité](https://github.com/cogrow4/Novelist/issues)

---

</div>

## 📋 Table des matières

- [✨ Fonctionnalités](#-features)
- [🎯 Ce qui rend ce produit spécial](#-what-makes-this-special)
- [🚀 Démarrage rapide](#-quick-start)
- [📁 Stockage de projets](#-project-storage)
- [⚙️ Configuration](#️-configuration)
- [💻 Développement](#-development)
- [🔧 Dépannage](#-troubleshooting)
- [🗺️ Feuille de route](#️-roadmap)
- [🤝 Contribuer](#-contributing)
- [📄 License](#-license)
- [💖 Credits](#-credits)

---

## ✨ Fonctionnalités

<div align="center">

| Fonctionnalité                                 | Description                                                                                         |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| ✍️ **Interface utilisateur d'écriture épurée** | Éditeur de texte enrichi basé sur Quill avec repli automatique                                      |
| 📖 **Chapitres et scènes**                     | Organisez votre récit grâce à une structure imbriquée et une navigation rapide.                     |
| 👥 **Fiches de personnage**                    | Suivez vos personnages grâce à des profils de personnages dédiés.                                   |
| 📝 **Notes de planification**                  | Notes classées par catégories pour la création d'univers, plans et recherches                       |
| 💾 **Sauvegarde automatique**                  | Ne perdez plus jamais votre travail grâce à la sauvegarde automatique et à la suppression manuelle. |
| 📊 **Nombre de mots**                          | Suivi en temps réel du nombre de mots dans le document actuel et du nombre total de mots du projet  |
| 📤 **Export**                                  | Compilez l'intégralité de votre projet dans un seul fichier Markdown                                |
| 🔄 **Git Integration**                         | Système de contrôle de version intégré avec les commandes init, commit, push et pull.               |
| 📂 **Gestion de projet**                       | Liste des projets récents et écran d'accueil à accès rapide                                         |
| ⚡ **Raccourcis clavier**                      | Afficher/masquer la barre latérale (Cmd/Ctrl+B), valider (Cmd/Ctrl+Shift+C)                         |
| 🔒 **Priorité à la confidentialité**           | Toutes les données restent en local – aucune télémétrie, aucune synchronisation avec le cloud       |
| 📝 **Stockage Markdown**                       | Format portable et compatible avec les différences pour le contrôle de version                      |

</div>

---

## 🎯 Ce qui rend ce produit spécial

### 🏗️ Construit avec des technologies modernes

```
Frontend:         Electron + Quill Rich Text Editor
Storage:          Local Markdown Files (~/Documents/Novelist/)
State:            electron-store for preferences
Version Control:  simple-git integration
Architecture:     IPC bridge with secure context isolation
Format:           Markdown-backed content (portable & VCS-friendly)
```

### 🎪 Principales capacités

- **Modèle de projet**: Chaque projet est un dossier contenant des fichiers Markdown pour les chapitres, les scènes, les personnages et les notes.
- **Structure hiérarchique**: les chapitres contiennent des scènes ; les scènes sont stockées sous forme de fichiers imbriqués
- **Aperçu en direct**: Barre d’outils de mise en forme enrichie avec titres, listes, blocs de code et liens
- **Interface utilisateur contextuelle**: le panneau méta s’adapte pour afficher les champs pertinents (catégorie de la note, statut d’enregistrement).
- **Système de tutoriels**: Conseils intégrés et tutoriel superposé accessibles depuis le menu Aide
- **Multiplateforme**: Fonctionne sous macOS, Windows et Linux

### 📚 Parfait pour les écrivains qui veulent

- 🎯 **Concentration**: Une interface sans distraction qui vous permet de rester concentré sur votre créativité.
- 🗂️ **Organisation**: Une structure claire pour les histoires complexes comportant plusieurs intrigues.
- 💾 **Sécurité**: Sauvegarde automatique avec Git pour une tranquillité d'esprit totale
- 🚀 **Simplicité**: Pas de comptes cloud, pas d'abonnements, écrivez simplement
- 🔓 **Liberté**:Vos fichiers restent les vôtres - format Markdown portable

---

## 🚀 Démarrage rapide

### 📦 Télécharger les binaires précompilés (recommandé)

Téléchargez la dernière version pour votre plateforme depuis la [page des versions ](https://github.com/cogrow4/Novelist/releases).

**Plateformes disponibles :**

- **macOS:** DMG universel (Intel + Apple Silicon)
- **Windows:** MSI (x64) or NSIS Setup (ARM64)
- **Linux:** AppImage, DEB, or RPM packages
  - Compatible avec les architectures x64, ARM64 et ARMv7l

Il suffit de télécharger, d'installer et de commencer à écrire !

---

### 🛠️ Construire à partir du code source

Pour les développeurs ou ceux qui souhaitent compiler à partir du code source :

#### Prérequis

- **Node.js 18+** (recommandé)
- **macOS, Windows, or Linux**
- **Git** (optionnel, pour les fonctionnalités de contrôle de version)

#### Installation

```bash
# Clone the repository
git clone https://github.com/cogrow4/Novelist.git

# Navigate to project directory
cd Novelist

# Install dependencies
pnpm i
# or: npm install / yarn
```

### Exécution de l'application

```bash
# Start Novelist
npm start

# Development mode (with DevTools)
NODE_ENV=development npm start
```

### Premier lancement

L'écran d'accueil propose trois options :

1. **Créer un nouveau projet** - Enregistré automatiquement dans `~/Documents/Novelist/`
2. **Ouvrir un projet existant ** - Accédez à n'importe quel dossier de projet
3. **Projets récents** - Accès rapide à vos travaux récents

---

## 📁 Stockage de projets

Chaque projet est hébergé `~/Documents/Novelist/` par défaut dans un répertoire dédié. Tout le contenu est stocké sous forme de fichiers Markdown pour assurer la portabilité et la compatibilité avec le contrôle de version.

### Structure du projet

```
~/Documents/Novelist/
  my-novel-abc123/
    project.json                    # Project metadata
    chapters/
      chapter-1-xxxx.md            # Chapter content
      chapter-1-xxxx-scenes/       # Nested scenes
        scene-intro-yyyy.md
        scene-climax-zzzz.md
      chapter-2-qqqq.md
    characters/
      protagonist-aaaa.md          # Character profiles
      antagonist-bbbb.md
    notes/
      outline-cccc.md              # Planning notes
      worldbuilding-dddd.md
```

### Pourquoi Markdown ?

- ✅ **Portable**: Ouvrez-le dans n'importe quel éditeur de texte
- ✅ **Gestion de versions**: Idéal pour les différences Git
- ✅ **À l'épreuve du temps**: Le texte brut restera toujours lisible
- ✅ **Recherche possible**: Utilisez grep, ripgrep ou tout autre outil de recherche.

---

## ⚙️ Configuration

### Preferences

Novelist enregistre les préférences en utilisant `electron-store`:

- Taille de police pour l'éditeur
- Dernier projet ouvert
- Liste des projets récemment utilisés (MRU)

Accès via : **Edit → Preferences** (ou menu de l’application sur macOS)

### Fonctionnalités de l'éditeur

```javascript
// Rich-text formatting
- Headings (H1-H6)
- Bold, Italic, Underline
- Bulleted and Numbered Lists
- Code Blocks
- Links
- Blockquotes
```

### Raccourcis clavier

| Action                             | macOS         | Windows/Linux  |
| ---------------------------------- | ------------- | -------------- |
| Afficher/masquer la barre latérale | `Cmd+B`       | `Ctrl+B`       |
| Git Commit                         | `Cmd+Shift+C` | `Ctrl+Shift+C` |
| Sauvegarder                        | `Cmd+S`       | `Ctrl+S`       |
| Nouveau chapitre                   | Menu          | Menu           |
| Projet d'exportation               | Menu          | Menu           |

---

## 💻 Développement

### Aperçu de l'architecture

```
novelist/
├── electron/
│   ├── main.js              # Main process (ESM)
│   ├── preload.js           # Context bridge (CommonJS)
│   └── project-manager.js   # File system & Git operations
├── renderer/
│   ├── index.html          # UI layout
│   ├── app.js              # Frontend logic
│   └── styles.css          # Styling
└── package.json
```

### Communication IPC

L'application utilise un pont IPC sécurisé (`preload → main`):

```typescript
// Projects
window.novelist.projects.create(name);
window.novelist.projects.list();
window.novelist.projects.openDialog();
window.novelist.projects.load(projectPath);

// Chapters & Scenes
window.novelist.chapters.list(projectPath);
window.novelist.chapters.create(projectPath, name);
window.novelist.chapters.save(projectPath, chapterId, payload);
window.novelist.chapters.createScene(projectPath, chapterId, sceneName);
window.novelist.chapters.saveScene(projectPath, chapterId, sceneId, payload);

// Characters & Notes
window.novelist.characters.list(projectPath);
window.novelist.characters.save(projectPath, characterId, payload);
window.novelist.notes.list(projectPath);
window.novelist.notes.save(projectPath, noteId, payload);

// Export & Git
window.novelist.exports.project(projectPath);
window.novelist.git.init(projectPath);
window.novelist.git.commit(projectPath, message);
window.novelist.git.push(projectPath);
window.novelist.git.pull(projectPath);

// Preferences
window.novelist.preferences.get();
window.novelist.preferences.set(values);
```

### Scripts disponibles

```bash
# Start the app
npm start

# Development mode with DevTools
npm run dev

# Package for distribution
npm run package
```

### Conseils de développement

- 📝 La logique de l'éditeur réside dans `renderer/app.js`
- 🎨 Les styles sont à l'honneur `renderer/styles.css`
- 🔧 Le point d'entrée du processus principal est `electron/main.js` (ESM)
- 🔒 Le script de préchargement est en CommonJS pour la compatibilité avec Electron.
- 🐛 Prêt `NODE_ENV=development` à ouvrir automatiquement DevTools

---

## 🔧 Dépannage

### Problèmes courants

**"Erreur « Impossible d'ouvrir le projet »**

- Corrigé en protégeant les nœuds DOM manquants
- Ouvrez les outils de développement et consultez la console pour obtenir une trace de pile détaillée.
- Vérifiez que `project.json` le dossier du projet existe.

**Projets récents non affichés**

- Novelist scanne `~/Documents/Novelist/` dès le lancement
- Les projets doivent contenir un fichier `project.json` valide
- Vérifiez que le répertoire des projets existe.

**L'éditeur Quill ne se charge pas**

- L'application bascule automatiquement vers l'éditeur de contenu simple.
- Tente une utilisation du CDN si la ressource Quill locale est indisponible.
- Vérifiez la connexion réseau et la console du navigateur.

**erreurs d'intégration Git**

- Assurez-vous que le projet est initialisé (Git → Initialiser)
- Le système Git doit être configuré avec des identifiants.
- Clés SSH ou identifiants HTTPS nécessaires pour les opérations push/pull
- Vérifiez que le dépôt distant existe et est accessible.

**La sauvegarde automatique ne fonctionne pas**

- La sauvegarde automatique se déclenche après une brève période d'inactivité.
- La sauvegarde manuelle à la fermeture de la fenêtre est garantie
- Vérifiez les permissions des fichiers dans le répertoire du projet

---

## 🗺️ Feuille de route

Fonctionnalités futures prévues pour Novelist:

- 📚 **Exporter au format EPUB/PDF** - Formats prêts à publier
- 🔍 **Recherche dans l'ensemble du projet** - Trouvez du texte dans tous les chapitres et les notes
- 🎯 **Métadonnées de la scène** - Ajoutez des balises, un statut et des champs personnalisés
- 🔄 **Réorganisation des scènes** - Organisation des scènes par glisser-déposer
- 🎨 **Système de thèmes** - Schémas de couleurs et polices personnalisés
- ⌨️ **Mode Machine à écrire** - Écriture zen avec curseur centré
- 📊 **Statistiques d'écriture** - Suivi des objectifs quotidiens et des progrès
- 🔗 **Liens internes** - Personnages de référence et notes dans le texte
- 📱 **Application mobile compagnon** - Application mobile en lecture seule pour la consultation

---

## 🤝 Contribuer

Ce sont les contributions qui rendent la communauté open source extraordinaire ! Toute contribution est . **grandement appréciée**.

### Comment contribuer

1. Fork du projet
2. Créez votre branche de fonctionnalités (`git checkout -b feature/AmazingFeature`)
3. Validez vos modifications (`git commit -m 'Add some AmazingFeature'`)
4. Pousser vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une demande de fusion

### Lignes directrices relatives aux contributions

- ✅ Limiter la portée des fonctionnalités et maintenir le modèle de fichier local
- ✅ Ajouter une gestion claire des erreurs et des solutions de repli pour l'interface utilisateur
- ✅ Testé au minimum sur macOS ; les corrections pour Linux/Windows sont les bienvenues
- ✅ Respectez les conventions et styles de codage existants
- ✅ Rédigez des messages de commit pertinents
- ✅ Mettre à jour la documentation au besoin
- ✅ Ajoutez des commentaires pour les logiques complexes

### Normes de développement

- Utilisez ESM dans le processus principal et CommonJS dans le préchargement.

- Maintenir la sécurité IPC grâce à l'isolation du contexte
- Préserver le format de stockage Markdown
- Maintenir la réactivité de l'interface utilisateur pendant les opérations sur les fichiers
- Testez avec plusieurs projets et cas limites.

---

## 📄 License

Ce projet est distribué sous licence Unlicense - **Unlicense** - consultez le fichier [LICENSE](LICENSE) pour plus de détails.

### Résumé de la licence

Ce logiciel est placé dans le **domaine public**. Vous êtes libre d'en faire ce que vous voulez.

✅ **Vous POUVEZ :**

- Utilisation à toutes fins (personnelle, commerciale, etc.)
- Modifiez et adaptez le code à votre guise.
- Distribuez et partagez librement
- Utilisation dans des logiciels propriétaires
- Vendez des produits fabriqués avec ce code
- Supprimer toutes les mentions d'attribution et de droit d'auteur
- Relicencier selon les conditions de votre choix

❌ ** Vous n'êtes PAS OBLIGÉ DE :**

- Mentionnez le crédit ou la source.
- Inclure la licence
- Partagez vos modifications
- Code source de la publication

📜 **Aucune garantie:**

- Logiciel fourni « tel quel », sans aucune garantie.

---

## 💖 Credits

### Créé par

**coeng24** - [GitHub](https://github.com/cogrow4)

### Technologies utilisées

- [Electron](https://www.electronjs.org/) - Framework de bureau multiplateforme
- [Quill](https://quilljs.com/) - Éditeur de texte enrichi
- [simple-git](https://github.com/steveukx/git-js) - Intégration Git pour Node.js
- [electron-store](https://github.com/sindresorhus/electron-store) - Stockage persistant
- [Flaticon](https://www.flaticon.com/) - Icônes d'application

### Inspiration

Conçu pour les écrivains qui ont besoin d'un environnement de travail concentré et sans distraction, sans pour autant renoncer à des outils d'organisation performants. Inspiré par Scrivener, Ulysses et la simplicité de Markdown.

---

<div align="center">

### ⭐ Mettez une étoile à ce dépôt si vous le trouvez utile !

**Conçu avec ❤️ pour les écrivains du monde entier**

[⬆Retour en haut](#-novelist)

</div>

## 📬 Contact

<div align="center">

[![wakatime repo](https://wakatime.com/badge/user/f84d00d8-fee3-4ca3-803d-3daa3c7053a5/project/d97aac05-6bec-4815-93b0-ad332aec523b.svg)](https://wakatime.com/badge/user/f84d00d8-fee3-4ca3-803d-3daa3c7053a5/project/d97aac05-6bec-4815-93b0-ad332aec523b)

[![GitHub followers][github followers-shield]][github followers-url]
[![Stargazers][stars-shield]][stars-url]

[![wakatime](https://wakatime.com/badge/user/f84d00d8-fee3-4ca3-803d-3daa3c7053a5.svg)](https://wakatime.com/@f84d00d8-fee3-4ca3-803d-3daa3c7053a5)

[![Github Badge][github badge-shield]][github badge-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

[https://buymeacoffee.com/meseneriko](https://buymeacoffee.com/meseneriko)

<a href="https://buymeacoffee.com/meseneriko">
    <img src="assets/img/logos-erik/bmc_qr.png" alt="Buy My Coffee" width="20%" style="background-color:grey">
</a>  
<p></p>
<p></p>
<a href = 'https://basillecorp.dev'> <img width = '32px' align= 'center' src="https://raw.githubusercontent.com/rahulbanerjee26/githubAboutMeGenerator/main/icons/portfolio.png"/> basillecorp.dev</a>

mesen.erik@gmail.com

</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>
<!-- MARKDOWN LINKS & IMAGES -->

[github followers-shield]: https://img.shields.io/github/followers/erik-42?style=social
[github followers-url]: https://github.com/erik-42?tab=followers
[stars-shield]: https://img.shields.io/github/stars/erik-42/Novelist?style=social
[stars-url]: https://github.com/erik-42/Novelist/stargazers
[github repo-shield]: https://img.shields.io/badge/repo-basillecorp--website-blue
[github badge-shield]: https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white
[github badge-url]: https://github.com/erik-42
[linkedin-shield]: https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white
[linkedin-url]: https://www.linkedin.com/in/erik-mesen/
