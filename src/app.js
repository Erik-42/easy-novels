import { Library, hydrateLibraryEvents } from "./components/Library/Library.js";
import { Outline, hydrateOutlineEvents } from "./components/Outline/Outline.js";
import { Writing, hydrateWritingEvents } from "./components/Writing/Writing.js";
import { Organize, hydrateOrganizeEvents } from "./components/Organize/Organize.js";
import { Schedule, hydrateScheduleEvents } from "./components/Schedule/Schedule.js";
import { computeProjectWordCount, getDb, getProject, setCurrentProject } from "./services/db.js";
import { exportProjectAsMarkdown } from "./services/exportMarkdown.js";

const BOOK_VIEWS = [
  { id: "outline", label: "Esquisser", description: "Intrigue, personnages, univers" },
  { id: "writing", label: "Écrire", description: "Scènes et texte du manuscrit" },
  { id: "organize", label: "Organiser", description: "Actes, parties, chapitres" },
  { id: "schedule", label: "Programmer", description: "Objectifs et progression" },
];

function parseRoute() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash || hash === "library") {
    return { name: "library" };
  }
  const parts = hash.split("/").filter(Boolean);
  if (parts[0] === "book" && parts[1]) {
    const projectId = parts[1];
    const view = parts[2] || "outline";
    const valid = BOOK_VIEWS.some((v) => v.id === view) ? view : "outline";
    return { name: "book", projectId, view: valid };
  }
  return { name: "library" };
}

function renderSidebarNavItem(view, currentView) {
  const isActive = currentView === view.id;
  return `
    <button
      class="app__nav-item ${isActive ? "app__nav-item--active" : ""}"
      data-book-view="${view.id}"
      type="button"
    >
      <span class="app__nav-item-label">
        <span class="app__nav-item-title">${view.label}</span>
        <span class="app__nav-item-subtitle">${view.description}</span>
      </span>
      <span class="app__nav-item-tag">MODE</span>
    </button>
  `;
}

function renderView(route, project) {
  if (route.name === "library") return Library();
  if (!project) return Library();
  switch (route.view) {
    case "outline":
      return Outline(project);
    case "writing":
      return Writing(project);
    case "organize":
      return Organize(project);
    case "schedule":
      return Schedule(project);
    default:
      return Outline(project);
  }
}

function render() {
  const root = document.getElementById("app-root");
  if (!root) return;

  const route = parseRoute();
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
          <div class="app__brand-title">Easy-Novel</div>
          <div class="app__brand-subtitle">Écrire, structurer, avancer</div>
        </div>
        <div class="app__nav">
          <div class="app__nav-label">Sections</div>
          ${
            route.name === "library"
              ? `<button class="app__nav-item app__nav-item--active" type="button" data-nav-library="true">
                  <span class="app__nav-item-label">
                    <span class="app__nav-item-title">Bibliothèque</span>
                    <span class="app__nav-item-subtitle">Tous vos livres</span>
                  </span>
                  <span class="app__nav-item-tag">HOME</span>
                </button>`
              : BOOK_VIEWS.map((view) => renderSidebarNavItem(view, route.view)).join("")
          }
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

  root.querySelectorAll("[data-book-view]").forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.getAttribute("data-book-view");
      const activeProjectId = project?.id;
      if (!activeProjectId) {
        window.location.hash = "#library";
        return;
      }
      window.location.hash = `#book/${activeProjectId}/${view}`;
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

