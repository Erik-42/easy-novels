import { getProject, updateDb } from "../../services/db.js";
import { modalConfirm, modalPrompt } from "../Modal/Modal.js";

const OUTLINE_BLOCK = "outline";

function renderCategory(category, isActive) {
  return `
    <button class="${OUTLINE_BLOCK}__category ${isActive ? `${OUTLINE_BLOCK}__category--active` : ""}" type="button" data-outline-category="${category.id}">
      <span class="${OUTLINE_BLOCK}__category-name">${category.name}</span>
      <span class="${OUTLINE_BLOCK}__category-count">${category.itemIds.length}</span>
    </button>
  `;
}

function renderItem(item, isSelected) {
  return `
    <button class="${OUTLINE_BLOCK}__item ${isSelected ? `${OUTLINE_BLOCK}__item--active` : ""}" type="button" data-outline-item="${item.id}">
      <div class="${OUTLINE_BLOCK}__item-title">${item.title}</div>
      <div class="${OUTLINE_BLOCK}__item-subtitle">${item.summary ? item.summary : "Sans synopsis"}</div>
    </button>
  `;
}

export function Outline(project) {
  const categories = project.outline.categories ?? [];
  const selectedCategoryId =
    project.outline.selectedCategoryId ?? categories[0]?.id ?? null;
  const selectedCategory =
    categories.find((c) => c.id === selectedCategoryId) ?? categories[0] ?? null;
  const selectedItemId = project.outline.selectedItemId ?? null;

  const itemsMap = project.outline.items ?? {};
  const items = (selectedCategory?.itemIds ?? [])
    .map((id) => itemsMap[id])
    .filter(Boolean);
  const selectedItem = selectedItemId ? itemsMap[selectedItemId] : null;

  return `
    <section class="${OUTLINE_BLOCK}" data-outline-project="${project.id}">
      <div class="${OUTLINE_BLOCK}__layout">
        <aside class="${OUTLINE_BLOCK}__sidebar">
          <div class="${OUTLINE_BLOCK}__sidebar-header">
            <div class="${OUTLINE_BLOCK}__sidebar-title">Catégories</div>
            <button class="${OUTLINE_BLOCK}__sidebar-action" type="button" data-outline-action="add-category">+ Catégorie</button>
          </div>
          <div class="${OUTLINE_BLOCK}__categories">
            ${categories.map((c) => renderCategory(c, c.id === selectedCategoryId)).join("")}
          </div>
        </aside>

        <div class="${OUTLINE_BLOCK}__main">
          <div class="${OUTLINE_BLOCK}__main-header">
            <div>
              <div class="${OUTLINE_BLOCK}__main-title">${selectedCategory ? selectedCategory.name : "Aucune catégorie"}</div>
              <div class="${OUTLINE_BLOCK}__main-subtitle">Fiches d’esquisse pour ce roman</div>
            </div>
            <div class="${OUTLINE_BLOCK}__main-actions">
              <button class="${OUTLINE_BLOCK}__main-button" type="button" data-outline-action="add-item">+ Fiche</button>
              <button class="${OUTLINE_BLOCK}__main-button" type="button" data-outline-action="rename-category">Renommer</button>
              <button class="${OUTLINE_BLOCK}__main-button ${OUTLINE_BLOCK}__main-button--danger" type="button" data-outline-action="delete-category">Supprimer</button>
            </div>
          </div>

          <div class="${OUTLINE_BLOCK}__content">
            <div class="${OUTLINE_BLOCK}__items">
              ${items.length ? items.map((i) => renderItem(i, i.id === selectedItemId)).join("") : `<div class="${OUTLINE_BLOCK}__empty">Aucune fiche dans cette catégorie.</div>`}
            </div>

            <div class="${OUTLINE_BLOCK}__editor">
              ${
                selectedItem
                  ? `
                    <div class="${OUTLINE_BLOCK}__editor-header">
                      <div class="${OUTLINE_BLOCK}__editor-title">Éditer la fiche</div>
                      <button class="${OUTLINE_BLOCK}__editor-delete" type="button" data-outline-action="delete-item">Supprimer</button>
                    </div>
                    <label class="${OUTLINE_BLOCK}__field">
                      <span class="${OUTLINE_BLOCK}__field-label">Titre</span>
                      <input class="${OUTLINE_BLOCK}__field-input" type="text" value="${selectedItem.title}" data-outline-field="title" />
                    </label>
                    <label class="${OUTLINE_BLOCK}__field">
                      <span class="${OUTLINE_BLOCK}__field-label">Synopsis</span>
                      <textarea class="${OUTLINE_BLOCK}__field-textarea" rows="6" data-outline-field="summary">${selectedItem.summary ?? ""}</textarea>
                    </label>
                    <div class="${OUTLINE_BLOCK}__editor-hint">Les changements sont sauvegardés automatiquement.</div>
                  `
                  : `<div class="${OUTLINE_BLOCK}__editor-empty">Sélectionne une fiche à gauche pour l’éditer.</div>`
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function hydrateOutlineEvents(rootElement) {
  const host = rootElement.querySelector(`.${OUTLINE_BLOCK}[data-outline-project]`);
  if (!host) return;
  const projectId = host.getAttribute("data-outline-project");

  const rerender = () => window.dispatchEvent(new CustomEvent("app:changed"));

  host.querySelectorAll("[data-outline-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const categoryId = btn.getAttribute("data-outline-category");
      updateDb((db) => {
        const project = db.projects[projectId];
        if (!project) return db;
        project.outline.selectedCategoryId = categoryId;
        project.outline.selectedItemId = null;
        project.updatedAt = new Date().toISOString();
        return db;
      });
      rerender();
    });
  });

  host.querySelectorAll("[data-outline-item]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemId = btn.getAttribute("data-outline-item");
      updateDb((db) => {
        const project = db.projects[projectId];
        if (!project) return db;
        project.outline.selectedItemId = itemId;
        project.updatedAt = new Date().toISOString();
        return db;
      });
      rerender();
    });
  });

  host.querySelectorAll("[data-outline-action]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const action = btn.getAttribute("data-outline-action");
      const project = getProject(projectId);
      if (!project) return;
      const categories = project.outline.categories ?? [];
      const selectedCategoryId =
        project.outline.selectedCategoryId ?? categories[0]?.id ?? null;

      if (action === "add-category") {
        const name = await modalPrompt({
          title: "Nouvelle catégorie",
          label: "Nom",
          defaultValue: "Nouvelle catégorie",
          confirmLabel: "Créer",
        });
        if (!name) return;
        updateDb((db) => {
          const p = db.projects[projectId];
          const id = crypto.randomUUID();
          p.outline.categories.push({ id, name: name.trim(), itemIds: [] });
          p.outline.selectedCategoryId = id;
          p.outline.selectedItemId = null;
          p.updatedAt = new Date().toISOString();
          return db;
        });
        rerender();
      }

      if (action === "rename-category" && selectedCategoryId) {
        const current = categories.find((c) => c.id === selectedCategoryId);
        const name = await modalPrompt({
          title: "Renommer la catégorie",
          label: "Nouveau nom",
          defaultValue: current?.name ?? "",
          confirmLabel: "Renommer",
        });
        if (!name) return;
        updateDb((db) => {
          const p = db.projects[projectId];
          const c = p.outline.categories.find((x) => x.id === selectedCategoryId);
          if (c) c.name = name.trim();
          p.updatedAt = new Date().toISOString();
          return db;
        });
        rerender();
      }

      if (action === "delete-category" && selectedCategoryId) {
        const ok = await modalConfirm({
          title: "Supprimer la catégorie",
          message: "Supprimer la catégorie et toutes ses fiches ?",
          confirmLabel: "Supprimer",
          cancelLabel: "Annuler",
          danger: true,
        });
        if (!ok) return;
        updateDb((db) => {
          const p = db.projects[projectId];
          const category = p.outline.categories.find((x) => x.id === selectedCategoryId);
          if (!category) return db;
          category.itemIds.forEach((id) => delete p.outline.items[id]);
          p.outline.categories = p.outline.categories.filter((x) => x.id !== selectedCategoryId);
          p.outline.selectedCategoryId = p.outline.categories[0]?.id ?? null;
          p.outline.selectedItemId = null;
          p.updatedAt = new Date().toISOString();
          return db;
        });
        rerender();
      }

      if (action === "add-item" && selectedCategoryId) {
        const title = await modalPrompt({
          title: "Nouvelle fiche",
          label: "Titre",
          defaultValue: "Nouvelle fiche",
          confirmLabel: "Créer",
        });
        if (!title) return;
        updateDb((db) => {
          const p = db.projects[projectId];
          const itemId = crypto.randomUUID();
          p.outline.items[itemId] = { id: itemId, title: title.trim(), summary: "" };
          const c = p.outline.categories.find((x) => x.id === selectedCategoryId);
          if (c) c.itemIds.unshift(itemId);
          p.outline.selectedItemId = itemId;
          p.updatedAt = new Date().toISOString();
          return db;
        });
        rerender();
      }

      if (action === "delete-item") {
        const itemId = project.outline.selectedItemId;
        if (!itemId) return;
        const ok = await modalConfirm({
          title: "Supprimer la fiche",
          message: "Supprimer cette fiche ?",
          confirmLabel: "Supprimer",
          cancelLabel: "Annuler",
          danger: true,
        });
        if (!ok) return;
        updateDb((db) => {
          const p = db.projects[projectId];
          delete p.outline.items[itemId];
          p.outline.categories.forEach((c) => {
            c.itemIds = c.itemIds.filter((id) => id !== itemId);
          });
          p.outline.selectedItemId = null;
          p.updatedAt = new Date().toISOString();
          return db;
        });
        rerender();
      }
    });
  });

  const titleInput = host.querySelector('[data-outline-field="title"]');
  const summaryTextarea = host.querySelector('[data-outline-field="summary"]');
  const project = getProject(projectId);
  const itemId = project?.outline?.selectedItemId ?? null;
  if (itemId && titleInput) {
    titleInput.addEventListener("input", () => {
      updateDb((db) => {
        const p = db.projects[projectId];
        const item = p.outline.items[itemId];
        if (item) item.title = titleInput.value;
        p.updatedAt = new Date().toISOString();
        return db;
      });
    });
  }
  if (itemId && summaryTextarea) {
    summaryTextarea.addEventListener("input", () => {
      updateDb((db) => {
        const p = db.projects[projectId];
        const item = p.outline.items[itemId];
        if (item) item.summary = summaryTextarea.value;
        p.updatedAt = new Date().toISOString();
        return db;
      });
    });
  }
}

