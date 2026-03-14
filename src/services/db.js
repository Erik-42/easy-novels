const DB_KEY = "web-novelist-db";

function nowIso() {
  return new Date().toISOString();
}

function safeJsonParse(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function createEmptyDb() {
  return {
    version: 1,
    currentProjectId: null,
    projects: {},
  };
}

function migrateFromLegacyIfNeeded() {
  const existing = window.localStorage.getItem(DB_KEY);
  if (existing) return;

  const legacyRaw = window.localStorage.getItem("web-novelist-projects");
  if (!legacyRaw) return;
  const legacyList = safeJsonParse(legacyRaw, []);
  if (!Array.isArray(legacyList)) return;

  const db = createEmptyDb();
  legacyList.forEach((p) => {
    if (!p?.id) return;
    db.projects[p.id] = {
      id: p.id,
      title: typeof p.title === "string" ? p.title : "Roman",
      status: p.status === "active" ? "active" : "draft",
      createdAt: p.createdAt ?? nowIso(),
      updatedAt: nowIso(),
      outline: {
        categories: [
          { id: crypto.randomUUID(), name: "Personnages", itemIds: [] },
          { id: crypto.randomUUID(), name: "Lieux", itemIds: [] },
          { id: crypto.randomUUID(), name: "Intrigues", itemIds: [] },
        ],
        items: {},
      },
      writing: {
        sceneOrder: [],
        scenes: {},
        selectedSceneId: null,
      },
      organize: {
        sections: {},
        sectionOrder: [],
      },
      schedule: {
        goalWords: 50000,
        dueDate: null,
      },
      notes: {
        noteOrder: [],
        notes: {},
        selectedNoteId: null,
      },
    };
  });
  const firstId = legacyList[0]?.id ?? null;
  db.currentProjectId = firstId;
  window.localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function getDb() {
  migrateFromLegacyIfNeeded();
  const raw = window.localStorage.getItem(DB_KEY);
  if (!raw) return createEmptyDb();
  const parsed = safeJsonParse(raw, null);
  if (!parsed || typeof parsed !== "object") return createEmptyDb();
  if (parsed.version !== 1) return createEmptyDb();
  if (!parsed.projects || typeof parsed.projects !== "object") {
    return createEmptyDb();
  }
  return parsed;
}

export function setDb(nextDb) {
  window.localStorage.setItem(DB_KEY, JSON.stringify(nextDb));
}

export function updateDb(updater) {
  const current = getDb();
  const next = updater(structuredClone(current));
  setDb(next);
  return next;
}

export function createProject({ title }) {
  return updateDb((db) => {
    const id = crypto.randomUUID();
    db.projects[id] = {
      id,
      title: title?.trim() ? title.trim() : "Nouveau roman",
      status: "draft",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      outline: {
        categories: [
          { id: crypto.randomUUID(), name: "Personnages", itemIds: [] },
          { id: crypto.randomUUID(), name: "Lieux", itemIds: [] },
          { id: crypto.randomUUID(), name: "Intrigues", itemIds: [] },
        ],
        items: {},
      },
      writing: {
        sceneOrder: [],
        scenes: {},
        selectedSceneId: null,
      },
      organize: {
        sections: {},
        sectionOrder: [],
      },
      schedule: {
        goalWords: 50000,
        dueDate: null,
      },
      notes: {
        noteOrder: [],
        notes: {},
        selectedNoteId: null,
      },
    };
    db.currentProjectId = id;
    return db;
  });
}

export function deleteProject(projectId) {
  return updateDb((db) => {
    delete db.projects[projectId];
    if (db.currentProjectId === projectId) {
      db.currentProjectId = Object.keys(db.projects)[0] ?? null;
    }
    return db;
  });
}

export function renameProject(projectId, title) {
  return updateDb((db) => {
    const project = db.projects[projectId];
    if (!project) return db;
    project.title = title.trim() ? title.trim() : project.title;
    project.updatedAt = nowIso();
    return db;
  });
}

export function setCurrentProject(projectId) {
  return updateDb((db) => {
    db.currentProjectId = projectId ?? null;
    return db;
  });
}

export function getProject(projectId) {
  const db = getDb();
  return db.projects[projectId] ?? null;
}

export function listProjects() {
  const db = getDb();
  return Object.values(db.projects).sort((a, b) => {
    const ad = new Date(a.createdAt).getTime();
    const bd = new Date(b.createdAt).getTime();
    return bd - ad;
  });
}

export function computeProjectWordCount(project) {
  if (!project) return 0;
  const scenes = Object.values(project.writing?.scenes ?? {});
  return scenes.reduce((sum, scene) => sum + (scene.wordCount ?? 0), 0);
}

