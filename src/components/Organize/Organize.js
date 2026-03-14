import { getProject, updateDb } from "../../services/db.js";
import { modalAlert, modalConfirm, modalPrompt } from "../Modal/Modal.js";

const ORGANIZE_BLOCK = "organize";

function renderSection(section, scenesMap) {
  const attached = section.sceneIds ?? [];
  return `
    <article class="${ORGANIZE_BLOCK}__section">
      <header class="${ORGANIZE_BLOCK}__section-header">
        <div>
          <div class="${ORGANIZE_BLOCK}__section-type">${section.type}</div>
          <div class="${ORGANIZE_BLOCK}__section-title">${section.title}</div>
        </div>
        <div class="${ORGANIZE_BLOCK}__section-actions">
          <button class="${ORGANIZE_BLOCK}__section-button" type="button" data-organize-rename="${section.id}">Renommer</button>
          <button class="${ORGANIZE_BLOCK}__section-button ${ORGANIZE_BLOCK}__section-button--danger" type="button" data-organize-delete="${section.id}">Supprimer</button>
        </div>
      </header>
      <div class="${ORGANIZE_BLOCK}__section-body">
        <div class="${ORGANIZE_BLOCK}__section-subtitle">Scènes rattachées</div>
        <div class="${ORGANIZE_BLOCK}__scene-list">
          ${
            attached.length
              ? attached
                  .map((id) => scenesMap[id])
                  .filter(Boolean)
                  .map((s) => `<div class="${ORGANIZE_BLOCK}__scene-chip">${s.title}</div>`)
                  .join("")
              : `<div class="${ORGANIZE_BLOCK}__scene-empty">Aucune scène rattachée.</div>`
          }
        </div>
        <button class="${ORGANIZE_BLOCK}__attach-button" type="button" data-organize-attach="${section.id}">
          Gérer les scènes…
        </button>
      </div>
    </article>
  `;
}

export function Organize(project) {
  const organize = project.organize;
  const sections = organize.sectionOrder.map((id) => organize.sections[id]).filter(Boolean);
  const scenesMap = project.writing.scenes ?? {};

  return `
    <section class="${ORGANIZE_BLOCK}" data-organize-project="${project.id}">
      <header class="${ORGANIZE_BLOCK}__header">
        <div>
          <div class="${ORGANIZE_BLOCK}__headline">Structure</div>
          <div class="${ORGANIZE_BLOCK}__description">Crée des sections et rattache-y des scènes pour composer le manuscrit.</div>
        </div>
        <div class="${ORGANIZE_BLOCK}__header-actions">
          <button class="${ORGANIZE_BLOCK}__primary-button" type="button" data-organize-action="add-act">+ Acte</button>
          <button class="${ORGANIZE_BLOCK}__primary-button" type="button" data-organize-action="add-chapter">+ Chapitre</button>
          <button class="${ORGANIZE_BLOCK}__secondary-button" type="button" data-organize-action="add-custom">+ Section</button>
        </div>
      </header>

      <div class="${ORGANIZE_BLOCK}__sections">
        ${
          sections.length
            ? sections.map((s) => renderSection(s, scenesMap)).join("")
            : `<div class="${ORGANIZE_BLOCK}__empty">Aucune section. Ajoute un acte ou un chapitre pour démarrer.</div>`
        }
      </div>
    </section>
  `;
}

export function hydrateOrganizeEvents(rootElement) {
  const host = rootElement.querySelector(`.${ORGANIZE_BLOCK}[data-organize-project]`);
  if (!host) return;
  const projectId = host.getAttribute("data-organize-project");

  const rerender = () => window.dispatchEvent(new CustomEvent("app:changed"));

  host.querySelectorAll("[data-organize-action]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const action = btn.getAttribute("data-organize-action");
      const preset =
        action === "add-act"
          ? { type: "Acte", title: "Nouvel acte" }
          : action === "add-chapter"
            ? { type: "Chapitre", title: "Nouveau chapitre" }
            : { type: "Section", title: "Nouvelle section" };
      const title = await modalPrompt({
        title: `Ajouter ${preset.type.toLowerCase()}`,
        label: "Titre",
        defaultValue: preset.title,
        confirmLabel: "Ajouter",
      });
      if (!title) return;
      updateDb((db) => {
        const p = db.projects[projectId];
        if (!p) return db;
        const id = crypto.randomUUID();
        p.organize.sections[id] = {
          id,
          type: preset.type,
          title: title.trim(),
          sceneIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        p.organize.sectionOrder.push(id);
        p.updatedAt = new Date().toISOString();
        return db;
      });
      rerender();
    });
  });

  host.querySelectorAll("[data-organize-rename]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const sectionId = btn.getAttribute("data-organize-rename");
      const project = getProject(projectId);
      const section = project?.organize?.sections?.[sectionId];
      const title = await modalPrompt({
        title: "Renommer la section",
        label: "Nouveau titre",
        defaultValue: section?.title ?? "",
        confirmLabel: "Renommer",
      });
      if (!title) return;
      updateDb((db) => {
        const p = db.projects[projectId];
        const s = p.organize.sections[sectionId];
        if (s) {
          s.title = title.trim();
          s.updatedAt = new Date().toISOString();
        }
        p.updatedAt = new Date().toISOString();
        return db;
      });
      rerender();
    });
  });

  host.querySelectorAll("[data-organize-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const sectionId = btn.getAttribute("data-organize-delete");
      const ok = await modalConfirm({
        title: "Supprimer la section",
        message: "Supprimer cette section ?",
        confirmLabel: "Supprimer",
        cancelLabel: "Annuler",
        danger: true,
      });
      if (!ok) return;
      updateDb((db) => {
        const p = db.projects[projectId];
        delete p.organize.sections[sectionId];
        p.organize.sectionOrder = p.organize.sectionOrder.filter((id) => id !== sectionId);
        p.updatedAt = new Date().toISOString();
        return db;
      });
      rerender();
    });
  });

  host.querySelectorAll("[data-organize-attach]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const sectionId = btn.getAttribute("data-organize-attach");
      const project = getProject(projectId);
      if (!project) return;
      const scenes = project.writing.sceneOrder.map((id) => project.writing.scenes[id]).filter(Boolean);
      if (scenes.length === 0) {
        await modalAlert({
          title: "Aucune scène",
          message: "Crée d’abord des scènes dans la section Écrire.",
        });
        return;
      }
      const section = project.organize.sections[sectionId];
      const message =
        "Entre les numéros des scènes à rattacher (séparés par des virgules).\n\n" +
        scenes.map((s, idx) => `${idx + 1}. ${s.title}`).join("\n") +
        "\n\nExemple: 1,3,4";
      const input = await modalPrompt({
        title: "Rattacher des scènes",
        label: "Numéros (ex: 1,3,4)",
        defaultValue: "",
        placeholder: "1,3,4",
        confirmLabel: "Enregistrer",
      });
      if (input === null) return;
      const picks = input
        .split(",")
        .map((x) => Number(x.trim()))
        .filter((n) => Number.isFinite(n) && n >= 1 && n <= scenes.length);
      const selectedIds = Array.from(new Set(picks.map((n) => scenes[n - 1].id)));
      updateDb((db) => {
        const p = db.projects[projectId];
        const s = p.organize.sections[sectionId];
        if (!s) return db;
        s.sceneIds = selectedIds;
        s.updatedAt = new Date().toISOString();
        p.updatedAt = new Date().toISOString();
        return db;
      });
      rerender();
    });
  });
}

