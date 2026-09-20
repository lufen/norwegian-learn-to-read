/**
 * Alphabet & Sounds module — grid of Norwegian letters that play their sound
 * and show example words when clicked.
 */

const AlphabetPage = (() => {
  function render(container) {
    container.innerHTML = "";

    const heading = document.createElement("div");
    heading.className = "page-header";
    heading.innerHTML = `
      <h2>Bokstaver &amp; Lyder — Letters &amp; Sounds</h2>
      <p>Click a letter to hear how it sounds. Mark it as mastered once you know it well.</p>
    `;
    container.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "letter-grid";
    grid.setAttribute("role", "list");

    window.NORWEGIAN_LETTERS.forEach((entry) => {
      const tile = document.createElement("button");
      tile.className = "letter-tile";
      tile.type = "button";
      tile.setAttribute("role", "listitem");
      tile.setAttribute("aria-label", `Letter ${entry.letter}`);
      if (window.NorwegianProgress.isLetterMastered(entry.letter)) {
        tile.classList.add("mastered");
      }
      tile.innerHTML = `<span class="letter-tile-char">${entry.letter}</span>`;
      tile.addEventListener("click", () => selectLetter(entry, tile, container));
      grid.appendChild(tile);
    });

    container.appendChild(grid);

    const detail = document.createElement("div");
    detail.className = "letter-detail";
    detail.id = "letter-detail";
    detail.setAttribute("aria-live", "polite");
    detail.innerHTML = `<p class="hint">Select a letter above to begin.</p>`;
    container.appendChild(detail);
  }

  function selectLetter(entry, tile, container) {
    window.NorwegianAudio.speak(entry.letter);

    const detail = container.querySelector("#letter-detail");
    detail.innerHTML = `
      <h3>${entry.letter} <span class="sound-hint">(sounds like "${entry.sound}")</span></h3>
      <div class="detail-actions">
        <button type="button" class="btn" id="replay-letter">🔊 Play sound</button>
        <button type="button" class="btn btn-secondary" id="mark-mastered">
          ${window.NorwegianProgress.isLetterMastered(entry.letter) ? "✅ Mastered" : "☆ Mark as mastered"}
        </button>
      </div>
      <h4>Example words</h4>
      <ul class="example-list">
        ${entry.examples.map((ex) => `<li>${ex}</li>`).join("")}
      </ul>
    `;

    detail.querySelector("#replay-letter").addEventListener("click", () => {
      window.NorwegianAudio.speak(entry.letter);
    });
    detail.querySelector("#mark-mastered").addEventListener("click", () => {
      window.NorwegianProgress.markLetterMastered(entry.letter);
      tile.classList.add("mastered");
      selectLetter(entry, tile, container);
    });
  }

  return { render };
})();

if (typeof window !== "undefined") {
  window.AlphabetPage = AlphabetPage;
}
