**Easy-Novels** est une véritable plateforme de production littéraire complète. Ils renforcent la nécessité d'une structure de données solide pour que tout reste lié et synchronisé.

**Cahier des Charges (CDC)** structuré pour mon projet **Easy-Novels**. Ce document servira de feuille de route pour la transition de mon prototype actuel vers une application robuste et synchronisée.

---

# Cahier des Charges : Projet "Easy-Novels"

## 1. Présentation du Projet

**Easy-Novels** est une application "Offline-first" dédiée à l'écriture de romans. Elle permet aux auteurs de planifier (esquisses), d'écrire, d'organiser leur manuscrit et de suivre leurs objectifs de productivité, le tout avec une synchronisation transparente entre plusieurs appareils.

## 2. Objectifs Fonctionnels

L'application doit être divisée en quatre modules principaux :

### A. Bibliothèque & Gestion de Projets

* Création, édition, suppression de projets (romans).
* Tableau de bord par projet (statistiques rapides, dernier chapitre édité).

### B. Module "Esquisser" (Planning)

* Création de fiches par catégories (Personnages, Lieux, Intrigues, etc...).
* Éditeur de fiches avec titre et synopsis.
* Possibilité de lier des fiches à des scènes.

### C. Module "Écrire" (L'Éditeur)

* **Éditeur Rich Text (Quill.js) :** Gestion du gras, italique, titres.
* **Mode Focus :** Interface épurée pour l'écriture.
* **Compteur de mots :** En temps réel (par scène et global).
* **Statuts de scène :** À faire, Premier jet, Révisé, Terminé.

### D. Module "Organiser" & Structure

* Gestion de la structure hiérarchique : Actes > Chapitres > Scènes.
* **Drag & Drop (dnd kit) :** Réorganiser visuellement l'ordre des chapitres et des scènes.

### E. Synchronisation & Hors-ligne

* Utilisation sans connexion internet (PWA).
* Synchronisation automatique dès le retour du réseau.
* Système de compte utilisateur (Login/Password).

### F. Module "Programmer" (Productivité)

* **Objectifs de mots :** Fixer un nombre total de mots pour le roman ou par session.
* **Gestion de la Deadline :** Calcul automatique du quota quotidien (mots/jour) en fonction de la date d'échéance.
* **Suivi du temps :** Chronomètre de session pour suivre le temps effectif d'écriture.
* **Statistiques :** Graphiques de progression (évolution du nombre de mots sur le temps).

### G. Module "Notes" (Système de Références)

* **Notes volantes :** Création rapide de notes non structurées (idées soudaines).
* **Interconnexion :** Système de "tags" ou de liens pour citer une note directement dans l'éditeur de texte.
* **Incrémentation :** Possibilité d'ajouter du contenu à une note existante sans quitter l'écran d'écriture (via une fenêtre latérale).

### H. Module "Documents" (Gestion des Sources)

* **Stockage de fichiers :** Importation de PDF, images (cartes, inspirations) ou fichiers texte.
* **Visualiseur intégré :** Pouvoir consulter un document source côte à côte avec l'éditeur de texte.
* **Sources Web :** Enregistrement de liens URL avec aperçu pour les recherches documentaires.

### I. Module "Export / Import / Impression"

* **Export multiformat :** Markdown (.md), Microsoft Word (.docx), PDF et HTML.
* **Options d'export :** Choisir d'exporter le manuscrit seul, ou d'inclure les notes et les fiches de personnages.
* **Impression :** Mise en page optimisée pour l'impression papier (numérotation des pages, marges).
* **Sauvegarde externe (Backup) :** Export d'un fichier JSON complet contenant TOUT le projet pour une sauvegarde manuelle ou un transfert de compte.

### I. Module "Échanges de Données" (Export, Import, Impression)
Ce module assure la liberté de l'utilisateur vis-à-vis de ses données.

Migration de manuscrit : Importation de fichiers .docx, .md ou .txt avec découpage automatique (par exemple : créer un nouveau chapitre à chaque fois que le logiciel détecte le mot "Chapitre".

Importation Markdown : Idéal pour les auteurs venant d'Obsidian ou d'autres outils de prise de notes.

Restauration de projet : Importation d'une archive .json (format propre à l'app) pour restaurer l'intégralité du projet (roman + notes + documents + objectifs) en une seule action.

Ajout de documents : Glisser-déposer de ressources externes directement dans la bibliothèque de documents du projet.

Exportation Multiformat :

Formats : .txt, .md, .docx, .pdf, .html.

Export sélectif : Pouvoir choisir d'exporter soit le manuscrit final "propre", soit le "Dossier de travail" complet (manuscrit + fiches personnages + notes).

Impression & Mise en page :

Génération d'une version imprimable respectant les standards éditoriaux (police Serif, interlignage, marges larges pour corrections manuscrites).

Possibilités d'ajouter une couverture et une quatriéme de couverture

Aperçu avant impression.

---

