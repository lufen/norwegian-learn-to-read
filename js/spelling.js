/**
 * Word Spelling module — breaks a word into phonemes/syllables, plays each
 * sound individually, then blends them into the full word.
 */

const SpellingPage = (() => {
  let currentLevelIndex = 1; // default to Level 2 (simple words)
  let currentWordIndex = 0;
  let introSpoken = false;

  function render(container) {
    const saved = window.NorwegianProgress.getActivityState("spelling");
    currentLevelIndex = Number.isInteger(saved.levelIndex) ? saved.levelIndex : currentLevelIndex;
    currentWordIndex = Number.isInteger(saved.wordIndex) ? saved.wordIndex : currentWordIndex;
    const level = window.WORD_LEVELS[currentLevelIndex] || window.WORD_LEVELS[1];
    currentLevelIndex = window.WORD_LEVELS.indexOf(level);
    currentWordIndex = Math.max(0, Math.min(currentWordIndex, level.words.length - 1));
    savePosition();
    container.innerHTML = "";

    const heading = document.createElement("div");
    heading.className = "page-header";
    heading.innerHTML = `
      <h2>Stave Ord — Spell Words</h2>
      <p>Listen to each part of the word, then blend them together.</p>
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
      <div class="detail-actions">
        <button type="button" class="btn" id="blend-word">🔊 Play whole word</button>
        <button type="button" class="btn btn-secondary" id="mark-word-mastered">
          ${window.NorwegianProgress.isWordMastered(word.text) ? "✅ I can read it" : "☆ I can read this word"}
        </button>
      </div>
      <div class="nav-buttons">
        <button type="button" class="btn btn-outline" id="prev-word">⟵ Previous</button>
        <button type="button" class="btn btn-outline" id="next-word">Next ⟶</button>
      </div>
    `;
    container.appendChild(card);
    if (window.Curriculum) window.Curriculum.bindBadgeAudio(card);

    const syllablesContainer = card.querySelector("#word-syllables");
    const displayParts = word.text.includes(" ")
      ? word.syllables
      : Array.from(word.text);
    displayParts.forEach((part) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "syllable-chip";
      chip.textContent = part;
      // A chip plays the sound the child should make, never the IPA symbol
      // from the dataset — single letters go through the shared letter-sound
      // helper so they match Letters & Sounds and Letter Journey exactly.
      const isSingleLetter = String(part).length === 1;
      chip.setAttribute("aria-label", `Play the sound of ${part}`);
      chip.addEventListener("click", () => {
        if (isSingleLetter) {
          window.NorwegianAudio.speakLetter(part);
        } else {
          window.NorwegianAudio.speak(part);
        }
      });
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
      savePosition();
      render(container);
    });
    card.querySelector("#next-word").addEventListener("click", () => {
      currentWordIndex = (currentWordIndex + 1) % level.words.length;
      savePosition();
      render(container);
    });
  }

  function savePosition() {
    window.NorwegianProgress.saveActivityState("spelling", {
      levelIndex: currentLevelIndex,
      wordIndex: currentWordIndex
    });
  }

  return { render };
})();

if (typeof window !== "undefined") {
  window.SpellingPage = SpellingPage;
}
