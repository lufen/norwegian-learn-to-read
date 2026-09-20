/**
 * Word Spelling module — breaks a word into phonemes/syllables, plays each
 * sound individually, then blends them into the full word.
 */

const SpellingPage = (() => {
  let currentLevelIndex = 1; // default to Level 2 (short words)
  let currentWordIndex = 0;

  function render(container) {
    container.innerHTML = "";

    const heading = document.createElement("div");
    heading.className = "page-header";
    heading.innerHTML = `
      <h2>Stave Ord — Spell Words</h2>
      <p>Listen to each part of the word, then blend them together.</p>
    `;
    container.appendChild(heading);

    const levelPicker = document.createElement("div");
    levelPicker.className = "level-picker";
    window.WORD_LEVELS.forEach((level, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-level" + (idx === currentLevelIndex ? " active" : "");
      btn.textContent = level.name;
      btn.addEventListener("click", () => {
        currentLevelIndex = idx;
        currentWordIndex = 0;
        render(container);
      });
      levelPicker.appendChild(btn);
    });
    container.appendChild(levelPicker);

    const level = window.WORD_LEVELS[currentLevelIndex];
    const word = level.words[currentWordIndex];

    const card = document.createElement("div");
    card.className = "word-card";
    card.innerHTML = `
      <div class="word-emoji" aria-hidden="true">${word.emoji || "📝"}</div>
      <div class="word-syllables" id="word-syllables"></div>
      <p class="word-translation">${word.translation}</p>
      <div class="detail-actions">
        <button type="button" class="btn" id="blend-word">🔊 Play whole word</button>
        <button type="button" class="btn btn-secondary" id="mark-word-mastered">
          ${window.NorwegianProgress.isWordMastered(word.text) ? "✅ Mastered" : "☆ Mark as mastered"}
        </button>
      </div>
      <div class="nav-buttons">
        <button type="button" class="btn btn-outline" id="prev-word">⟵ Previous</button>
        <button type="button" class="btn btn-outline" id="next-word">Next ⟶</button>
      </div>
    `;
    container.appendChild(card);

    const syllablesContainer = card.querySelector("#word-syllables");
    word.syllables.forEach((part) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "syllable-chip";
      chip.textContent = part;
      chip.addEventListener("click", () => window.NorwegianAudio.speak(part));
      syllablesContainer.appendChild(chip);
    });

    card.querySelector("#blend-word").addEventListener("click", () => {
      window.NorwegianAudio.speak(word.text);
    });
    card.querySelector("#mark-word-mastered").addEventListener("click", () => {
      window.NorwegianProgress.markWordMastered(word.text);
      render(container);
    });
    card.querySelector("#prev-word").addEventListener("click", () => {
      currentWordIndex = (currentWordIndex - 1 + level.words.length) % level.words.length;
      render(container);
    });
    card.querySelector("#next-word").addEventListener("click", () => {
      currentWordIndex = (currentWordIndex + 1) % level.words.length;
      render(container);
    });
  }

  return { render };
})();

if (typeof window !== "undefined") {
  window.SpellingPage = SpellingPage;
}