Résumé de la Logique de Sauvegarde Automatique
Pour que l'import/export fonctionne avec la sauvegarde automatique, voici comment les données circulent :

Entrée (Import) : Le fichier importé est parsé (analysé), puis injecté immédiatement dans PouchDB.

Vie du document (Écriture) : Chaque modification est sauvegardée en temps réel en local.

Sortie (Export) : L'application compile les données éparpillées dans la base de données (scènes, chapitres, notes) pour générer un fichier unique à la demande.

Structure des dossiers pour le développement (React)
Pour intégrer ces fonctions proprement dans ma structure actuelle, voici l'organisation recommandée :

src/components/DataExchange/ : Contient les modales d'import/export.

src/services/importParser.js : Logique pour transformer un .docx ou un .txt en chapitres exploitables par l'app.

src/services/exportGenerator.js : Logique pour compiler le texte et générer les fichiers de sortie.

---

## Architecture de Sauvegarde Automatique (Zéro Perte)

Pour garantir que l'utilisateur ne perde **jamais rien**, la stratégie technique repose sur trois niveaux :

1. **Niveau Local (Instantané) :** Chaque frappe de clavier dans l'éditeur déclenche une mise à jour dans **PouchDB**. Même si l'ordinateur s'éteint brutalement, le texte est déjà dans la base de données locale du navigateur.

2. **Niveau Synchronisation (Transparent) :** PouchDB surveille les changements et les pousse vers le serveur **CouchDB** dès qu'une connexion internet est détectée.

3. **Niveau Versioning (Sécurité) :** Implémentation d'un historique de révisions (Snapshot). Si un utilisateur efface par erreur un chapitre, il peut revenir à la version d'il y a 30 minutes.

### Schéma de données suggéré (JSON)

Pour lier tous ces modules, ma base de données devra structurer les documents ainsi :

```json
{
  "_id": "roman_001",
  "type": "project",
  "title": "Mon Premier Roman",
  "stats": { "word_goal": 50000, "deadline": "2024-12-31" },
  "structure": [ "chapitre_id_1", "chapitre_id_2" ],
  "notes": [ "note_id_101", "note_id_102" ],
  "documents": [ "doc_id_201" ]
}

```

### Conseil pour la suite :

Pour le module **Documents**, attention au stockage : PouchDB est excellent pour le texte, mais si je stocke beaucoup d'images haute résolution ou de gros PDF, la base de données locale peut devenir lourde. 
Il serait peut être préférable de stocker les fichiers lourds dans un dossier spécifique en local et sur le serveur et de ne garder que le lien dans mes notes.

---

## 3. Spécifications Techniques

### Frontend

* **Framework :** React (via Vite) pour la réactivité de l'interface.
* **Langage :** JavaScript (ES6+).
* **Style :** CSS modules ou Tailwind CSS (pour une UI propre et adaptative).
* **Mobile :** Capacitor (pour l'export en application native si besoin).

### Stockage & Backend

* **Stockage Local :** PouchDB (remplace localStorage, permet de stocker des volumes importants de texte).
* **Serveur de Synchro :** CouchDB faisant office de relais.
* **Authentification :** JWT (JSON Web Tokens) pour sécuriser l'accès aux données.

### Outils spécifiques

* **Éditeur :** Quill.js.
* **Glisser-déposer :** @dnd-kit/core.
* **Export :** Bibliothèques JS pour générer du Markdown et du .docx.

---

## 4. Interface Utilisateur (UI/UX)

* **Sidebar rétractable :** Pour naviguer entre Bibliothèque, Esquisse, Écriture et Organisation.
* **Thèmes :** Mode clair, mode sombre et mode "Sépia" (reposant pour les yeux).
* **Responsive Design :** L'application doit être parfaitement utilisable sur tablette et smartphone.

---

## 5. Livrables attendus

1. **Phase 1 (Migration) :** Reprise de la logique actuelle de `easy-novels` vers une structure React + PouchDB.
2. **Phase 2 (Éditeur) :** Intégration de Quill.js avec sauvegarde automatique dans PouchDB.
3. **Phase 3 (Organisation) :** Mise en place du Drag & Drop pour la structure du roman.
4. **Phase 4 (Synchro) :** Mise en ligne du serveur CouchDB et gestion des comptes utilisateurs.
5. **Phase 5 (PWA) :** Configuration du Service Worker pour l'installation hors-ligne.

---

## 6. Contraintes & Sécurité

* **Sécurité des données :** Le manuscrit est le bien le plus précieux de l'utilisateur. Un système de "Backups" (exports automatiques ou historique de versions) est fortement recommandé.
* **Performance :** L'application ne doit pas ralentir même si le roman dépasse les 100 000 mots.

---

### Prochaines étapes suggérées :

1. Initialiser un nouveau projet avec `npm create vite@latest` (choisir React).
2. Installer PouchDB (`npm install pouchdb`).
3. Transférer mes composants HTML/JS actuels vers des composants React.

