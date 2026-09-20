/**
 * Listen & Click module — the app speaks a letter's sound and the learner
 * has to click the letter that matches what they heard.
 */

const ListenGamePage = (() => {
  const OPTION_COUNT = 4;

  let currentEntry = null;
  let currentOptions = [];
  let score = 0;
  let attempts = 0;
  let answered = false;

  function render(container) {
    const saved = window.NorwegianProgress.getActivityState("listen-game");
    container.innerHTML = "";
    score = Number.isInteger(saved.score) ? saved.score : 0;
    attempts = Number.isInteger(saved.attempts) ? saved.attempts : 0;

    const heading = document.createElement("div");
    heading.className = "page-header";
    heading.innerHTML = `
      <h2>Hør &amp; Klikk — Listen &amp; Click</h2>
      <p>Listen to the sound, then click the letter that matches it.</p>
    `;
    container.appendChild(heading);

    const scoreboard = document.createElement("div");
    scoreboard.className = "listen-game-score";
    scoreboard.id = "listen-game-score";
    container.appendChild(scoreboard);

    const card = document.createElement("div");
    card.className = "word-card listen-game-card";
    card.innerHTML = `
      <div class="detail-actions">
        <button type="button" class="btn" id="replay-sound">🔊 Play sound</button>
      </div>
      <div class="letter-grid listen-game-options" id="listen-game-options" role="group" aria-label="Letter options"></div>
      <div class="feedback" id="listen-game-feedback" aria-live="polite"></div>
      <div class="nav-buttons">
        <button type="button" class="btn btn-outline" id="next-round">Next ⟶</button>
      </div>
    `;
    container.appendChild(card);

    card.querySelector("#replay-sound").addEventListener("click", () => {
      if (currentEntry) {
        window.NorwegianAudio.speak(currentEntry.letter.toLowerCase());
      }
    });
    card.querySelector("#next-round").addEventListener("click", () => {
      startRound(container);
    });

    updateScoreboard(container);
    const savedEntry = window.NORWEGIAN_LETTERS.find((entry) => entry.letter === saved.currentLetter);
    if (savedEntry) {
      currentEntry = savedEntry;
      currentOptions = buildOptions(currentEntry);
      renderRound(container);
    } else {
      startRound(container);
    }
  }

  function startRound(container) {
    answered = false;
    currentEntry = pickRandomEntry();
    currentOptions = buildOptions(currentEntry);
    saveState();
    renderRound(container);
  }

  function renderRound(container) {
    const optionsContainer = container.querySelector("#listen-game-options");
    optionsContainer.innerHTML = "";
    currentOptions.forEach((entry) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "letter-tile";
      tile.dataset.letter = entry.letter;
      tile.setAttribute("aria-label", `Letter ${entry.letter}`);
      tile.innerHTML = `<span class="letter-tile-char">${entry.letter}</span>`;
      tile.addEventListener("click", () => checkAnswer(entry, tile, container));
      optionsContainer.appendChild(tile);
    });

    const feedback = container.querySelector("#listen-game-feedback");
    feedback.className = "feedback";
    feedback.innerHTML = "";

    updateScoreboard(container);
    window.NorwegianAudio.speak(currentEntry.letter.toLowerCase());
  }

  function excludeLetter(letters, letter) {
    return letters.filter((entry) => entry.letter !== letter);
  }

  function pickRandomEntry() {
    const letters = window.NORWEGIAN_LETTERS.filter((entry) =>
      window.NorwegianProgress.isLetterAvailable(entry.letter)
    );
    const pool = currentEntry ? excludeLetter(letters, currentEntry.letter) : letters;
    const candidates = pool.length > 0 ? pool : letters;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function buildOptions(correctEntry) {
    const letters = window.NORWEGIAN_LETTERS.filter((entry) =>
      window.NorwegianProgress.isLetterAvailable(entry.letter)
    );
    const pool = excludeLetter(letters, correctEntry.letter);
    shuffle(pool);
    const distractors = pool.slice(0, Math.min(OPTION_COUNT - 1, pool.length));
    const options = [correctEntry, ...distractors];
    shuffle(options);
    return options;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function checkAnswer(entry, tile, container) {
    if (answered) return;
    answered = true;
    attempts += 1;

    const optionsContainer = container.querySelector("#listen-game-options");
    const feedback = container.querySelector("#listen-game-feedback");
    const isCorrect = entry.letter === currentEntry.letter;

    optionsContainer.querySelectorAll(".letter-tile").forEach((btn) => {
      btn.disabled = true;
      if (btn.dataset.letter === currentEntry.letter) {
        btn.classList.add("correct");
        btn.insertAdjacentHTML("beforeend", `<span class="tile-status" aria-hidden="true"> ✓</span>`);
      } else if (btn === tile) {
        btn.classList.add("wrong");
        btn.insertAdjacentHTML("beforeend", `<span class="tile-status" aria-hidden="true"> ✗</span>`);
      }
    });

    if (isCorrect) {
      score += 1;
      feedback.className = "feedback feedback-correct";
      feedback.innerHTML = `🎉 Riktig! That's correct — "${currentEntry.letter}" sounds like "${currentEntry.sound}".`;
    } else {
      feedback.className = "feedback feedback-incorrect";
      feedback.innerHTML = `Ikke helt — not quite. It was <strong>${currentEntry.letter}</strong> (sounds like "${currentEntry.sound}").`;
    }

    saveState();
    updateScoreboard(container);
  }

  function updateScoreboard(container) {
    const scoreboard = container.querySelector("#listen-game-score");
    if (scoreboard) {
      scoreboard.textContent = `Score: ${score} / ${attempts}`;
    }
  }

  function saveState() {
    window.NorwegianProgress.saveActivityState("listen-game", {
      currentLetter: currentEntry ? currentEntry.letter : null,
      score,
      attempts
    });
  }

  return { render };
})();

if (typeof window !== "undefined") {
  window.ListenGamePage = ListenGamePage;
}
