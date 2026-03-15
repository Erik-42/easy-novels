import { getProject, updateDb } from "../../services/db.js";
import { modalConfirm, modalPrompt } from "../Modal/Modal.js";

const DOCUMENTS_BLOCK = "documents";

const DOC_TYPES = [
  { id: "link", label: "Lien" },
  { id: "file", label: "Fichier" },
  { id: "note", label: "Note" },
];

function ensureDocuments(project) {
  return project.documents ?? { documentOrder: [], documents: {} };
}

function getDocumentsList(project) {
  const data = ensureDocuments(project);
  return (data.documentOrder ?? []).map((id) => data.documents[id]).filter(Boolean);
}

function escapeHtml(text) {
  const s = String(text ?? "");
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function typeLabel(typeId) {
  return DOC_TYPES.find((t) => t.id === typeId)?.label ?? typeId;
}

export function Documents(project) {
  const data = ensureDocuments(project);
  const list = getDocumentsList(project);

  const cards = list
    .map(
      (doc) => {
        const meta = doc.type === "link" && doc.url ? escapeHtml(doc.url) : (doc.description ? escapeHtml(doc.description).slice(0, 80) + (doc.description.length > 80 ? "…" : "") : "—");
        return `
      <article class="${DOCUMENTS_BLOCK}__item">
        <div class="${DOCUMENTS_BLOCK}__item-main">
          <span class="${DOCUMENTS_BLOCK}__item-tag">${escapeHtml(typeLabel(doc.type))}</span>
          <h2 class="${DOCUMENTS_BLOCK}__item-title">${escapeHtml(doc.title)}</h2>
          <p class="${DOCUMENTS_BLOCK}__item-meta">${meta}</p>
        </div>
        <div class="${DOCUMENTS_BLOCK}__item-tags">
          <div class="${DOCUMENTS_BLOCK}__item-actions">
            ${doc.type === "link" && doc.url ? `<a class="${DOCUMENTS_BLOCK}__item-button" href="${escapeHtml(doc.url).replace(/^javascript:/i, "")}" target="_blank" rel="noopener noreferrer">Ouvrir</a>` : ""}
            <button class="${DOCUMENTS_BLOCK}__item-button" type="button" data-documents-edit="${doc.id}">Modifier</button>
            <button class="${DOCUMENTS_BLOCK}__item-button ${DOCUMENTS_BLOCK}__item-button--danger" type="button" data-documents-delete="${doc.id}">Supprimer</button>
          </div>
        </div>
      </article>
    `;
      }
    )
    .join("");

  return `
    <section class="${DOCUMENTS_BLOCK}" data-documents-project="${project.id}">
      <header class="${DOCUMENTS_BLOCK}__header">
        <div class="${DOCUMENTS_BLOCK}__header-main">
          <h2 class="${DOCUMENTS_BLOCK}__headline">Documents sources</h2>
          <p class="${DOCUMENTS_BLOCK}__description">
            Références, liens et fichiers qui servent de sources pour ce roman.
          </p>
        </div>
        <div class="${DOCUMENTS_BLOCK}__header-actions">
          <button class="${DOCUMENTS_BLOCK}__primary-button" type="button" data-documents-action="create">Ajouter un document</button>
        </div>
      </header>
      <div class="${DOCUMENTS_BLOCK}__layout">
        <div class="${DOCUMENTS_BLOCK}__grid">
          ${
            list.length === 0
              ? `<div class="${DOCUMENTS_BLOCK}__empty">
                  <p class="${DOCUMENTS_BLOCK}__empty-title">Aucun document pour l'instant</p>
                  <p class="${DOCUMENTS_BLOCK}__empty-text">Cliquez sur <strong>Ajouter un document</strong> pour commencer.</p>
                </div>`
              : cards
          }
        </div>
      </div>
    </section>
  `;
}

export function hydrateDocumentsEvents(rootElement) {
  const host = rootElement.querySelector(`.${DOCUMENTS_BLOCK}[data-documents-project]`);
  if (!host) return;
  const projectId = host.getAttribute("data-documents-project");
  const project = getProject(projectId);
  if (!project) return;
  if (!project.documents) project.documents = { documentOrder: [], documents: {} };

  const rerender = () => window.dispatchEvent(new CustomEvent("app:changed"));

  const addDoc = (title, type, url, description) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    updateDb((db) => {
      const p = db.projects[projectId];
      if (!p) return db;
      if (!p.documents) p.documents = { documentOrder: [], documents: {} };
      p.documents.documents[id] = { id, title, type, url: url ?? "", description: description ?? "", createdAt: now, updatedAt: now };
      p.documents.documentOrder = p.documents.documentOrder ?? [];
      p.documents.documentOrder.unshift(id);
      p.updatedAt = now;
      return db;
    });
    rerender();
  };

  const updateDoc = (id, title, type, url, description) => {
    updateDb((db) => {
      const p = db.projects[projectId];
      const doc = p?.documents?.documents?.[id];
      if (doc) {
        doc.title = title ?? doc.title;
        doc.type = type ?? doc.type;
        doc.url = url !== undefined ? url : doc.url;
        doc.description = description !== undefined ? description : doc.description;
        doc.updatedAt = new Date().toISOString();
      }
      if (p) p.updatedAt = new Date().toISOString();
      return db;
    });
    rerender();
  };

  host.querySelector('[data-documents-action="create"]')?.addEventListener("click", async () => {
    const title = await modalPrompt({ title: "Nouveau document source", label: "Titre", defaultValue: "", placeholder: "Ex. Carte de la région, Article Wikipédia…", confirmLabel: "Créer" });
    if (title === null) return;
    const desc = await modalPrompt({ title: "Description (optionnel)", label: "Description ou URL", defaultValue: "", placeholder: "Courte description ou lien", confirmLabel: "OK" });
    addDoc(title.trim(), "note", "", desc !== null ? desc.trim() : "");
  });

  host.querySelectorAll("[data-documents-edit]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-documents-edit");
      const doc = project.documents?.documents?.[id];
      if (!doc) return;
      const title = await modalPrompt({ title: "Modifier le document", label: "Titre", defaultValue: doc.title ?? "", confirmLabel: "Suivant" });
      if (title === null) return;
      const typeRaw = await modalPrompt({ title: "Type", label: "Type (link, file, note)", defaultValue: doc.type ?? "note", confirmLabel: "Suivant" });
      const type = typeRaw !== null && ["link", "file", "note"].includes(typeRaw.trim()) ? typeRaw.trim() : doc.type;
      let url = doc.url ?? "";
      if (type === "link") {
        const u = await modalPrompt({ title: "Lien", label: "URL", defaultValue: doc.url ?? "", placeholder: "https://…", confirmLabel: "Suivant" });
        if (u !== null) url = u.trim();
      }
      const description = await modalPrompt({ title: "Description", label: "Description", defaultValue: doc.description ?? "", confirmLabel: "Enregistrer" });
      updateDoc(id, title.trim(), type, url, description !== null ? description : doc.description);
    });
  });

  host.querySelectorAll("[data-documents-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-documents-delete");
      const ok = await modalConfirm({
        title: "Supprimer le document",
        message: "Supprimer ce document source ?",
        confirmLabel: "Supprimer",
        cancelLabel: "Annuler",
        danger: true,
      });
      if (!ok) return;
      updateDb((db) => {
        const p = db.projects[projectId];
        if (!p?.documents) return db;
        delete p.documents.documents[id];
        p.documents.documentOrder = (p.documents.documentOrder ?? []).filter((x) => x !== id);
        p.updatedAt = new Date().toISOString();
        return db;
      });
      rerender();
    });
  });
}
