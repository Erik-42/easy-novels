import { computeProjectWordCount, getProject, updateDb } from "../../services/db.js";

const SCHEDULE_BLOCK = "schedule";

function daysBetween(start, end) {
  const ms = end.getTime() - start.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function Schedule(project) {
  const goalWords = project.schedule.goalWords ?? 50000;
  const dueDate = project.schedule.dueDate;
  const totalWords = computeProjectWordCount(project);
  const remaining = Math.max(0, goalWords - totalWords);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = dueDate ? new Date(dueDate) : null;
  const daysLeft = due ? Math.max(0, daysBetween(today, due)) : null;
  const perDay = daysLeft && daysLeft > 0 ? Math.ceil(remaining / daysLeft) : null;

  return `
    <section class="${SCHEDULE_BLOCK}" data-schedule-project="${project.id}">
      <div class="${SCHEDULE_BLOCK}__grid">
        <div class="${SCHEDULE_BLOCK}__panel">
          <div class="${SCHEDULE_BLOCK}__title">Objectif</div>
          <div class="${SCHEDULE_BLOCK}__text">
            Définis un objectif de mots et une échéance. Le quota quotidien est calculé
            à partir du total de mots des scènes.
          </div>

          <label class="${SCHEDULE_BLOCK}__field">
            <span class="${SCHEDULE_BLOCK}__field-label">Objectif de mots</span>
            <input class="${SCHEDULE_BLOCK}__field-input" type="number" min="0" step="100" value="${goalWords}" data-schedule-field="goalWords" />
          </label>

          <label class="${SCHEDULE_BLOCK}__field">
            <span class="${SCHEDULE_BLOCK}__field-label">Échéance</span>
            <input class="${SCHEDULE_BLOCK}__field-input" type="date" value="${dueDate ?? ""}" data-schedule-field="dueDate" />
          </label>

          <button class="${SCHEDULE_BLOCK}__button" type="button" data-schedule-action="clear-date">Retirer l’échéance</button>
        </div>

        <div class="${SCHEDULE_BLOCK}__panel ${SCHEDULE_BLOCK}__panel--stats">
          <div class="${SCHEDULE_BLOCK}__title">Progression</div>
          <div class="${SCHEDULE_BLOCK}__stats">
            <div class="${SCHEDULE_BLOCK}__stat">
              <div class="${SCHEDULE_BLOCK}__stat-label">Total</div>
              <div class="${SCHEDULE_BLOCK}__stat-value">${totalWords.toLocaleString("fr-FR")} mots</div>
            </div>
            <div class="${SCHEDULE_BLOCK}__stat">
              <div class="${SCHEDULE_BLOCK}__stat-label">Restant</div>
              <div class="${SCHEDULE_BLOCK}__stat-value">${remaining.toLocaleString("fr-FR")} mots</div>
            </div>
            <div class="${SCHEDULE_BLOCK}__stat">
              <div class="${SCHEDULE_BLOCK}__stat-label">Jours restants</div>
              <div class="${SCHEDULE_BLOCK}__stat-value">${daysLeft === null ? "—" : daysLeft}</div>
            </div>
            <div class="${SCHEDULE_BLOCK}__stat">
              <div class="${SCHEDULE_BLOCK}__stat-label">Quota / jour</div>
              <div class="${SCHEDULE_BLOCK}__stat-value">${perDay === null ? "—" : `${perDay.toLocaleString("fr-FR")} mots`}</div>
            </div>
          </div>
          <div class="${SCHEDULE_BLOCK}__hint">
            Astuce : écris dans “Écrire” pour faire monter automatiquement le total de mots.
          </div>
        </div>
      </div>
    </section>
  `;
}

export function hydrateScheduleEvents(rootElement) {
  const host = rootElement.querySelector(`.${SCHEDULE_BLOCK}[data-schedule-project]`);
  if (!host) return;
  const projectId = host.getAttribute("data-schedule-project");

  const rerender = () => window.dispatchEvent(new CustomEvent("app:changed"));

  const goalInput = host.querySelector('[data-schedule-field="goalWords"]');
  const dueInput = host.querySelector('[data-schedule-field="dueDate"]');

  if (goalInput) {
    goalInput.addEventListener("input", () => {
      const val = Number(goalInput.value);
      updateDb((db) => {
        const p = db.projects[projectId];
        if (!p) return db;
        p.schedule.goalWords = Number.isFinite(val) ? Math.max(0, Math.floor(val)) : p.schedule.goalWords;
        p.updatedAt = new Date().toISOString();
        return db;
      });
      rerender();
    });
  }

  if (dueInput) {
    dueInput.addEventListener("change", () => {
      updateDb((db) => {
        const p = db.projects[projectId];
        if (!p) return db;
        p.schedule.dueDate = dueInput.value ? dueInput.value : null;
        p.updatedAt = new Date().toISOString();
        return db;
      });
      rerender();
    });
  }

  host.querySelectorAll("[data-schedule-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-schedule-action");
      if (action === "clear-date") {
        updateDb((db) => {
          const p = db.projects[projectId];
          if (!p) return db;
          p.schedule.dueDate = null;
          p.updatedAt = new Date().toISOString();
          return db;
        });
        rerender();
      }
    });
  });
}

