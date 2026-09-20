/**
 * Letter Journey — a progression game.
 * The learner starts with just a couple of letters. Every letter needs a few
 * correct answers in a row to be mastered; once every letter currently in play
 * is mastered, the next letter of the journey is unlocked.
 * Progress is stored in localStorage via NorwegianProgress.
 */

const JourneyPage = (() => {
  /** Letters ordered from easiest/most useful to trickiest. */
  const LETTER_ORDER = [
    "S", "O", "L", "A", "M", "I", "R", "E", "N", "T",
    "K", "U", "B", "D", "F", "G", "H", "P", "V", "Y",
    "J", "Å", "Ø", "Æ", "C", "W", "X", "Z", "Q"
  ];

  const STARTING_LETTERS = 2;
  const CORRECT_TO_MASTER = 3;
  const MAX_OPTIONS = 4;

  let orderCache = null;
  let journey = null;
  let currentLetter = null;
  let answered = false;

  function allLetters() {
    return window.NORWEGIAN_LETTERS;
  }

  function orderedLetters() {
    if (orderCache) return orderCache;
    const known = allLetters().map((entry) => entry.letter);
    const ordered = LETTER_ORDER.filter((letter) => known.includes(letter));
    const rest = known.filter((letter) => !ordered.includes(letter));
    orderCache = ordered.concat(rest);
    return orderCache;
  }

  function entryFor(letter) {
    return allLetters().find((e) => e.letter === letter) || null;
  }

  function loadJourney() {
    const order = orderedLetters();
    const stored = window.NorwegianProgress.getJourney();
    const unlocked = stored.unlocked.filter((letter) => order.includes(letter));
    if (unlocked.length < STARTING_LETTERS) {
      order.slice(0, STARTING_LETTERS).forEach((letter) => {
        if (!unlocked.includes(letter)) unlocked.push(letter);
      });
    }
    return { unlocked, scores: stored.scores };
  }

  function persist() {
    window.NorwegianProgress.saveJourney(journey);
  }

  function scoreFor(letter) {
    return journey.scores[letter] || 0;
  }

  function isMastered(letter) {
    return scoreFor(letter) >= CORRECT_TO_MASTER;
  }

  function nextLockedLetter() {
    return orderedLetters().find((letter) => !journey.unlocked.includes(letter)) || null;
  }

  function unlockIfReady() {
    if (!journey.unlocked.every(isMastered)) return null;
    const next = nextLockedLetter();
    if (!next) return null;
    journey.unlocked.push(next);
    return next;
  }

  function render(container) {
    journey = loadJourney();
    persist();

    container.innerHTML = "";

    const heading = document.createElement("div");
    heading.className = "page-header";
    heading.innerHTML = `
      <h2>Bokstavreisen — Letter Journey</h2>
      <p>Start with a couple of letters and unlock new ones as you master them.</p>
    `;
    container.appendChild(heading);

    const card = document.createElement("div");
    card.className = "word-card journey-card";
    card.innerHTML = `
      <div class="journey-status" id="journey-status" aria-live="polite"></div>
      <div class="detail-actions">
        <button type="button" class="btn" id="journey-replay">🔊 Play sound</button>
      </div>
      <div class="letter-grid journey-options" id="journey-options" role="group" aria-label="Letter options"></div>
      <div class="feedback" id="journey-feedback" aria-live="polite"></div>
      <div class="nav-buttons">
        <button type="button" class="btn btn-outline" id="journey-next">Next ⟶</button>
      </div>
    `;
    container.appendChild(card);

    const pool = document.createElement("div");
    pool.className = "journey-pool";
    pool.id = "journey-pool";
    container.appendChild(pool);

    const resetWrap = document.createElement("div");
    resetWrap.className = "detail-actions";
    resetWrap.innerHTML = `<button type="button" class="btn btn-outline" id="journey-reset">Start journey over</button>`;
    container.appendChild(resetWrap);

    card.querySelector("#journey-replay").addEventListener("click", () => {
      if (currentLetter) window.NorwegianAudio.speak(currentLetter.toLowerCase());
    });
    card.querySelector("#journey-next").addEventListener("click", () => startRound(container));
    resetWrap.querySelector("#journey-reset").addEventListener("click", () => {
      if (window.confirm("Start the letter journey over from the first letters?")) {
        currentLetter = null;
        journey = { unlocked: orderedLetters().slice(0, STARTING_LETTERS), scores: {} };
        persist();
        render(container);
      }
    });

    startRound(container);
  }

  function startRound(container) {
    answered = false;

    const unlocked = journey.unlocked;
    currentLetter = pickLetter(unlocked);
    const options = buildOptions(currentLetter, unlocked);

    const optionsContainer = container.querySelector("#journey-options");
    optionsContainer.innerHTML = "";
    options.forEach((letter) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "letter-tile";
      tile.dataset.letter = letter;
      tile.setAttribute("aria-label", `Letter ${letter}`);
      tile.innerHTML = `<span class="letter-tile-char">${letter}</span>`;
      tile.addEventListener("click", () => checkAnswer(letter, tile, container));
      optionsContainer.appendChild(tile);
    });

    const feedback = container.querySelector("#journey-feedback");
    feedback.className = "feedback";
    feedback.innerHTML = "";

    updateStatus(container);
    window.NorwegianAudio.speak(currentLetter.toLowerCase());
  }

  /** Prefer the letters that still need practice. */
  function pickLetter(unlocked) {
    const unmastered = unlocked.filter((letter) => !isMastered(letter));
    const candidates = unmastered.length > 0 ? unmastered : unlocked;
    const pool = candidates.length > 1 ? candidates.filter((l) => l !== currentLetter) : candidates;
    const source = pool.length > 0 ? pool : candidates;
    return source[Math.floor(Math.random() * source.length)];
  }

  function buildOptions(correctLetter, unlocked) {
    const distractors = shuffle(unlocked.filter((letter) => letter !== correctLetter))
      .slice(0, MAX_OPTIONS - 1);
    return shuffle([correctLetter].concat(distractors));
  }

  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function checkAnswer(letter, tile, container) {
    if (answered) return;
    answered = true;

    const isCorrect = letter === currentLetter;
    const entry = entryFor(currentLetter);
    const wasMastered = isMastered(currentLetter);

    if (isCorrect) {
      journey.scores[currentLetter] = Math.min(scoreFor(currentLetter) + 1, CORRECT_TO_MASTER);
    } else {
      journey.scores[currentLetter] = Math.max(scoreFor(currentLetter) - 1, 0);
    }

    const nowMastered = isMastered(currentLetter);
    if (nowMastered && !wasMastered) {
      window.NorwegianProgress.markLetterMastered(currentLetter);
    }
    const unlockedLetter = unlockIfReady();
    persist();

    container.querySelectorAll("#journey-options .letter-tile").forEach((btn) => {
      btn.disabled = true;
      if (btn.dataset.letter === currentLetter) {
        btn.classList.add("correct");
        btn.insertAdjacentHTML("beforeend", `<span class="tile-status" aria-hidden="true"> ✓</span>`);
      } else if (btn === tile) {
        btn.classList.add("wrong");
        btn.insertAdjacentHTML("beforeend", `<span class="tile-status" aria-hidden="true"> ✗</span>`);
      }
    });

    const feedback = container.querySelector("#journey-feedback");
    const soundHint = entry ? ` (sounds like "${entry.sound}")` : "";
    if (isCorrect) {
      feedback.className = "feedback feedback-correct";
      feedback.innerHTML = nowMastered && !wasMastered
        ? `⭐ Flott! You mastered <strong>${currentLetter}</strong>${soundHint}.`
        : `🎉 Riktig! That's <strong>${currentLetter}</strong>${soundHint}.`;
    } else {
      feedback.className = "feedback feedback-incorrect";
      feedback.innerHTML = `Ikke helt — it was <strong>${currentLetter}</strong>${soundHint}.`;
    }

    if (unlockedLetter) {
      feedback.insertAdjacentHTML(
        "beforeend",
        `<div class="journey-unlock">🔓 New letter unlocked: <strong>${unlockedLetter}</strong>!</div>`
      );
    }

    updateStatus(container);
  }

  function updateStatus(container) {
    const status = container.querySelector("#journey-status");
    const total = orderedLetters().length;
    const masteredCount = journey.unlocked.filter(isMastered).length;
    const masteredPercent = total > 0 ? (masteredCount / total) * 100 : 0;
    if (status) {
      status.innerHTML = `
        <div class="journey-counts">Letters in play: ${journey.unlocked.length} / ${total} · Mastered: ${masteredCount}</div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${masteredPercent}%"></div></div>
      `;
    }

    const pool = container.querySelector("#journey-pool");
    if (!pool) return;
    pool.innerHTML = "";
    journey.unlocked.forEach((letter) => {
      const chip = document.createElement("div");
      chip.className = `journey-chip${isMastered(letter) ? " mastered" : ""}`;
      chip.innerHTML = `
        <span class="journey-chip-letter">${letter}</span>
        <span class="journey-chip-score">${scoreFor(letter)} / ${CORRECT_TO_MASTER}</span>
      `;
      pool.appendChild(chip);
    });

    const next = nextLockedLetter();
    if (next) {
      const locked = document.createElement("div");
      locked.className = "journey-chip locked";
      locked.innerHTML = `<span class="journey-chip-letter">🔒</span><span class="journey-chip-score">next</span>`;
      pool.appendChild(locked);
    }
  }

  return { render };
})();

if (typeof window !== "undefined") {
  window.JourneyPage = JourneyPage;
}
