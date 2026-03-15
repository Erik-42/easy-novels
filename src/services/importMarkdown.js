import { createProject, getDb, updateDb } from "./db.js";

function countWords(text) {
  const cleaned = (text ?? "").trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

/**
 * Parse un Markdown exporté par l'app (format exportMarkdown) et retourne
 * une structure { title, outline: { categories, items }, manuscript: { sections, scenes } }.
 */
export function parseMarkdownToProject(mdText) {
  const lines = String(mdText ?? "").split(/\n/);
  let title = "Roman importé";
  const outlineCategories = [];
  const outlineItems = {};
  const sections = [];
  const allScenes = [];
  let currentMode = null;
  let currentCategory = null;
  let currentSection = null;
  let currentItem = null;
  let currentScene = null;
  let buffer = [];

  function flushItem() {
    if (!currentItem || !currentCategory) return;
    const id = crypto.randomUUID();
    currentItem.id = id;
    outlineItems[id] = currentItem;
    currentCategory.itemIds.push(id);
    currentItem = null;
    buffer = [];
  }

  function flushScene() {
    if (!currentScene) return;
    if (buffer.length) {
      currentScene.text = buffer.join("\n").trim();
      buffer = [];
    }
    const id = crypto.randomUUID();
    currentScene.id = id;
    currentScene.wordCount = countWords(currentScene.text);
    currentScene.status = "draft";
    currentScene.createdAt = new Date().toISOString();
    currentScene.updatedAt = currentScene.createdAt;
    allScenes.push(currentScene);
    if (currentSection) currentSection.sceneIds.push(id);
    currentScene = null;
  }

  function flushSection() {
    if (currentSection) {
      sections.push(currentSection);
      currentSection = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h1 = line.match(/^#\s+(.+)$/);
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);
    const h4 = line.match(/^####\s+(.+)$/);
    const blockquote = line.match(/^>\s*(.*)$/);

    if (h1) {
      flushItem();
      flushScene();
      flushSection();
      title = h1[1].trim();
      currentMode = null;
      continue;
    }
    if (h2) {
      flushItem();
      flushScene();
      flushSection();
      const head = h2[1].trim();
      if (head === "Esquisse") currentMode = "outline";
      else if (head === "Manuscrit") currentMode = "manuscript";
      else currentMode = null;
      continue;
    }
    if (h3 && currentMode === "outline") {
      flushItem();
      const catName = h3[1].trim();
      currentCategory = { id: crypto.randomUUID(), name: catName, itemIds: [] };
      outlineCategories.push(currentCategory);
      continue;
    }
    if (h3 && currentMode === "manuscript") {
      flushScene();
      flushSection();
      const sectionTitle = h3[1].trim();
      currentSection = { id: crypto.randomUUID(), title: sectionTitle, sceneIds: [] };
      continue;
    }
    if (h4 && currentMode === "outline") {
      flushItem();
      currentItem = { title: h4[1].trim(), summary: "" };
      continue;
    }
    if (h4 && currentMode === "manuscript") {
      flushScene();
      currentScene = { title: h4[1].trim(), synopsis: "", text: "" };
      continue;
    }

    if (currentMode === "outline" && currentItem !== null) {
      if (line.trim() === "" && buffer.length) {
        currentItem.summary = buffer.join("\n").trim();
        buffer = [];
      } else if (line.trim() !== "" || buffer.length > 0) {
        buffer.push(line);
      }
      continue;
    }
    if (currentMode === "manuscript" && currentScene !== null) {
      if (blockquote) {
        currentScene.synopsis = (currentScene.synopsis ? currentScene.synopsis + "\n" : "") + blockquote[1].trim();
      } else {
        buffer.push(line);
      }
      continue;
    }
  }

  flushItem();
  flushScene();
  flushSection();

  const sceneOrder = allScenes.map((s) => s.id);
  const scenesById = {};
  allScenes.forEach((s) => {
    scenesById[s.id] = s;
  });
  const sectionOrder = sections.map((s) => s.id);
  const sectionsById = {};
  sections.forEach((s) => {
    sectionsById[s.id] = s;
  });

  const outline = {
    categories: outlineCategories.length ? outlineCategories : [
      { id: crypto.randomUUID(), name: "Personnages", itemIds: [] },
      { id: crypto.randomUUID(), name: "Lieux", itemIds: [] },
      { id: crypto.randomUUID(), name: "Intrigues", itemIds: [] },
    ],
    items: outlineItems,
  };

  return {
    title: title.trim() || "Roman importé",
    outline,
    writing: {
      sceneOrder,
      scenes: scenesById,
      selectedSceneId: sceneOrder[0] ?? null,
    },
    organize: {
      sectionOrder,
      sections: sectionsById,
    },
  };
}

/**
 * Ouvre un sélecteur de fichier .md, parse le contenu et crée un nouveau projet.
 * Retourne le projet créé ou null si annulé / erreur.
 */
export function importMarkdownFromFile() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md,text/markdown,text/plain";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result;
          const parsed = parseMarkdownToProject(text);
          const dbAfterCreate = createProject({ title: parsed.title });
          const projectId = dbAfterCreate.currentProjectId;
          if (!projectId) {
            resolve(null);
            return;
          }
          updateDb((db) => {
            const p = db.projects[projectId];
            if (!p) return db;
            p.outline = parsed.outline;
            p.writing = parsed.writing;
            p.organize = parsed.organize;
            p.updatedAt = new Date().toISOString();
            return db;
          });
          resolve(getDb().projects[projectId]);
        } catch (err) {
          console.error("Import Markdown:", err);
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsText(file, "UTF-8");
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}
