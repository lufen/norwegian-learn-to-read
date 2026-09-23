/**
 * Alphabet & Sounds module — grid of Norwegian letters that play their sound
 * and show example words when clicked.
 */

const AlphabetPage = (() => {
  let introSpoken = false;
  let session = null;

  function render(container) {
    session = window.PracticeSession.begin("alphabet", container, () => render(container));
    container.innerHTML = "";

    const heading = document.createElement("div");
    heading.className = "page-header";
    heading.innerHTML = `
      <h2>Bokstaver &amp; Lyder — Letters &amp; Sounds</h2>
      <p>Velg en bokstav. Hør lyden og si den selv.</p>
      ${window.SoundButton.html({ kind: "word", value: "Velg en bokstav. Hør lyden og si den selv.", label: "Hør oppgaven" })}
    `;
    container.appendChild(heading);

    if (!introSpoken) {
      introSpoken = true;
      window.NorwegianAudio.speak("Trykk på en bokstav for å høre lyden.");
    }

    const grid = document.createElement("div");
    grid.className = "letter-grid";
    grid.setAttribute("role", "list");

    window.NORWEGIAN_LETTERS.forEach((entry) => {
      const tile = document.createElement("button");
      tile.className = "letter-tile";
      tile.type = "button";
      tile.setAttribute("role", "listitem");
      tile.setAttribute("aria-label", `Letter ${entry.letter}`);
      if (session.has(entry.letter)) {
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
    detail.innerHTML = `<p class="hint">Velg en bokstav.</p>`;
    container.appendChild(detail);
    session.attach();
  }

  function selectLetter(entry, tile, container) {
    if (!session.active() || !tile.isConnected) return;
    window.SoundButton.play("letter", entry.letter);

    const detail = container.querySelector("#letter-detail");
    detail.innerHTML = `
      <h3>${entry.letter} <span class="sound-hint">(${entry.phoneme || entry.sound})</span></h3>
      <div class="detail-actions">
        ${window.SoundButton.html({ kind: "letter", value: entry.letter, label: "Hør lyden" })}
        <button type="button" class="btn btn-secondary" id="mark-practiced" ${session.has(entry.letter) ? "disabled" : ""}>
          ${session.has(entry.letter) ? "✅ Øvd i denne økten" : "Jeg har øvd på lyden"}
        </button>
      </div>
      <h4>Ord med bokstaven</h4>
      <ul class="example-list">
        ${entry.examples.map((ex) => `<li>${ex}</li>`).join("")}
      </ul>
    `;

    detail.querySelector("#mark-practiced").addEventListener("click", (event) => {
      if (!session.active() || session.has(entry.letter)) return;
      event.currentTarget.disabled = true;
      event.currentTarget.textContent = "✅ Øvd i denne økten";
      const saved = window.NorwegianProgress.getActivityState("alphabet");
      window.NorwegianProgress.saveActivityState("alphabet", {
        ...saved, practiced: { ...saved.practiced, [entry.letter]: true }
      });
      tile.classList.add("mastered");
      session.complete(entry.letter);
    });
  }

  return { render };
})();

if (typeof window !== "undefined") {
  window.AlphabetPage = AlphabetPage;
}
