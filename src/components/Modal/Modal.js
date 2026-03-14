const MODAL_BLOCK = "modal";

function ensureModalRoot() {
  let root = document.getElementById("modal-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "modal-root";
    document.body.appendChild(root);
  }
  return root;
}

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderModal({ title, bodyHtml, confirmLabel, cancelLabel, isDanger }) {
  return `
    <div class="${MODAL_BLOCK}__backdrop" data-modal-backdrop="true">
      <div class="${MODAL_BLOCK}__dialog" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <header class="${MODAL_BLOCK}__header">
          <div class="${MODAL_BLOCK}__title">${escapeHtml(title)}</div>
          <button class="${MODAL_BLOCK}__close" type="button" data-modal-cancel="true" aria-label="Fermer">×</button>
        </header>
        <div class="${MODAL_BLOCK}__body">
          ${bodyHtml}
        </div>
        <footer class="${MODAL_BLOCK}__footer">
          <button class="${MODAL_BLOCK}__button" type="button" data-modal-cancel="true">${escapeHtml(cancelLabel)}</button>
          <button class="${MODAL_BLOCK}__button ${isDanger ? `${MODAL_BLOCK}__button--danger` : `${MODAL_BLOCK}__button--primary`}" type="button" data-modal-confirm="true">
            ${escapeHtml(confirmLabel)}
          </button>
        </footer>
      </div>
    </div>
  `;
}

function attachCommonHandlers({ root, onConfirm, onCancel }) {
  const backdrop = root.querySelector("[data-modal-backdrop='true']");
  const cancelButtons = root.querySelectorAll("[data-modal-cancel='true']");
  const confirmButton = root.querySelector("[data-modal-confirm='true']");

  const onKeyDown = (ev) => {
    if (ev.key === "Escape") onCancel();
    if (ev.key === "Enter" && (ev.metaKey || ev.ctrlKey)) onConfirm();
  };

  if (backdrop) {
    backdrop.addEventListener("click", (ev) => {
      if (ev.target === backdrop) onCancel();
    });
  }
  cancelButtons.forEach((btn) => btn.addEventListener("click", onCancel));
  if (confirmButton) confirmButton.addEventListener("click", onConfirm);
  document.addEventListener("keydown", onKeyDown);

  return () => document.removeEventListener("keydown", onKeyDown);
}

export function modalConfirm({
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  danger = false,
}) {
  const root = ensureModalRoot();
  root.innerHTML = renderModal({
    title,
    bodyHtml: `<p class="${MODAL_BLOCK}__text">${escapeHtml(message)}</p>`,
    confirmLabel,
    cancelLabel,
    isDanger: danger,
  });

  return new Promise((resolve) => {
    const cleanup = attachCommonHandlers({
      root,
      onConfirm: () => {
        root.innerHTML = "";
        cleanup();
        resolve(true);
      },
      onCancel: () => {
        root.innerHTML = "";
        cleanup();
        resolve(false);
      },
    });
  });
}

export function modalAlert({ title, message, confirmLabel = "OK" }) {
  return modalConfirm({
    title,
    message,
    confirmLabel,
    cancelLabel: "",
    danger: false,
  });
}

export function modalPrompt({
  title,
  label,
  defaultValue = "",
  placeholder = "",
  confirmLabel = "Valider",
  cancelLabel = "Annuler",
}) {
  const root = ensureModalRoot();
  const inputId = `modal-input-${crypto.randomUUID()}`;

  root.innerHTML = renderModal({
    title,
    bodyHtml: `
      <label class="${MODAL_BLOCK}__field" for="${inputId}">
        <span class="${MODAL_BLOCK}__field-label">${escapeHtml(label)}</span>
        <input class="${MODAL_BLOCK}__field-input" id="${inputId}" type="text" value="${escapeHtml(defaultValue)}" placeholder="${escapeHtml(placeholder)}" />
      </label>
      <div class="${MODAL_BLOCK}__hint">Astuce : Ctrl+Entrée pour valider.</div>
    `,
    confirmLabel,
    cancelLabel,
    isDanger: false,
  });

  const input = root.querySelector(`#${CSS.escape(inputId)}`);
  if (input) {
    setTimeout(() => {
      input.focus();
      input.select?.();
    }, 0);
  }

  return new Promise((resolve) => {
    const cleanup = attachCommonHandlers({
      root,
      onConfirm: () => {
        const value = input ? input.value : "";
        root.innerHTML = "";
        cleanup();
        resolve(value);
      },
      onCancel: () => {
        root.innerHTML = "";
        cleanup();
        resolve(null);
      },
    });
  });
}

