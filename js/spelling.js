/**
 * Word Spelling — visual spelling groups, with reviewed unit audio when
 * available and clearly labelled whole-word replay otherwise.
 */

const SpellingPage = (() => {
  let currentLevelIndex = 1; // default to Level 2 (simple words)
  let currentWordIndex = 0;
  let introSpoken = false;
  let session = null;

  function render(container) {
    const saved = window.NorwegianProgress.getActivityState("spelling");
    currentLevelIndex = Number.isInteger(saved.levelIndex) ? saved.levelIndex : 1;
    currentWordIndex = Number.isInteger(saved.wordIndex) ? saved.wordIndex : 0;
    const level = window.WORD_LEVELS[currentLevelIndex] || window.WORD_LEVELS[1];
    currentLevelIndex = window.WORD_LEVELS.indexOf(level);
    currentWordIndex = Math.max(0, Math.min(currentWordIndex, level.words.length - 1));
    session = window.PracticeSession.begin("spelling", container, () => render(container), {
      scopeKey: currentLevelIndex,
      target: Math.min(5, new Set(level.words.map((word) => word.text)).size)
    });
    savePosition();
    container.innerHTML = "";

    const word = level.words[currentWordIndex];
    const canSoundOut = window.NorwegianAudio.canSoundOut(word.text);
    const instruction = canSoundOut
      ? "Hør lydene. Si dem sammen til et ord."
      : "Se på bokstavgruppene. Hør hele ordet, og prøv å lese det.";
    const heading = document.createElement("div");
    heading.className = "page-header";
    heading.innerHTML = `
      <h2>Stave Ord — Spell Words</h2>
      <p>${instruction}</p>
      ${window.SoundButton.html({ kind: "word", value: instruction, label: "Hør oppgaven" })}
    `;
    if (!introSpoken) {
      introSpoken = true;
      window.NorwegianAudio.speak(instruction);
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
        window.NorwegianAudio.cancel();
        currentLevelIndex = idx;
        currentWordIndex = 0;
        savePosition();
        render(container);
      });
      levelPicker.appendChild(btn);
    });
    container.appendChild(levelPicker);

    const card = document.createElement("div");
    card.className = "word-card";
    card.innerHTML = `
      <div class="word-emoji" aria-hidden="true">${word.emoji || "📝"}</div>
      ${window.Curriculum ? window.Curriculum.newLetterBadge(word.text) : ""}
      <div class="word-syllables" id="word-syllables"></div>
      <p class="word-translation">${word.translation}</p>
      <p class="hint">${canSoundOut
        ? "Trykk på en bokstavgruppe for å høre den innspilte lyden i ordet."
        : "Bokstavgruppene er visuell hjelp, ikke lydknapper. Uten lærerkontrollerte opptak av hver lyd hører du hele ordet. Enhetsstemmen er en tilnærming."}</p>
      <div class="detail-actions">
        ${window.SoundButton.html({ kind: "word", value: word.text, label: "Hør ordet" })}
        ${window.SoundButton.html({ kind: "sound-out", value: word.text, label: canSoundOut ? "Hør lydene og ordet" : "Hør hele ordet sakte", variant: "secondary" })}
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
    const displayParts = window.NorwegianAudio.soundUnits(word.text);
    displayParts.forEach((part) => {
      const text = part.text;
      if (!String(text).trim()) return;
      if (!canSoundOut) {
        const group = document.createElement("span");
        group.className = "build-slot";
        group.textContent = text;
        syllablesContainer.appendChild(group);
        return;
      }
      syllablesContainer.appendChild(window.SoundButton.create({
        kind: "sound-unit",
        value: part.value,
        icon: null,
        label: text,
        variant: "bare",
        className: "syllable-chip",
        ariaLabel: `Hør ${text} i ${word.text}`
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
