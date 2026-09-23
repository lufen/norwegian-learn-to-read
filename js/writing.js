/**
 * Write Words — build-the-word dictation activity.
 *
 * Previously this required typing on a physical keyboard, which conflicted
 * with the rest of the app (tap/click or paper-based) and isn't realistic
 * for a 5-year-old without reliable keyboard skills. Now the child hears a
 * word and taps letter tiles, in order, into empty slots — no typing, no
 * keyboard needed. A wrong tile is rejected immediately (with a nudge to
 * try again) rather than being placed and shown wrong afterward, and a
 * space in a phrase is filled in automatically since it isn't a sound the
 * child places themselves.
 */

const WritingPage = (() => {
  let currentLevelIndex = 1;
  let currentWordIndex = 0;
  let slots = [];
  let bank = [];
  let solved = false;
  let wrongAttemptsOnSlot = 0;
  let introSpoken = false;
  let session = null;
  let usedHelp = false;

  function render(container) {
    session = window.PracticeSession.begin("writing", container, () => render(container));
    const saved = window.NorwegianProgress.getActivityState("writing");
    currentLevelIndex = Number.isInteger(saved.levelIndex) ? saved.levelIndex : 1;
    currentWordIndex = Number.isInteger(saved.wordIndex) ? saved.wordIndex : 0;
    const level = window.WORD_LEVELS[currentLevelIndex] || window.WORD_LEVELS[1];
    currentLevelIndex = window.WORD_LEVELS.indexOf(level);
    currentWordIndex = Math.max(0, Math.min(currentWordIndex, level.words.length - 1));
    savePosition();

    const word = level.words[currentWordIndex];
    usedHelp = false;
    setupAttempt(word);
    const state = window.NorwegianProgress.getActivityState("writing");
    window.NorwegianProgress.saveActivityState("writing", {
      ...state, practiced: { ...state.practiced, [word.text]: true }
    });

    container.innerHTML = "";

    const heading = document.createElement("div");
    heading.className = "page-header";
    heading.innerHTML = `
      <h2>Skriv Ord — Write Words</h2>
      <p>Hør ordet. Trykk på bokstavene i riktig rekkefølge.</p>
      ${window.SoundButton.html({ kind: "word", value: "Hør ordet. Trykk på bokstavene i riktig rekkefølge.", label: "Hør oppgaven" })}
    `;
    container.appendChild(heading);

    const levelPicker = document.createElement("div");
    levelPicker.className = "level-picker";
    window.WORD_LEVELS.forEach((lvl, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-level" + (idx === currentLevelIndex ? " active" : "");
      btn.textContent = lvl.name;
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

    const card = document.createElement("div");
    card.className = "word-card";
    card.innerHTML = `
      <div class="word-emoji" aria-hidden="true">${word.emoji || "📝"}</div>
      ${window.Curriculum ? window.Curriculum.newLetterBadge(word.text) : ""}
      <div class="detail-actions">
        ${window.SoundButton.html({ kind: "word", value: word.text, label: "Hør ordet" })}
        ${window.SoundButton.html({ kind: "word", value: word.text, label: "Hør sakte", icon: "🐢", variant: "secondary", rate: 0.6, id: "build-slow", ariaLabel: `Hør ${word.text} sakte` })}
      </div>
      <div class="build-slots" id="build-slots" aria-live="polite"></div>
      <div class="build-bank" id="build-bank"></div>
      <div class="detail-actions">
        <button type="button" class="btn btn-outline" id="clear-attempt">🔄 Prøv igjen</button>
      </div>
      <div class="feedback" id="feedback" aria-live="polite"></div>
      <div class="nav-buttons">
        <button type="button" class="btn btn-outline" id="prev-word">⟵ Forrige</button>
        <button type="button" class="btn btn-outline" id="next-word">Neste ⟶</button>
      </div>
    `;
    container.appendChild(card);
    session.attach();
    const active = window.PracticeSession.scope(container);

    card.querySelector("#build-slow").addEventListener("click", () => {
      if (active() && !solved) usedHelp = true;
    });
    card.querySelector("#clear-attempt").addEventListener("click", () => {
      if (!active() || solved) return;
      setupAttempt(word);
      renderSlotsAndBank(card, word);
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

    renderSlotsAndBank(card, word);

    if (!introSpoken) {
      introSpoken = true;
      window.NorwegianAudio.speak("Hør ordet, og trykk bokstavene i riktig rekkefølge.");
    }
  }

  function savePosition() {
    window.NorwegianProgress.saveActivityState("writing", {
      ...window.NorwegianProgress.getActivityState("writing"),
      levelIndex: currentLevelIndex,
      wordIndex: currentWordIndex
    });
  }

  /** Build the empty-slot layout (spaces auto-filled) and a shuffled tile bank. */
  function setupAttempt(word) {
    solved = false;
    wrongAttemptsOnSlot = 0;
    const chars = word.text.split("");
    slots = chars.map((ch) => (ch === " " ? { char: " ", filled: true, space: true } : { char: ch, filled: false }));

    const neededLetters = chars.filter((ch) => ch !== " ");
    const distractorPool = (window.NORWEGIAN_LETTERS || [])
      .map((entry) => entry.letter.toLowerCase())
      .filter((letter) => !neededLetters.includes(letter));
    const distractors = shuffle(distractorPool).slice(0, Math.min(2, distractorPool.length));
    bank = shuffle(neededLetters.concat(distractors)).map((letter, index) => ({
      id: `${letter}-${index}`,
      letter,
      used: false
    }));
  }

  function renderSlotsAndBank(card, word) {
    const slotsEl = card.querySelector("#build-slots");
    const bankEl = card.querySelector("#build-bank");
    const feedback = card.querySelector("#feedback");

    slotsEl.innerHTML = slots
      .map((slot) => {
        if (slot.space) return `<span class="build-slot build-slot-space" aria-hidden="true"></span>`;
        return `<span class="build-slot${slot.filled ? " filled" : ""}">${slot.filled ? slot.char : ""}</span>`;
      })
      .join("");

    bankEl.innerHTML = bank
      .map((tile) => `<button type="button" class="build-tile${tile.used ? " used" : ""}" data-tile-id="${tile.id}" ${tile.used ? "disabled" : ""}>${tile.letter}</button>`)
      .join("");

    bankEl.querySelectorAll(".build-tile").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.isConnected && session.active()) handleTileTap(btn.dataset.tileId, card, word);
      });
    });

    if (!solved) {
      feedback.className = "feedback";
      feedback.innerHTML = "";
    }
  }

  function handleTileTap(tileId, card, word) {
    if (solved) return;
    const tile = bank.find((item) => item.id === tileId);
    if (!tile || tile.used) return;

    const nextSlotIndex = slots.findIndex((slot) => !slot.filled);
    if (nextSlotIndex === -1) return;
    const expected = slots[nextSlotIndex].char;

    const feedback = card.querySelector("#feedback");
    if (tile.letter === expected) {
      slots[nextSlotIndex].filled = true;
      tile.used = true;
      wrongAttemptsOnSlot = 0;
      window.SoundButton.play("letter", tile.letter);
      renderSlotsAndBank(card, word);
      if (slots.every((slot) => slot.filled)) {
        solved = true;
        feedback.className = "feedback feedback-correct";
        feedback.textContent = usedHelp ? "🎉 Du bygde ordet med ekstra hjelp!" : "🎉 Du bygde ordet!";
        card.querySelector("#clear-attempt").disabled = true;
        if (!session.has(word.text)) {
          const state = window.NorwegianProgress.getActivityState("writing");
          const evidence = { ...(state.completed || {}) };
          const previous = evidence[word.text] || { withHelp: 0, withoutExtraHelp: 0 };
          const field = usedHelp ? "withHelp" : "withoutExtraHelp";
          evidence[word.text] = { ...previous, [field]: (previous[field] || 0) + 1 };
          window.NorwegianProgress.saveActivityState("writing", { ...state, completed: evidence });
          session.complete(word.text);
        }
      }
    } else {
      wrongAttemptsOnSlot += 1;
      usedHelp = true;
      feedback.className = "feedback feedback-incorrect";
      if (wrongAttemptsOnSlot >= 2) {
        // Re-teach instead of just saying "wrong" again: say the sound the
        // child needs next so a stuck attempt doesn't turn into guessing.
        feedback.innerHTML = `Hør lyden du trenger nå. ${window.SoundButton.html({ kind: "letter", value: expected, label: "Hør igjen" })}`;
        window.SoundButton.play("letter", expected);
      } else {
        feedback.textContent = "Prøv en annen bokstav. Du kan høre ordet igjen.";
      }
    }
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  return { render };
})();

if (typeof window !== "undefined") {
  window.WritingPage = WritingPage;
}
