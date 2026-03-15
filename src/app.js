import { Library, hydrateLibraryEvents } from "./components/Library/Library.js";
import { Outline, hydrateOutlineEvents } from "./components/Outline/Outline.js";
import { Writing, hydrateWritingEvents } from "./components/Writing/Writing.js";
import { Organize, hydrateOrganizeEvents } from "./components/Organize/Organize.js";
import { Schedule, hydrateScheduleEvents } from "./components/Schedule/Schedule.js";
import { computeProjectWordCount, getDb, getProject, listProjects, setCurrentProject } from "./services/db.js";
import { exportProjectAsMarkdown } from "./services/exportMarkdown.js";
import { importMarkdownFromFile } from "./services/importMarkdown.js";
import { Home, hydrateHomeEvents } from "./components/Home/Home.js";
import { Notes, hydrateNotesEvents } from "./components/Notes/Notes.js";
import { Documents, hydrateDocumentsEvents } from "./components/Documents/Documents.js";
import { modalAlert } from "./components/Modal/Modal.js";

const BOOK_VIEWS = [
  { id: "outline", label: "Esquisser", description: "Intrigue, personnages, univers" },
  { id: "writing", label: "Écrire", description: "Scènes et texte du manuscrit" },
  { id: "organize", label: "Organiser", description: "Actes, parties, chapitres" },
  { id: "schedule", label: "Programmer", description: "Objectifs et progression" },
  { id: "notes", label: "Notes", description: "Notes et idées" },
  { id: "documents", label: "Documents", description: "Sources et références" },
];

/** Liste unifiée pour les boutons de la section (Bibliothèque + vues livre). */
const SECTION_NAV_ITEMS = [
  { id: "library", label: "Bibliothèque", description: "Tous vos livres", isLibrary: true },
  ...BOOK_VIEWS.map((v) => ({ ...v, isLibrary: false })),
];

function parseRoute() {
  const hash = window.location.hash.replace(/^#/, "").trim();
  if (!hash || hash === "home") {
    if (!hash) window.location.hash = "#home";
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
    case "documents":
      return Documents(project);
    default:
      return Outline(project);
  }
}

function render() {
  const root = document.getElementById("app-root");
  if (!root) return;

  let route;
  let db;
  let projectId;
  let project;
  try {
    route = parseRoute();
    db = getDb();
    projectId = route.name === "book" ? route.projectId : db.currentProjectId;
    project = projectId ? getProject(projectId) : null;
  } catch (err) {
    console.error("render (init):", err);
    const raw = err && err.message ? String(err.message) : String(err);
    const msg = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    root.innerHTML = `<div id="app-load-error" class="app"><div class="app__body"><main class="app__content" style="padding:2rem;color:#e5e7eb"><p><strong>Erreur au chargement</strong></p><pre style="background:#1e293b;padding:0.75rem;overflow:auto;font-size:0.85rem">${msg}</pre><p>Vérifiez la console (F12). Si vous êtes en navigation privée, désactivez-la (localStorage est requis).</p></main></div></div>`;
    return;
  }

  if (route.name === "book" && projectId && project) {
    setCurrentProject(projectId);
  }

  const headerLabel =
    route.name === "home"
      ? "Accueil"
      : route.name === "library"
        ? "Bibliothèque"
        : BOOK_VIEWS.find((v) => v.id === route.view)?.label ?? "Livre";
  const headerDescription =
    route.name === "home"
      ? "Bienvenue"
      : route.name === "library"
        ? "Tous vos livres et modèles"
        : BOOK_VIEWS.find((v) => v.id === route.view)?.description ?? "";

  const navbarHtml = `<nav class="app__navbar" role="menubar">
    <div class="app__navbar-menu">
      <button class="app__navbar-trigger" type="button" aria-haspopup="true" aria-expanded="false" data-navbar-menu="fichier">Fichier</button>
      <div class="app__navbar-dropdown">
        <a class="app__navbar-item" href="#library">Bibliothèque</a>
        <button class="app__navbar-item" type="button" data-navbar-import="true">Importer (Markdown)</button>
        ${project ? `<button class="app__navbar-item" type="button" data-navbar-export="true">Exporter (Markdown)</button>` : ""}
      </div>
    </div>
    <div class="app__navbar-menu">
      <button class="app__navbar-trigger" type="button" aria-haspopup="true" aria-expanded="false" data-navbar-menu="edition">Édition</button>
      <div class="app__navbar-dropdown"><span class="app__navbar-item app__navbar-item--muted">Bientôt disponible</span></div>
    </div>
    <div class="app__navbar-menu">
      <button class="app__navbar-trigger" type="button" aria-haspopup="true" aria-expanded="false" data-navbar-menu="affichage">Affichage</button>
      <div class="app__navbar-dropdown"><span class="app__navbar-item app__navbar-item--muted">Bientôt disponible</span></div>
    </div>
    <div class="app__navbar-menu">
      <button class="app__navbar-trigger" type="button" aria-haspopup="true" aria-expanded="false" data-navbar-menu="aide">Aide</button>
      <div class="app__navbar-dropdown">
        <a class="app__navbar-item" href="#home">Accueil</a>
        <span class="app__navbar-item app__navbar-item--muted">À propos — Bientôt</span>
      </div>
    </div>
  </nav>`;

  const sidebarNavItems = route.name === "book" ? SECTION_NAV_ITEMS : SECTION_NAV_ITEMS.filter((item) => item.isLibrary);
  const sidebarHtml =
    route.name === "home"
      ? ""
      : `<aside class="app__sidebar">
          <div class="app__brand">
            <a href="#home" class="app__brand-title app__brand-title--link">Easy-Novel</a>
            <div class="app__brand-subtitle">Écrire, structurer, avancer</div>
          </div>
          <div class="app__nav">
            <div class="app__nav-label">Sections</div>
            ${sidebarNavItems.map(
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
        </aside>`;

  const mainContentHtml =
    route.name === "home"
      ? Home()
      : `
          ${
            route.name === "book" && project
              ? `<div class="app__topbar">
                  <div class="app__topbar-left">
                    <span class="app__topbar-status app__topbar-status--${project.status || "draft"}">${project.status === "active" ? "En cours" : "Brouillon"}</span>
                  </div>
                  <div class="app__topbar-main">
                    <div class="app__topbar-title">${project.title}</div>
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
        `;

  try {
    root.innerHTML = `
      <div class="app">
        ${navbarHtml}
        <div class="app__body">
          ${sidebarHtml}
          <main class="app__content">${mainContentHtml}</main>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("render:", err);
    root.innerHTML = `<div class="app"><div class="app__body"><main class="app__content" style="padding:2rem;color:#e5e7eb"><p>Erreur. Vérifiez la console (F12).</p></main></div></div>`;
  }

  if (route.name === "home") {
    hydrateHomeEvents(root);
  }

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

  hydrateLibraryEvents(root);
  hydrateNotesEvents(root);
  hydrateOutlineEvents(root);
  hydrateWritingEvents(root);
  hydrateOrganizeEvents(root);
  hydrateScheduleEvents(root);
  hydrateDocumentsEvents(root);
}

