# Plan de développement Easy-Novels V2

Feuille de route pour la migration vers React + PouchDB sur la branche `easy-novels-V2`.

---

## 1. Structure du projet (React + Vite)

```
web-novelist-app/
├── client/                      # Application React (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/          # Composants React
│   │   │   ├── App/
│   │   │   ├── Layout/
│   │   │   │   ├── Sidebar/
│   │   │   │   ├── Navbar/
│   │   │   │   └── Topbar/
│   │   │   ├── Library/
│   │   │   ├── Outline/
│   │   │   ├── Writing/
│   │   │   ├── Organize/
│   │   │   ├── Schedule/
│   │   │   ├── Notes/
│   │   │   ├── Documents/
│   │   │   └── DataExchange/     # Modales import/export
│   │   ├── hooks/                # useProject, usePouch, etc.
│   │   ├── services/             # Accès données & logique métier
│   │   │   ├── db/               # PouchDB + schéma
│   │   │   ├   ├── pouch.js
│   │   │   │   ├── schema.js     # Types & helpers
│   │   │   │   └── sync.js       # Sync CouchDB (Phase 4)
│   │   │   ├── importParser.js   # .docx, .txt, .md → chapitres
│   │   │   ├── exportGenerator.js # → .md, .docx, .pdf, .html
│   │   │   └── auth.js           # JWT (Phase 4)
│   │   ├── contexts/             # React context (auth, theme, current project)
│   │   ├── styles/               # Global + thèmes (clair, sombre, sépia)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docs/
│   └── PLAN-V2.md               # Ce fichier
├── assets/                      # Partagé (images, etc.)
└── README.md
```

---

## 2. Schéma de données PouchDB

Un seul base locale `easy-novels` (ou une par projet plus tard si besoin). Documents typés par `type`.

### 2.1 Document principal : Projet (roman)

```json
{
  "_id": "project_abc123",
  "type": "project",
  "title": "Mon Premier Roman",
  "status": "draft",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-20T14:30:00.000Z",
  "stats": {
    "wordGoal": 50000,
    "deadline": "2024-12-31",
    "lastEditedSceneId": "scene_xyz"
  },
  "structure": ["section_act1", "section_ch1", "section_ch2"],
  "outlineCategoryIds": ["cat_perso", "cat_lieux", "cat_intrigues"]
}
```

### 2.2 Structure (actes / chapitres / sections)

```json
{
  "_id": "section_xyz",
  "type": "section",
  "projectId": "project_abc123",
  "sectionType": "act",
  "title": "Acte I",
  "order": 0,
  "childIds": ["section_ch1", "section_ch2"]
}
```

```json
{
  "_id": "section_ch1",
  "type": "section",
  "projectId": "project_abc123",
  "sectionType": "chapter",
  "title": "Chapitre 1",
  "order": 0,
  "parentId": "section_act1",
  "sceneIds": ["scene_001", "scene_002"]
}
```

### 2.3 Scènes (manuscrit)

