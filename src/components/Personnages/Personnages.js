import { getProject, updateDb } from "../../services/db.js";
import { modalConfirm, modalPrompt } from "../Modal/Modal.js";

const PERSONNAGES_BLOCK = "personnages";

function getCharacters(project) {
  if (!project?.outline?.categories) return [];
  const cat = project.outline.categories.find((c) => c.name === "Personnages");
  if (!cat?.itemIds?.length) return [];
  const items = project.outline.items ?? {};
  return cat.itemIds.map((id) => items[id]).filter(Boolean);
}

function escapeHtml(text) {
  const s = String(text ?? "");
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function Personnages(project) {
  const characters = getCharacters(project);

  const characterCards = characters
    .map(
      (c) => `
      <article class="${PERSONNAGES_BLOCK}__item">
        <div class="${PERSONNAGES_BLOCK}__item-main">
          <h2 class="${PERSONNAGES_BLOCK}__item-title">${escapeHtml(c.title)}</h2>
          <p class="${PERSONNAGES_BLOCK}__item-meta">
            ${c.summary ? escapeHtml(c.summary.slice(0, 80)) + (c.summary.length > 80 ? "…" : "") : "Fiche personnage"}
          </p>
        </div>
        <div class="${PERSONNAGES_BLOCK}__item-tags">
          <div class="${PERSONNAGES_BLOCK}__item-actions">
            <button class="${PERSONNAGES_BLOCK}__item-button" type="button" data-personnages-open="${c.id}">
              Ouvrir
            </button>
            <button class="${PERSONNAGES_BLOCK}__item-button" type="button" data-personnages-rename="${c.id}">
              Renommer
            </button>
            <button class="${PERSONNAGES_BLOCK}__item-button ${PERSONNAGES_BLOCK}__item-button--danger" type="button" data-personnages-delete="${c.id}">
              Supprimer
            </button>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  return `
    <section class="${PERSONNAGES_BLOCK}" data-personnages-project="${project.id}">
      <header class="${PERSONNAGES_BLOCK}__header">
        <div class="${PERSONNAGES_BLOCK}__header-main">
          <h2 class="${PERSONNAGES_BLOCK}__headline">Création de personnages</h2>
          <p class="${PERSONNAGES_BLOCK}__description">
            Créez un nouveau personnage ou ouvrez une fiche existante. Les fiches sont stockées dans ce roman et sont aussi éditables dans la section Esquisser.
          </p>
        </div>
        <div class="${PERSONNAGES_BLOCK}__header-actions">
          <button class="${PERSONNAGES_BLOCK}__primary-button" type="button" data-personnages-action="create">
            Nouveau personnage
          </button>
        </div>
      </header>
      <div class="${PERSONNAGES_BLOCK}__grid">
        ${
          characters.length === 0
            ? `<div class="${PERSONNAGES_BLOCK}__empty">
                <p class="${PERSONNAGES_BLOCK}__empty-title">Aucun personnage pour l’instant</p>
                <p class="${PERSONNAGES_BLOCK}__empty-text">
                  Cliquez sur <strong>Nouveau personnage</strong> pour commencer votre premier personnage.
                </p>
              </div>`
            : characterCards
        }
      </div>
    </section>
  `;
}

export function hydratePersonnagesEvents(rootElement) {
  const host = rootElement.querySelector(`.${PERSONNAGES_BLOCK}[data-personnages-project]`);
  if (!host) return;
  const projectId = host.getAttribute("data-personnages-project");
  const project = getProject(projectId);
  if (!project) return;

  const rerender = () => window.dispatchEvent(new CustomEvent("app:changed"));

  const createButton = host.querySelector('[data-personnages-action="create"]');
  if (createButton) {
    createButton.addEventListener("click", async () => {
      const name = await modalPrompt({
        title: "Nouveau personnage",
        label: "Nom du personnage",
        defaultValue: "",
        placeholder: "Ex. Jean Dupont",
        confirmLabel: "Créer",
      });
      if (name === null || !name.trim()) return;
      updateDb((db) => {
        const p = db.projects[projectId];
        if (!p) return db;
        let cat = p.outline.categories.find((c) => c.name === "Personnages");
        if (!cat) {
          cat = { id: crypto.randomUUID(), name: "Personnages", itemIds: [] };
          p.outline.categories.push(cat);
        }
        const itemId = crypto.randomUUID();
        p.outline.items[itemId] = { id: itemId, title: name.trim(), summary: "" };
        cat.itemIds = cat.itemIds ?? [];
        cat.itemIds.unshift(itemId);
        p.updatedAt = new Date().toISOString();
        return db;
      });
      rerender();
    });
  }

  host.querySelectorAll("[data-personnages-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const itemId = button.getAttribute("data-personnages-open");
      updateDb((db) => {
        const p = db.projects[projectId];
        if (!p) return db;
        p.outline.selectedCategoryId = p.outline.categories.find((c) => c.name === "Personnages")?.id ?? null;
        p.outline.selectedItemId = itemId;
        p.updatedAt = new Date().toISOString();
        return db;
      });
      window.location.hash = `#book/${projectId}/outline`;
      rerender();
    });
  });

  host.querySelectorAll("[data-personnages-rename]").forEach((button) => {
    button.addEventListener("click", async () => {
      const itemId = button.getAttribute("data-personnages-rename");
      const item = project.outline.items?.[itemId];
      const name = await modalPrompt({
        title: "Renommer le personnage",
        label: "Nouveau nom",
        defaultValue: item?.title ?? "",
        confirmLabel: "Renommer",
      });
      if (name === null || !name.trim()) return;
      updateDb((db) => {
        const p = db.projects[projectId];
        const i = p.outline.items?.[itemId];
        if (i) i.title = name.trim();
        p.updatedAt = new Date().toISOString();
        return db;
      });
      rerender();
    });
  });

  host.querySelectorAll("[data-personnages-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      const itemId = button.getAttribute("data-personnages-delete");
      const ok = await modalConfirm({
        title: "Supprimer le personnage",
        message: "Supprimer ce personnage ?",
        confirmLabel: "Supprimer",
        cancelLabel: "Annuler",
        danger: true,
      });
      if (!ok) return;
      updateDb((db) => {
        const p = db.projects[projectId];
        delete p.outline.items[itemId];
        p.outline.categories.forEach((c) => {
          if (c.itemIds) c.itemIds = c.itemIds.filter((id) => id !== itemId);
        });
        p.updatedAt = new Date().toISOString();
        return db;
      });
      rerender();
    });
  });
}