window.addEventListener("hashchange", () => {
  render();
});

function init() {
  try {
    render();
  } catch (err) {
    console.error("DOMContentLoaded/render:", err);
    const root = document.getElementById("app-root");
    if (root) {
      const raw = err && err.message ? String(err.message) : String(err);
      const msg = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      root.innerHTML = `<div id="app-load-error" style="padding:2rem;color:#e5e7eb"><p><strong>Erreur au démarrage</strong></p><pre style="background:#1e293b;padding:1rem;overflow:auto;font-size:0.85rem">${msg}</pre><p>Ouvrez la console (F12) pour plus de détails. Si le mode privé est activé, désactivez-le (localStorage requis).</p></div>`;
    }
  }
}

function runInit() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    setTimeout(init, 0);
  }
}
runInit();

function handleNavbarClick(e) {
  const root = document.getElementById("app-root");
  if (!root) return;

  const trigger = e.target.closest(".app__navbar-trigger");
  if (trigger && root.contains(trigger)) {
    e.preventDefault();
    e.stopPropagation();
    const menu = trigger.closest(".app__navbar-menu");
    const dropdown = menu?.querySelector(".app__navbar-dropdown");
    if (!dropdown) return;
    const isOpen = dropdown.classList.contains("app__navbar-dropdown--open");
    root.querySelectorAll(".app__navbar-dropdown--open").forEach((d) => d.classList.remove("app__navbar-dropdown--open"));
    root.querySelectorAll(".app__navbar-trigger[aria-expanded=\"true\"]").forEach((t) => t.setAttribute("aria-expanded", "false"));
    if (!isOpen) {
      dropdown.classList.add("app__navbar-dropdown--open");
      trigger.setAttribute("aria-expanded", "true");
    }
    return;
  }

  const exportBtn = e.target.closest("[data-navbar-export]");
  if (exportBtn && root.contains(exportBtn)) {
    e.preventDefault();
    const db = getDb();
    const project = db.currentProjectId ? getProject(db.currentProjectId) : null;
    if (project) exportProjectAsMarkdown(project);
    return;
  }

  const importBtn = e.target.closest("[data-navbar-import]");
  if (importBtn && root.contains(importBtn)) {
    e.preventDefault();
    importMarkdownFromFile().then((project) => {
      if (project) {
        window.dispatchEvent(new CustomEvent("app:changed"));
        window.location.hash = "#book/" + project.id + "/outline";
      }
    });
    return;
  }

  if (e.target.closest(".app__navbar")) return;
  root.querySelectorAll(".app__navbar-dropdown--open").forEach((d) => d.classList.remove("app__navbar-dropdown--open"));
  root.querySelectorAll(".app__navbar-trigger[aria-expanded=\"true\"]").forEach((t) => t.setAttribute("aria-expanded", "false"));
}

document.addEventListener("click", handleNavbarClick);

window.addEventListener("app:changed", () => render());

