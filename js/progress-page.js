/**
 * Progress summary page.
 */

const ProgressPage = (() => {
  let introSpoken = false;

  function render(container) {
    container.innerHTML = "";

    const summary = window.NorwegianProgress.getSummary();
    const totalLetters = window.NORWEGIAN_LETTERS.length;
    const totalWords = window.WORD_LEVELS.slice(1).reduce((sum, l) => sum + l.words.length, 0);
    const journeyMasteredCount = window.NorwegianProgress.getJourneyMasteredLetters(3).length;

    const heading = document.createElement("div");
    heading.className = "page-header";
    heading.innerHTML = `
      <h2>Min Fremgang — My Progress</h2>
      <p>Keep practicing to learn more letters and words!</p>
    `;
    container.appendChild(heading);

    if (!introSpoken) {
      introSpoken = true;
      window.NorwegianAudio.speak("Se hvor mange bokstaver og ord du har lært.");
    }

    const stats = document.createElement("div");
    stats.className = "progress-stats";
    stats.innerHTML = `
      <div class="progress-card">
        <div class="progress-number">${journeyMasteredCount} / ${totalLetters}</div>
        <div class="progress-label">Letters mastered in Letter Journey</div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${(journeyMasteredCount / totalLetters) * 100}%"></div></div>
      </div>
      <div class="progress-card">
        <div class="progress-number">${summary.letterCount} / ${totalLetters}</div>
        <div class="progress-label">Letters you say you know</div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${(summary.letterCount / totalLetters) * 100}%"></div></div>
      </div>
      <div class="progress-card">
        <div class="progress-number">${summary.wordCount} / ${totalWords}</div>
        <div class="progress-label">Words you've read or spelled</div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${(summary.wordCount / totalWords) * 100}%"></div></div>
      </div>
    `;
    container.appendChild(stats);

    const resetWrap = document.createElement("div");
    resetWrap.className = "detail-actions";
    resetWrap.innerHTML = `<button type="button" class="btn btn-outline" id="reset-progress">Reset progress</button>`;
    container.appendChild(resetWrap);

    resetWrap.querySelector("#reset-progress").addEventListener("click", () => {
      window.ChildConfirm.show({
        message: "Reset everything? All your stars will disappear.",
        spokenMessage: "Are you sure you want to reset everything? All your stars will disappear.",
        confirmLabel: "🗑️ Yes, reset everything",
        cancelLabel: "↩️ No, keep my progress",
        onConfirm: () => {
          window.NorwegianProgress.reset();
          render(container);
        }
      });
    });
  }

  return { render };
})();

if (typeof window !== "undefined") {
  window.ProgressPage = ProgressPage;
}