```json
{
  "_id": "scene_001",
  "type": "scene",
  "projectId": "project_abc123",
  "sectionId": "section_ch1",
  "title": "Ouverture",
  "content": "<p>Il faisait nuit...</p>",
  "wordCount": 1250,
  "status": "revised",
  "order": 0,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### 2.4 Esquisse (fiches)

```json
{
  "_id": "outline_category_1",
  "type": "outlineCategory",
  "projectId": "project_abc123",
  "name": "Personnages",
  "order": 0,
  "itemIds": ["outline_item_1", "outline_item_2"]
}
```

```json
{
  "_id": "outline_item_1",
  "type": "outlineItem",
  "projectId": "project_abc123",
  "categoryId": "outline_category_1",
  "title": "Marie",
  "summary": "Héroïne, 28 ans.",
  "linkedSceneIds": ["scene_001"],
  "createdAt": "...",
  "updatedAt": "..."
}
```

### 2.5 Notes

```json
{
  "_id": "note_001",
  "type": "note",
  "projectId": "project_abc123",
  "title": "Idée fin",
  "content": "...",
  "tags": ["fin", "twist"],
  "createdAt": "...",
  "updatedAt": "..."
}
```

### 2.6 Documents sources

Pour éviter de surcharger PouchDB, on stocke uniquement les **métadonnées** ; les fichiers lourds vont dans IndexedDB / dossier dédié (Phase ultérieure).

```json
{
  "_id": "document_001",
  "type": "document",
  "projectId": "project_abc123",
  "title": "Carte du monde",
  "documentType": "image",
  "mimeType": "image/png",
  "storageKey": "blob_abc123",
  "url": null,
  "createdAt": "..."
}
```

```json
{
  "_id": "document_002",
  "type": "document",
  "projectId": "project_abc123",
  "title": "Article Wikipédia",
  "documentType": "link",
  "url": "https://...",
  "storageKey": null,
  "createdAt": "..."
}
```

### 2.7 Comptes utilisateur (Phase 4)

```json
{
  "_id": "user_settings",
  "type": "userSettings",
  "currentProjectId": "project_abc123",
  "theme": "dark",
  "sidebarCollapsed": false
}
```

---

## 3. Phase 1 : Migration (détail des tâches)

### Étape 1.1 — Environnement

- [ ] Créer l’app Vite + React dans `client/` : `npm create vite@latest client -- --template react`.
- [ ] Installer les dépendances de base : `pouchdb`, `react-router-dom`.
- [ ] Configurer BEM / CSS Modules ou Tailwind (selon CDC).
- [ ] Vérifier que `npm run dev` et `npm run build` fonctionnent.

### Étape 1.2 — PouchDB et schéma

- [ ] Créer `src/services/db/pouch.js` : initialisation PouchDB (base locale `easy-novels`).
- [ ] Créer `src/services/db/schema.js` : constantes `type`, helpers `createProject()`, `createScene()`, etc., qui génèrent des documents conformes au schéma ci-dessus.
- [ ] Pas de CouchDB ni sync pour l’instant (Phase 4).

### Étape 1.3 — Routing et layout de base

- [ ] Mettre en place React Router : `/`, `/library`, `/book/:projectId/:view` (outline | writing | organize | schedule | notes | documents).
- [ ] Composant `Layout` : Sidebar (rétractable), Navbar, zone de contenu.
- [ ] Sidebar : liens Bibliothèque + vues livre (Esquisser, Écrire, Organiser, Programmer, Notes, Documents) comme en V1.

### Étape 1.4 — Bibliothèque

- [ ] Page Bibliothèque : liste des projets (requête PouchDB `type === 'project'`).
- [ ] Création / édition / suppression de projet (titre, statut) avec mise à jour PouchDB.
- [ ] Tableau de bord par projet : stats rapides (objectif mots, dernier chapitre édité) lues depuis le doc `project` et les scènes.

### Étape 1.5 — Données “projet courant”

- [ ] Context `CurrentProject` : projet sélectionné + chargement des données liées (structure, scènes, outline, notes, documents).
- [ ] Hooks `useProject(projectId)`, `useProjectScenes(projectId)`, `useOutline(projectId)` qui lisent PouchDB et mettent à jour l’UI.

### Étape 1.6 — Module Esquisser (migration V1 → V2)

- [ ] Catégories d’esquisse : CRUD + ordre (outlineCategory).
- [ ] Fiches : CRUD (outlineItem), éditeur titre + synopsis.
- [ ] Lien fiches ↔ scènes : champ `linkedSceneIds` sur les fiches (édition ultérieure dans Écrire / Organiser).

### Étape 1.7 — Sauvegarde automatique (fondation)

- [ ] Pour chaque entité (scène, fiche, note, projet) : toute modification déclenche un `db.put()` après un court debounce (ex. 300–500 ms) pour éviter une écriture à chaque frappe tout en restant “quasi temps réel”.
- [ ] Pas encore d’historique de révisions (snapshots) ; PouchDB garde déjà l’historique CouchDB côté sync (Phase 4).

---

## 4. Phase 2 — Éditeur (rappel)

- Intégration Quill.js dans le module Écrire.
- Mode focus (interface épurée).
- Compteur de mots temps réel (scène + global).
- Statuts de scène : À faire, Premier jet, Révisé, Terminé.
- Sauvegarde automatique du contenu Quill vers le document `scene` dans PouchDB (déjà préparée en Phase 1).

---

## 5. Phase 3 — Organisation (rappel)

- Gestion hiérarchique Actes > Chapitres > Scènes.
- Drag & Drop (@dnd-kit) pour réorganiser chapitres et scènes.
- Mise à jour des champs `structure`, `childIds`, `sceneIds`, `order` dans PouchDB.

---

## 6. Phases 4 & 5 — Synchro & PWA (rappel)

- Phase 4 : CouchDB, sync PouchDB ↔ CouchDB, authentification JWT.
- Phase 5 : PWA (Service Worker), installation hors-ligne.

---

## 7. Ordre d’exécution recommandé (Phase 1)

1. **1.1** — Créer `client/` avec Vite + React.
2. **1.2** — PouchDB + schéma dans `src/services/db/`.
3. **1.3** — Router + Layout (Sidebar, Navbar).
4. **1.4** — Bibliothèque (liste, CRUD projet, tableau de bord).
5. **1.5** — Context + hooks projet courant.
6. **1.6** — Module Esquisser (catégories + fiches).
7. **1.7** — Debounce sauvegarde automatique.

Ensuite enchaîner Phase 2 (Quill, compteur de mots, statuts), puis Phase 3 (dnd-kit), etc.

---

## 8. Checklist Phase 1 (état initial)

- [x] **1.1** — Projet Vite + React dans `client/` (Vite 5 pour Node 18)
- [x] **1.2** — PouchDB + schéma dans `src/services/db/` (pouch.js, schema.js)
- [x] **1.3** — Router + Layout (Sidebar, routes /, /library, /book/:projectId/:view)
- [x] **1.4** — Bibliothèque : liste des projets, création (put project), lien Ouvrir
- [x] **1.5** — Context CurrentProject + chargement projet dans BookView
- [ ] **1.6** — Module Esquisser (catégories + fiches, CRUD)
- [ ] **1.7** — Debounce sauvegarde automatique (écriture → put après 300–500 ms)

**Lancer l’app :** `cd client && npm install && npm run dev`

---

*Document créé pour la branche `easy-novels-V2`. À mettre à jour au fil des livrables.*
