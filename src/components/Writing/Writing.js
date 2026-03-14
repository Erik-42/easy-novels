import { getProject, updateDb } from "../../services/db.js";
import { modalConfirm, modalPrompt } from "../Modal/Modal.js";

const WRITING_BLOCK = "writing";

function countWords(text) {
  const cleaned = (text ?? "").trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

function renderScene(scene, isActive) {
  return `
    <button class="${WRITING_BLOCK}__scene ${isActive ? `${WRITING_BLOCK}__scene--active` : ""}" type="button" data-writing-scene="${scene.id}">
      <div class="${WRITING_BLOCK}__scene-title">${scene.title}</div>
      <div class="${WRITING_BLOCK}__scene-meta">
        <span class="${WRITING_BLOCK}__scene-status ${WRITING_BLOCK}__scene-status--${scene.status}">${scene.status}</span>
        <span class="${WRITING_BLOCK}__scene-words">${scene.wordCount.toLocaleString("fr-FR")} mots</span>
      </div>
    </button>
  `;
}

export function Writing(project) {
  const writing = project.writing;
  const selectedId = writing.selectedSceneId;
  const scenes = writing.sceneOrder.map((id) => writing.scenes[id]).filter(Boolean);
  const selectedScene = selectedId ? writing.scenes[selectedId] : null;

  return `
    <section class="${WRITING_BLOCK}" data-writing-project="${project.id}">
      <div class="${WRITING_BLOCK}__layout">
        <aside class="${WRITING_BLOCK}__sidebar">
          <div class="${WRITING_BLOCK}__sidebar-header">
            <div class="${WRITING_BLOCK}__sidebar-title">Scènes</div>
            <button class="${WRITING_BLOCK}__sidebar-action" type="button" data-writing-action="add-scene">+ Scène</button>
          </div>
          <div class="${WRITING_BLOCK}__scenes">
            ${scenes.length ? scenes.map((s) => renderScene(s, s.id === selectedId)).join("") : `<div class="${WRITING_BLOCK}__empty">Aucune scène pour l’instant.</div>`}
          </div>
        </aside>

        <div class="${WRITING_BLOCK}__editor">
          ${
            selectedScene
              ? `
                <div class="${WRITING_BLOCK}__editor-header">
                  <div class="${WRITING_BLOCK}__editor-title">Éditer la scène</div>
                  <div class="${WRITING_BLOCK}__editor-actions">
                    <button class="${WRITING_BLOCK}__editor-button" type="button" data-writing-action="duplicate-scene">Dupliquer</button>
                    <button class="${WRITING_BLOCK}__editor-button ${WRITING_BLOCK}__editor-button--danger" type="button" data-writing-action="delete-scene">Supprimer</button>
                  </div>
                </div>

                <div class="${WRITING_BLOCK}__stats">
                  <div class="${WRITING_BLOCK}__stat">
                    <div class="${WRITING_BLOCK}__stat-label">Mots</div>
                    <div class="${WRITING_BLOCK}__stat-value" data-writing-stat="words">${selectedScene.wordCount.toLocaleString("fr-FR")}</div>
                  </div>
                  <div class="${WRITING_BLOCK}__stat">
                    <div class="${WRITING_BLOCK}__stat-label">Statut</div>
                    <div class="${WRITING_BLOCK}__stat-value">${selectedScene.status}</div>
                  </div>
                </div>

                <label class="${WRITING_BLOCK}__field">
                  <span class="${WRITING_BLOCK}__field-label">Titre</span>
                  <input class="${WRITING_BLOCK}__field-input" type="text" value="${selectedScene.title}" data-writing-field="title" />
                </label>

                <label class="${WRITING_BLOCK}__field">
                  <span class="${WRITING_BLOCK}__field-label">Synopsis</span>
                  <textarea class="${WRITING_BLOCK}__field-textarea" rows="3" data-writing-field="synopsis">${selectedScene.synopsis ?? ""}</textarea>
                </label>

                <label class="${WRITING_BLOCK}__field">
                  <span class="${WRITING_BLOCK}__field-label">Texte</span>
                  <textarea class="${WRITING_BLOCK}__field-textarea ${WRITING_BLOCK}__field-textarea--text" rows="14" data-writing-field="text">${selectedScene.text ?? ""}</textarea>
                </label>

                <label class="${WRITING_BLOCK}__field">
                  <span class="${WRITING_BLOCK}__field-label">Avancement</span>
                  <select class="${WRITING_BLOCK}__field-select" data-writing-field="status">
                    ${["todo", "draft", "revised", "done"]
                      .map(
                        (s) =>
                          `<option value="${s}" ${selectedScene.status === s ? "selected" : ""}>${s}</option>`
                      )
                      .join("")}
                  </select>
                </label>

                <div class="${WRITING_BLOCK}__hint">Tout est sauvegardé automatiquement.</div>
              `
              : `<div class="${WRITING_BLOCK}__editor-empty">Crée ou sélectionne une scène à gauche.</div>`
          }
        </div>
      </div>
    </section>
  `;
}

export function hydrateWritingEvents(rootElement) {
  const host = rootElement.querySelector(`.${WRITING_BLOCK}[data-writing-project]`);
  if (!host) return;
  const projectId = host.getAttribute("data-writing-project");

  const rerender = () => window.dispatchEvent(new CustomEvent("app:changed"));

  host.querySelectorAll("[data-writing-scene]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sceneId = btn.getAttribute("data-writing-scene");
      updateDb((db) => {
        const p = db.projects[projectId];
        if (!p) return db;
        p.writing.selectedSceneId = sceneId;
        p.updatedAt = new Date().toISOString();
        return db;
      });
      rerender();
    });
  });

  host.querySelectorAll("[data-writing-action]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const action = btn.getAttribute("data-writing-action");
      const project = getProject(projectId);
      if (!project) return;

      if (action === "add-scene") {
        const title = await modalPrompt({
          title: "Nouvelle scène",
          label: "Titre",
          defaultValue: "Nouvelle scène",
          confirmLabel: "Créer",
        });
        if (!title) return;
        updateDb((db) => {
          const p = db.projects[projectId];
          const id = crypto.randomUUID();
          const scene = {
            id,
            title: title.trim(),
            synopsis: "",
            text: "",
            status: "draft",
            wordCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          p.writing.scenes[id] = scene;
          p.writing.sceneOrder.unshift(id);
          p.writing.selectedSceneId = id;
          p.updatedAt = new Date().toISOString();
          return db;
        });
        rerender();
      }

      if (action === "delete-scene") {
        const sceneId = project.writing.selectedSceneId;
        if (!sceneId) return;
        const ok = await modalConfirm({
          title: "Supprimer la scène",
          message: "Supprimer cette scène ?",
          confirmLabel: "Supprimer",
          cancelLabel: "Annuler",
          danger: true,
        });
        if (!ok) return;
        updateDb((db) => {
          const p = db.projects[projectId];
          delete p.writing.scenes[sceneId];
          p.writing.sceneOrder = p.writing.sceneOrder.filter((id) => id !== sceneId);
          p.writing.selectedSceneId = p.writing.sceneOrder[0] ?? null;
          p.updatedAt = new Date().toISOString();
          return db;
        });
        rerender();
      }

      if (action === "duplicate-scene") {
        const sceneId = project.writing.selectedSceneId;
        if (!sceneId) return;
        updateDb((db) => {
          const p = db.projects[projectId];
          const original = p.writing.scenes[sceneId];
          if (!original) return db;
          const id = crypto.randomUUID();
          p.writing.scenes[id] = {
            ...original,
            id,
            title: `${original.title} (copie)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          p.writing.sceneOrder.unshift(id);
          p.writing.selectedSceneId = id;
          p.updatedAt = new Date().toISOString();
          return db;
        });
        rerender();
      }
    });
  });

  const project = getProject(projectId);
  const sceneId = project?.writing?.selectedSceneId ?? null;
  if (!sceneId) return;

  const titleInput = host.querySelector('[data-writing-field="title"]');
  const synopsisTextarea = host.querySelector('[data-writing-field="synopsis"]');
  const textTextarea = host.querySelector('[data-writing-field="text"]');
  const statusSelect = host.querySelector('[data-writing-field="status"]');
  const wordsStat = host.querySelector('[data-writing-stat="words"]');

  const updateScene = (partial) => {
    updateDb((db) => {
      const p = db.projects[projectId];
      const scene = p?.writing?.scenes?.[sceneId];
      if (!scene) return db;
      Object.assign(scene, partial);
      scene.updatedAt = new Date().toISOString();
      p.updatedAt = new Date().toISOString();
      return db;
    });
  };

  if (titleInput) {
    titleInput.addEventListener("input", () => updateScene({ title: titleInput.value }));
  }
  if (synopsisTextarea) {
    synopsisTextarea.addEventListener("input", () => updateScene({ synopsis: synopsisTextarea.value }));
  }
  if (statusSelect) {
    statusSelect.addEventListener("change", () => updateScene({ status: statusSelect.value }));
  }
  if (textTextarea) {
    const onTextInput = () => {
      const wc = countWords(textTextarea.value);
      updateScene({ text: textTextarea.value, wordCount: wc });
      if (wordsStat) wordsStat.textContent = wc.toLocaleString("fr-FR");
    };
    textTextarea.addEventListener("input", onTextInput);
  }
}

