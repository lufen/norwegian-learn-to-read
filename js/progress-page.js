/**
 * Progress summary page.
 */

const ProgressPage = (() => {
  function render(container) {
    container.innerHTML = "";

    const summary = window.NorwegianProgress.getSummary();
    const totalLetters = window.NORWEGIAN_LETTERS.length;
    const totalWords = window.WORD_LEVELS.slice(1).reduce((sum, l) => sum + l.words.length, 0);

    const heading = document.createElement("div");
    heading.className = "page-header";
    heading.innerHTML = `
      <h2>Min Fremgang — My Progress</h2>
      <p>Keep practicing to master more letters and words!</p>
    `;
    container.appendChild(heading);

    const stats = document.createElement("div");
    stats.className = "progress-stats";
    stats.innerHTML = `
      <div class="progress-card">
        <div class="progress-number">${summary.letterCount} / ${totalLetters}</div>
        <div class="progress-label">Letters mastered</div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${(summary.letterCount / totalLetters) * 100}%"></div></div>
      </div>
      <div class="progress-card">
        <div class="progress-number">${summary.wordCount} / ${totalWords}</div>
        <div class="progress-label">Words mastered</div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${(summary.wordCount / totalWords) * 100}%"></div></div>
      </div>
    `;
    container.appendChild(stats);

    const resetWrap = document.createElement("div");
    resetWrap.className = "detail-actions";
    resetWrap.innerHTML = `<button type="button" class="btn btn-outline" id="reset-progress">Reset progress</button>`;
    container.appendChild(resetWrap);

    resetWrap.querySelector("#reset-progress").addEventListener("click", () => {
      if (window.confirm("Reset all progress? This cannot be undone.")) {
        window.NorwegianProgress.reset();
        render(container);
      }
    });
  }

  return { render };
})();

if (typeof window !== "undefined") {
  window.ProgressPage = ProgressPage;
}
