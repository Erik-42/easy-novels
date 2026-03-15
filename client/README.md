# Easy-Novels V2 — Client React

Application React (Vite) + PouchDB pour Easy-Novels.

## Installation

```bash
npm install
npm install pouchdb react-router-dom
```

## Développement

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Structure

- `src/components/` — Composants React (Layout, Library, Outline, Writing, etc.)
- `src/services/db/` — PouchDB (pouch.js, schema.js), sync (Phase 4)
- `src/hooks/` — useProjects, useCurrentProject, etc.
- `src/contexts/` — CurrentProject, Theme, Auth (Phase 4)
- `src/styles/` — Global + thèmes

Voir le [plan de développement](../docs/PLAN-V2.md) pour la Phase 1 et les suivantes.
