import { getProject, updateDb } from "../../services/db.js";
import { modalConfirm, modalPrompt } from "../Modal/Modal.js";

const NOTES_BLOCK = "notes";

function ensureNotes(project) {
  return project.notes ?? { noteOrder: [], notes: {}, selectedNoteId: null };
}

function getNotesList(project) {
  const notes = ensureNotes(project);
  return (notes.noteOrder ?? []).map((id) => notes.notes[id]).filter(Boolean);
}

function escapeHtml(text) {
  const s = String(text ?? "");
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function Notes(project) {
  const notesData = ensureNotes(project);
  const notesList = getNotesList(project);
  const selectedId = notesData.selectedNoteId;
  const selectedNote = selectedId ? notesData.notes[selectedId] : null;

  const noteCards = notesList
    .map(
      (n) => `
      <article class="${NOTES_BLOCK}__item">
        <div class="${NOTES_BLOCK}__item-main">
          <h2 class="${NOTES_BLOCK}__item-title">${escapeHtml(n.title)}</h2>
          <p class="${NOTES_BLOCK}__item-meta">
            ${n.content ? escapeHtml(n.content.slice(0, 80)) + (n.content.length > 80 ? "…" : "") : "Sans contenu"}
          </p>
        </div>
        <div class="${NOTES_BLOCK}__item-tags">
          <div class="${NOTES_BLOCK}__item-actions">
            <button class="${NOTES_BLOCK}__item-button" type="button" data-notes-open="${n.id}">Ouvrir</button>
            <button class="${NOTES_BLOCK}__item-button" type="button" data-notes-rename="${n.id}">Renommer</button>
            <button class="${NOTES_BLOCK}__item-button ${NOTES_BLOCK}__item-button--danger" type="button" data-notes-delete="${n.id}">Supprimer</button>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  const editorHtml =
    selectedNote ?
      `
        <div class="${NOTES_BLOCK}__editor">
          <div class="${NOTES_BLOCK}__editor-header">
            <div class="${NOTES_BLOCK}__editor-title">Éditer la note</div>
            <button class="${NOTES_BLOCK}__editor-close" type="button" data-notes-close="true">Fermer</button>
          </div>
          <label class="${NOTES_BLOCK}__field">
            <span class="${NOTES_BLOCK}__field-label">Titre</span>
            <input class="${NOTES_BLOCK}__field-input" type="text" value="${escapeHtml(selectedNote.title)}" data-notes-field="title" />
          </label>
          <label class="${NOTES_BLOCK}__field">
            <span class="${NOTES_BLOCK}__field-label">Contenu</span>
            <textarea class="${NOTES_BLOCK}__field-textarea" rows="12" data-notes-field="content">${escapeHtml(selectedNote.content ?? "")}</textarea>
          </label>
        </div>
      `
    : "";

  return `
    <section class="${NOTES_BLOCK}" data-notes-project="${project.id}">
      <header class="${NOTES_BLOCK}__header">
        <div class="${NOTES_BLOCK}__header-main">
          <h2 class="${NOTES_BLOCK}__headline">Vos notes</h2>
          <p class="${NOTES_BLOCK}__description">
            Notes et idées pour ce roman. Créez des notes libres, sans structure imposée.
          </p>
        </div>
        <div class="${NOTES_BLOCK}__header-actions">
          <button class="${NOTES_BLOCK}__primary-button" type="button" data-notes-action="create">Nouvelle note</button>
        </div>
      </header>
      <div class="${NOTES_BLOCK}__layout">
        <div class="${NOTES_BLOCK}__grid">
          ${
            notesList.length === 0
              ? `<div class="${NOTES_BLOCK}__empty">
                  <p class="${NOTES_BLOCK}__empty-title">Aucune note pour l’instant</p>
                  <p class="${NOTES_BLOCK}__empty-text">Cliquez sur <strong>Nouvelle note</strong> pour commencer.</p>
                </div>`
              : noteCards
          }
        </div>
        ${editorHtml}
      </div>
    </section>
  `;
}

export function hydrateNotesEvents(rootElement) {
  const host = rootElement.querySelector(`.${NOTES_BLOCK}[data-notes-project]`);
  if (!host) return;
  const projectId = host.getAttribute("data-notes-project");
  const project = getProject(projectId);
  if (!project) return;
  if (!project.notes) project.notes = { noteOrder: [], notes: {}, selectedNoteId: null };

  const rerender = () => window.dispatchEvent(new CustomEvent("app:changed"));

  const createButton = host.querySelector('[data-notes-action="create"]');
  if (createButton) {
    createButton.addEventListener("click", async () => {
      const title = await modalPrompt({
        title: "Nouvelle note",
        label: "Titre",
        defaultValue: "",
        placeholder: "Titre de la note",
        confirmLabel: "Créer",
      });
      if (title === null) return;
      updateDb((db) => {
        const p = db.projects[projectId];
        if (!p) return db;
        if (!p.notes) p.notes = { noteOrder: [], notes: {}, selectedNoteId: null };
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        p.notes.notes[id] = { id, title: title.trim(), content: "", createdAt: now, updatedAt: now };
        p.notes.noteOrder = p.notes.noteOrder ?? [];
        p.notes.noteOrder.unshift(id);
        p.notes.selectedNoteId = id;
        p.updatedAt = now;
        return db;
      });
      rerender();
    });
  }

  host.querySelectorAll("[data-notes-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-notes-open");
      updateDb((db) => {
        const p = db.projects[projectId];
        if (!p?.notes) return db;
        p.notes.selectedNoteId = id;
        p.updatedAt = new Date().toISOString();
        return db;
      });
      rerender();
    });
  });

  host.querySelectorAll("[data-notes-rename]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-notes-rename");
      const note = project.notes?.notes?.[id];
      const title = await modalPrompt({
        title: "Renommer la note",
        label: "Nouveau titre",
        defaultValue: note?.title ?? "",
        confirmLabel: "Renommer",
      });
      if (title === null) return;
      updateDb((db) => {
        const p = db.projects[projectId];
        const n = p?.notes?.notes?.[id];
        if (n) n.title = title.trim();
        if (p) p.updatedAt = new Date().toISOString();
        return db;
      });
      rerender();
    });
  });

  host.querySelectorAll("[data-notes-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-notes-delete");
      const ok = await modalConfirm({
        title: "Supprimer la note",
        message: "Supprimer cette note ?",
        confirmLabel: "Supprimer",
        cancelLabel: "Annuler",
        danger: true,
      });
      if (!ok) return;
      updateDb((db) => {
        const p = db.projects[projectId];
        if (!p?.notes) return db;
        delete p.notes.notes[id];
        p.notes.noteOrder = (p.notes.noteOrder ?? []).filter((x) => x !== id);
        if (p.notes.selectedNoteId === id) p.notes.selectedNoteId = null;
        p.updatedAt = new Date().toISOString();
        return db;
      });
      rerender();
    });
  });

  const closeBtn = host.querySelector("[data-notes-close='true']");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      updateDb((db) => {
        const p = db.projects[projectId];
        if (!p?.notes) return db;
        p.notes.selectedNoteId = null;
        p.updatedAt = new Date().toISOString();
        return db;
      });
      rerender();
    });
  }

  const titleInput = host.querySelector('[data-notes-field="title"]');
  const contentTextarea = host.querySelector('[data-notes-field="content"]');
  const noteId = project.notes?.selectedNoteId;
  if (noteId && titleInput) {
    titleInput.addEventListener("input", () => {
      updateDb((db) => {
        const p = db.projects[projectId];
        const n = p?.notes?.notes?.[noteId];
        if (n) n.title = titleInput.value;
        if (p) p.updatedAt = new Date().toISOString();
        return db;
      });
    });
  }
  if (noteId && contentTextarea) {
    contentTextarea.addEventListener("input", () => {
      updateDb((db) => {
        const p = db.projects[projectId];
        const n = p?.notes?.notes?.[noteId];
        if (n) n.content = contentTextarea.value;
        if (p) p.updatedAt = new Date().toISOString();
        return db;
      });
    });
  }
}
