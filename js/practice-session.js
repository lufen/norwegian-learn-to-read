/**
 * Rounds of up to five tasks. These dots describe participation, never mastery.
 * A detached round or a changed profile cannot record another completion.
 */
window.PracticeSession = (() => {
  let current = null;
  let navigation = 0;
  const epoch = () => window.NorwegianProgress.getEpoch();

  function scope(container) {
    const node = container.firstElementChild;
    const started = epoch();
    const page = container.dataset.page;
    const visit = navigation;
    return () => visit === navigation && page === container.dataset.page &&
      started === epoch() && !!node && !node.hidden && node.isConnected && container.contains(node);
  }

  function begin(activity, container, onContinue, options = {}) {
    const target = Number.isInteger(options.target) ? Math.max(1, Math.min(5, options.target)) : 5;
    const scopeKey = options.scopeKey;
    if (current && current.activity === activity && current.scopeKey === scopeKey &&
        current.target === target && current.active(true)) {
      current.onContinue = onContinue;
      return current;
    }
    const started = epoch();
    const page = container.dataset.page;
    const visit = navigation;
    const completed = new Set();
    const bar = document.createElement("section");
    bar.className = "practice-session word-card";
    bar.setAttribute("aria-label", "Kort økt");
    const session = {
      activity,
      scopeKey,
      target,
      onContinue,
      active: (includeCompleted = false) => current === session && visit === navigation &&
        page === container.dataset.page && epoch() === started && bar.isConnected &&
        container.contains(bar) && (includeCompleted || completed.size < target),
      has: (key) => completed.has(String(key)),
      attach() {
        container.appendChild(bar);
        draw();
      },
      complete(key, feedback) {
        if (!session.active() || completed.size >= target || completed.has(String(key))) return false;
        completed.add(String(key));
        draw();
        if (completed.size === target) {
          if (feedback) bar.prepend(feedback);
          bar.querySelector("h3").focus();
        }
        return true;
      }
    };
    function draw() {
      const done = completed.size === target;
      const tasks = target === 1 ? "1 oppgave" : `${target} oppgaver`;
      if (done) {
        Array.from(container.children).forEach((child) => { if (child !== bar) child.hidden = true; });
      }
      bar.innerHTML = `
        <p role="status" aria-label="${completed.size} av ${tasks}">
          <span aria-hidden="true">${Array.from({ length: target }, (_, i) => i < completed.size ? "●" : "○").join(" ")}</span>
          ${completed.size} / ${target}
        </p>
        ${done ? `<h3 tabindex="-1">Flott øvd! Ta en pause?</h3>
          <p>Du har øvd på ${tasks}. Øving er ikke en prøve.</p>
          ${window.SoundButton.html({ kind: "word", value: "Flott øvd! Vil du ta en pause eller øve mer?", label: "Hør" })}
          <button type="button" class="btn" data-session-continue>Øv mer</button>` : `<p>${tasks}, så en pause.</p>`}
        <button type="button" class="btn btn-outline" data-session-stop>🏠 Ta en pause</button>`;
      bar.querySelector("[data-session-stop]").addEventListener("click", () => {
        if (!session.active(true)) return;
        window.NorwegianAudio.cancel();
        if (window.App) window.App.navigate("home");
      });
      const next = bar.querySelector("[data-session-continue]");
      if (next) next.addEventListener("click", () => {
        if (!session.active(true)) return;
        current = null;
        session.onContinue();
      });
    }
    current = session;
    return session;
  }

  function leave() {
    navigation += 1;
    current = null;
  }

  return { begin, scope, leave, invalidate: leave };
})();
