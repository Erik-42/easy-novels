import { Library, hydrateLibraryEvents } from "./components/Library/Library.js";
import { Outline, hydrateOutlineEvents } from "./components/Outline/Outline.js";
import { Writing, hydrateWritingEvents } from "./components/Writing/Writing.js";
import { Organize, hydrateOrganizeEvents } from "./components/Organize/Organize.js";
import { Schedule, hydrateScheduleEvents } from "./components/Schedule/Schedule.js";
import { computeProjectWordCount, getDb, getProject, listProjects, setCurrentProject } from "./services/db.js";
import { exportProjectAsMarkdown } from "./services/exportMarkdown.js";
import { Home, hydrateHomeEvents } from "./components/Home/Home.js";
import { Personnages, hydratePersonnagesEvents } from "./components/Personnages/Personnages.js";
import { Notes, hydrateNotesEvents } from "./components/Notes/Notes.js";
import { modalAlert } from "./components/Modal/Modal.js";

const BOOK_VIEWS = [
  { id: "personnages", label: "Création de personnages", description: "Créer et gérer vos personnages" },
  { id: "outline", label: "Esquisser", description: "Intrigue, personnages, univers" },
  { id: "writing", label: "Écrire", description: "Scènes et texte du manuscrit" },
  { id: "organize", label: "Organiser", description: "Actes, parties, chapitres" },
  { id: "schedule", label: "Programmer", description: "Objectifs et progression" },
  { id: "notes", label: "Notes", description: "Notes et idées" },
];

/** Liste unifiée pour les boutons de la section (Bibliothèque + vues livre). */
const SECTION_NAV_ITEMS = [
  { id: "library", label: "Bibliothèque", description: "Tous vos livres", isLibrary: true },
  ...BOOK_VIEWS.map((v) => ({ ...v, isLibrary: false })),
];

function parseRoute() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash || hash === "home") {
    return { name: "home" };
  }
  if (hash === "library") {
    return { name: "library" };
  }
  const parts = hash.split("/").filter(Boolean);
  if (parts[0] === "book" && parts[1]) {
    const projectId = parts[1];
    const view = parts[2] || "outline";
    const valid = BOOK_VIEWS.some((v) => v.id === view) ? view : "outline";
    return { name: "book", projectId, view: valid };
  }
  return { name: "home" };
}

function renderView(route, project) {
  if (route.name === "library") return Library();
  if (!project) return Library();
  switch (route.view) {
    case "personnages":
      return Personnages(project);
    case "outline":
      return Outline(project);
    case "writing":
      return Writing(project);
    case "organize":
      return Organize(project);
    case "schedule":
      return Schedule(project);
    case "notes":
      return Notes(project);
    default:
      return Outline(project);
  }
}

function render() {
  const root = document.getElementById("app-root");
  if (!root) return;

  const route = parseRoute();

  if (route.name === "home") {
    root.innerHTML = Home();
    hydrateHomeEvents(root);
    return;
  }

  const db = getDb();
  const projectId = route.name === "book" ? route.projectId : db.currentProjectId;
  const project = projectId ? getProject(projectId) : null;
  if (route.name === "book" && projectId && project) {
    setCurrentProject(projectId);
  }

  const headerLabel =
    route.name === "library"
      ? "Bibliothèque"
      : BOOK_VIEWS.find((v) => v.id === route.view)?.label ?? "Livre";
  const headerDescription =
    route.name === "library"
      ? "Tous vos livres et modèles"
      : BOOK_VIEWS.find((v) => v.id === route.view)?.description ?? "";

  root.innerHTML = `
    <div class="app">
      <aside class="app__sidebar">
        <div class="app__brand">
          <a href="#home" class="app__brand-title app__brand-title--link">Easy-Novel</a>
          <div class="app__brand-subtitle">Écrire, structurer, avancer</div>
        </div>
        <div class="app__nav">
          <div class="app__nav-label">Sections</div>
          ${SECTION_NAV_ITEMS.map(
            (item) => `
          <button class="app__nav-item ${item.isLibrary ? route.name === "library" : route.name === "book" && route.view === item.id ? "app__nav-item--active" : ""}" type="button" ${item.isLibrary ? 'data-nav-library="true"' : `data-nav-view="${item.id}"`}>
            <span class="app__nav-item-label">
              <span class="app__nav-item-title">${item.label}</span>
              <span class="app__nav-item-subtitle">${item.description}</span>
            </span>
            <span class="app__nav-item-tag">SECTION</span>
          </button>`
          ).join("")}
        </div>
        <div class="app__sidebar-footer">
          <span class="app__sidebar-footer-strong">Conseil :</span> sauvegardez vos projets régulièrement.
        </div>
      </aside>
      <main class="app__content">
      ${
        project
          ? `<div class="app__topbar">
                <div class="app__topbar-main">
                  <div class="app__topbar-title">${project.title}</div>
                  <div class="app__topbar-subtitle">${computeProjectWordCount(project).toLocaleString("fr-FR")} mots au total</div>
                </div>
                <div class="app__topbar-actions">
                  <button class="app__button" type="button" data-topbar-library="true">Retour bibliothèque</button>
                  <button class="app__button app__button--primary" type="button" data-topbar-export="true">Exporter (Markdown)</button>
                </div>
              </div>`
          : ""
      }
        <header class="app__content-header">
          <div>
            <h1 class="app__content-title">${headerLabel}</h1>
            <p class="app__content-subtitle">${headerDescription}</p>
          </div>
          <div class="app__badge">
            <span class="app__badge-dot"></span>
            <span class="app__badge-label">Mode local</span>
          </div>
        </header>
        <section class="app__view">
          ${renderView(route, project)}
        </section>
      </main>
    </div>
  `;

  const libraryButton = root.querySelector('[data-nav-library="true"]');
  if (libraryButton) {
    libraryButton.addEventListener("click", () => {
      window.location.hash = "#library";
    });
  }

  root.querySelectorAll("[data-nav-view]").forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.getAttribute("data-nav-view");
      if (route.name === "book" && project?.id) {
        window.location.hash = `#book/${project.id}/${view}`;
        return;
      }
      const projects = listProjects();
      if (projects.length === 0) {
        modalAlert({
          title: "Aucun livre",
          message: "Créez d’abord un roman dans la bibliothèque pour accéder à cette section.",
          confirmLabel: "OK",
        });
        return;
      }
      setCurrentProject(projects[0].id);
      window.location.hash = `#book/${projects[0].id}/${view}`;
    });
  });

  const backButton = root.querySelector('[data-topbar-library="true"]');
  if (backButton) {
    backButton.addEventListener("click", () => {
      window.location.hash = "#library";
    });
  }

  const exportButton = root.querySelector('[data-topbar-export="true"]');
  if (exportButton && project) {
    exportButton.addEventListener("click", () => {
      exportProjectAsMarkdown(project);
    });
  }

  hydrateLibraryEvents(root);
  hydratePersonnagesEvents(root);
  hydrateNotesEvents(root);
  hydrateOutlineEvents(root);
  hydrateWritingEvents(root);
  hydrateOrganizeEvents(root);
  hydrateScheduleEvents(root);
}

window.addEventListener("hashchange", () => {
  render();
});

document.addEventListener("DOMContentLoaded", () => {
  render();
});

window.addEventListener("app:changed", () => render());

