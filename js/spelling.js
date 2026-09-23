/**
 * Word Spelling module — breaks a word into phonemes/syllables, plays each
 * sound individually, then blends them into the full word.
 */

const SpellingPage = (() => {
  let currentLevelIndex = 1; // default to Level 2 (simple words)
  let currentWordIndex = 0;
  let introSpoken = false;
  let session = null;

  function render(container) {
    session = window.PracticeSession.begin("spelling", container, () => render(container));
    const saved = window.NorwegianProgress.getActivityState("spelling");
    currentLevelIndex = Number.isInteger(saved.levelIndex) ? saved.levelIndex : 1;
    currentWordIndex = Number.isInteger(saved.wordIndex) ? saved.wordIndex : 0;
    const level = window.WORD_LEVELS[currentLevelIndex] || window.WORD_LEVELS[1];
    currentLevelIndex = window.WORD_LEVELS.indexOf(level);
    currentWordIndex = Math.max(0, Math.min(currentWordIndex, level.words.length - 1));
    savePosition();
    container.innerHTML = "";

    const heading = document.createElement("div");
    heading.className = "page-header";
    heading.innerHTML = `
      <h2>Stave Ord — Spell Words</h2>
      <p>Hør lydene. Si dem sammen til et ord.</p>
      ${window.SoundButton.html({ kind: "word", value: "Hør lydene. Si dem sammen til et ord.", label: "Hør oppgaven" })}
    `;
    if (!introSpoken) {
      introSpoken = true;
      window.NorwegianAudio.speak("Hør hver lyd, og sett dem sammen til et ord.");
    }
    container.appendChild(heading);

    const levelPicker = document.createElement("div");
    levelPicker.className = "level-picker";
    window.WORD_LEVELS.forEach((level, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-level" + (idx === currentLevelIndex ? " active" : "");
      btn.textContent = level.name;
      btn.addEventListener("click", () => {
        if (!btn.isConnected || !session.active()) return;
        currentLevelIndex = idx;
        currentWordIndex = 0;
        savePosition();
        render(container);
      });
      levelPicker.appendChild(btn);
    });
    container.appendChild(levelPicker);

    const word = level.words[currentWordIndex];

    const card = document.createElement("div");
    card.className = "word-card";
    card.innerHTML = `
      <div class="word-emoji" aria-hidden="true">${word.emoji || "📝"}</div>
      ${window.Curriculum ? window.Curriculum.newLetterBadge(word.text) : ""}
      <div class="word-syllables" id="word-syllables"></div>
      <p class="word-translation">${word.translation}</p>
      <p class="hint">Lydbitene viser hvilke bokstaver som hører sammen. Uten lærerkontrollerte lydopptak hører du hele ordet. Enhetsstemmen kan si bokstavnavn.</p>
      <div class="detail-actions">
        ${window.SoundButton.html({ kind: "word", value: word.text, label: "Hør ordet" })}
        <button type="button" class="btn btn-secondary" id="mark-word-mastered" ${session.has(word.text) ? "disabled" : ""}>
          ${session.has(word.text) ? "✅ Registrert i denne økten" : "Jeg prøvde å lese ordet"}
        </button>
      </div>
      <div class="nav-buttons">
        <button type="button" class="btn btn-outline" id="prev-word">⟵ Forrige</button>
        <button type="button" class="btn btn-outline" id="next-word">Neste ⟶</button>
      </div>
    `;
    container.appendChild(card);
    session.attach();
    const active = window.PracticeSession.scope(container);

    const syllablesContainer = card.querySelector("#word-syllables");
    const grouped = typeof window.NorwegianAudio.soundUnits === "function";
    const displayParts = grouped ? window.NorwegianAudio.soundUnits(word.text) : Array.from(word.text);
    displayParts.forEach((part) => {
      const text = grouped ? part.text : part;
      if (!String(text).trim()) return;
      syllablesContainer.appendChild(window.SoundButton.create({
        kind: grouped ? "sound-unit" : (String(text).length === 1 ? "letter" : "word"),
        value: grouped ? part.value : text,
        icon: null,
        label: text,
        variant: "bare",
        className: "syllable-chip"
      }));
    });

    card.querySelector("#mark-word-mastered").addEventListener("click", (event) => {
      if (!active() || session.has(word.text)) return;
      event.currentTarget.disabled = true;
      event.currentTarget.textContent = "✅ Du sier at du prøvde å lese.";
      const current = window.NorwegianProgress.getActivityState("spelling");
      window.NorwegianProgress.saveActivityState("spelling", {
        ...current, selfReported: { ...current.selfReported, [word.text]: true }
      });
      session.complete(word.text);
    });
    card.querySelector("#prev-word").addEventListener("click", () => {
      if (!active()) return;
      currentWordIndex = (currentWordIndex - 1 + level.words.length) % level.words.length;
      savePosition();
      render(container);
    });
    card.querySelector("#next-word").addEventListener("click", () => {
      if (!active()) return;
      currentWordIndex = (currentWordIndex + 1) % level.words.length;
      savePosition();
      render(container);
    });
  }

  function savePosition() {
    window.NorwegianProgress.saveActivityState("spelling", {
      ...window.NorwegianProgress.getActivityState("spelling"),
      levelIndex: currentLevelIndex,
      wordIndex: currentWordIndex
    });
  }

  return { render };
})();

if (typeof window !== "undefined") {
  window.SpellingPage = SpellingPage;
}
