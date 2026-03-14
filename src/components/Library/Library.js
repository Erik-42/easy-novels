import {
  computeProjectWordCount,
  createProject,
  deleteProject,
  listProjects,
  renameProject,
  setCurrentProject,
} from "../../services/db.js";
import { modalConfirm, modalPrompt } from "../Modal/Modal.js";

const LIBRARY_BLOCK = "library";

export function Library() {
  const projects = listProjects();

  const projectCards = projects
    .map(
      (project) => `
      <article class="${LIBRARY_BLOCK}__item">
        <div class="${LIBRARY_BLOCK}__item-main">
          <h2 class="${LIBRARY_BLOCK}__item-title">${project.title}</h2>
          <p class="${LIBRARY_BLOCK}__item-meta">
            Créé le ${new Date(project.createdAt).toLocaleDateString("fr-FR")}
          </p>
          <p class="${LIBRARY_BLOCK}__item-words">
            ${computeProjectWordCount(project).toLocaleString("fr-FR")} mots
          </p>
        </div>
        <div class="${LIBRARY_BLOCK}__item-tags">
          <span class="${LIBRARY_BLOCK}__item-tag ${LIBRARY_BLOCK}__item-tag--status-${project.status}">
            ${project.status === "draft" ? "Brouillon" : "En cours"}
          </span>
          <div class="${LIBRARY_BLOCK}__item-actions">
            <button class="${LIBRARY_BLOCK}__item-button" type="button" data-library-open="${project.id}">
              Ouvrir
            </button>
            <button class="${LIBRARY_BLOCK}__item-button" type="button" data-library-rename="${project.id}">
              Renommer
            </button>
            <button class="${LIBRARY_BLOCK}__item-button ${LIBRARY_BLOCK}__item-button--danger" type="button" data-library-delete="${project.id}">
              Supprimer
            </button>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  return `
    <section class="${LIBRARY_BLOCK}">
      <header class="${LIBRARY_BLOCK}__header">
        <div class="${LIBRARY_BLOCK}__header-main">
          <h2 class="${LIBRARY_BLOCK}__headline">Vos livres</h2>
          <p class="${LIBRARY_BLOCK}__description">
            Créez un nouveau roman ou ouvrez un projet existant. Cette version
            reconstruite stocke vos livres dans le navigateur (localStorage).
          </p>
        </div>
        <div class="${LIBRARY_BLOCK}__header-actions">
          <button class="${LIBRARY_BLOCK}__primary-button" type="button" data-library-action="create">
            Nouveau roman
          </button>
        </div>
      </header>
      <div class="${LIBRARY_BLOCK}__grid">
        ${
          projects.length === 0
            ? `<div class="${LIBRARY_BLOCK}__empty">
                <p class="${LIBRARY_BLOCK}__empty-title">Aucun roman pour l’instant</p>
                <p class="${LIBRARY_BLOCK}__empty-text">
                  Cliquez sur <strong>Nouveau roman</strong> pour commencer votre premier projet.
                </p>
              </div>`
            : projectCards
        }
      </div>
    </section>
  `;
}

export function hydrateLibraryEvents(rootElement) {
  const createButton = rootElement.querySelector(
    '[data-library-action="create"]'
  );

  if (createButton) {
    createButton.addEventListener("click", async () => {
      const title = await modalPrompt({
        title: "Nouveau roman",
        label: "Titre",
        defaultValue: "Nouveau roman",
        placeholder: "Titre du roman",
        confirmLabel: "Créer",
      });
      if (title === null) return;
      createProject({ title });
      window.location.hash = "#library";
      window.dispatchEvent(new CustomEvent("app:changed"));
    });
  }

  rootElement.querySelectorAll("[data-library-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-library-open");
      setCurrentProject(id);
      window.location.hash = `#book/${id}/outline`;
      window.dispatchEvent(new CustomEvent("app:changed"));
    });
  });

  rootElement.querySelectorAll("[data-library-rename]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.getAttribute("data-library-rename");
      const title = await modalPrompt({
        title: "Renommer le roman",
        label: "Nouveau titre",
        defaultValue: "",
        confirmLabel: "Renommer",
      });
      if (!title) return;
      renameProject(id, title);
      window.dispatchEvent(new CustomEvent("app:changed"));
    });
  });

  rootElement.querySelectorAll("[data-library-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.getAttribute("data-library-delete");
      const ok = await modalConfirm({
        title: "Supprimer le roman",
        message: "Supprimer ce roman ? Cette action est irréversible.",
        confirmLabel: "Supprimer",
        cancelLabel: "Annuler",
        danger: true,
      });
      if (!ok) return;
      deleteProject(id);
      window.dispatchEvent(new CustomEvent("app:changed"));
    });
  });
}

