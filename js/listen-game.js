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
    container.innerHTML = "";

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
      <div class="letter-grid listen-game-options" id="listen-game-options" role="list"></div>
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
    startRound(container);
  }

  function startRound(container) {
    answered = false;
    currentEntry = pickRandomEntry();
    currentOptions = buildOptions(currentEntry);

    const optionsContainer = container.querySelector("#listen-game-options");
    optionsContainer.innerHTML = "";
    currentOptions.forEach((entry) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "letter-tile";
      tile.setAttribute("role", "listitem");
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

  function pickRandomEntry() {
    const letters = window.NORWEGIAN_LETTERS;
    return letters[Math.floor(Math.random() * letters.length)];
  }

  function buildOptions(correctEntry) {
    const letters = window.NORWEGIAN_LETTERS;
    const pool = letters.filter((entry) => entry.letter !== correctEntry.letter);
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
      const btnLetter = btn.querySelector(".letter-tile-char").textContent;
      if (btnLetter === currentEntry.letter) {
        btn.classList.add("correct");
      } else if (btn === tile) {
        btn.classList.add("wrong");
      }
    });

    if (isCorrect) {
      score += 1;
      feedback.className = "feedback feedback-correct";
      feedback.innerHTML = `🎉 Riktig! "${currentEntry.letter}" sounds like "${currentEntry.sound}".`;
      window.NorwegianProgress.markLetterMastered(currentEntry.letter);
    } else {
      feedback.className = "feedback feedback-incorrect";
      feedback.innerHTML = `Not quite — that was <strong>${currentEntry.letter}</strong> (sounds like "${currentEntry.sound}").`;
    }

    updateScoreboard(container);
  }

  function updateScoreboard(container) {
    const scoreboard = container.querySelector("#listen-game-score");
    if (scoreboard) {
      scoreboard.textContent = `Score: ${score} / ${attempts}`;
    }
  }

  return { render };
})();

if (typeof window !== "undefined") {
  window.ListenGamePage = ListenGamePage;
}
