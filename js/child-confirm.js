/**
 * Child-safe confirmation overlay — replaces browser confirm() dialogs for
 * destructive actions (e.g. resetting progress). A pre-reading 5-year-old
 * can't judge a text-only browser popup, might tap it by accident, and two
 * children could share one browser profile. This shows a big, icon-led,
 * spoken overlay where "keep everything" is the large default action and
 * the destructive action requires a deliberate second tap.
 */

const ChildConfirm = (() => {
  function show({ message, spokenMessage, confirmLabel, cancelLabel, onConfirm }) {
    const existing = document.getElementById("child-confirm-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "child-confirm-overlay";
    overlay.className = "child-confirm-overlay";
    overlay.setAttribute("role", "alertdialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `
      <div class="child-confirm-card">
        <div class="child-confirm-icon" aria-hidden="true">🗑️</div>
        <p class="child-confirm-message">${message}</p>
        <div class="child-confirm-actions">
          <button type="button" class="btn child-confirm-cancel">↩️ ${cancelLabel || "No, keep it"}</button>
          <button type="button" class="btn btn-outline child-confirm-confirm">${confirmLabel || "Yes, reset"}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    if (window.NorwegianAudio && spokenMessage) {
      window.NorwegianAudio.speak(spokenMessage);
    }

    function close() {
      overlay.remove();
    }

    overlay.querySelector(".child-confirm-cancel").addEventListener("click", close);
    overlay.querySelector(".child-confirm-confirm").addEventListener("click", () => {
      close();
      onConfirm();
    });
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });
  }

  return { show };
})();

if (typeof window !== "undefined") {
  window.ChildConfirm = ChildConfirm;
}
