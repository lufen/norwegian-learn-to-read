/**
 * Letter Journey — a progression game.
 * Repeated sound-to-letter recognition unlocks the next useful letters.
 * Three correct responses are participation evidence, not durable mastery.
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
  const UNLOCK_BATCH_SIZE = 2;
  const CORRECT_TO_UNLOCK = 3;
  const MAX_OPTIONS = 4;

  let orderCache = null;
  let journey = null;
  let currentLetter = null;
  let answered = false;
  let introSpoken = false;
  let session = null;
  let taskNumber = 0;
  // Transient (not persisted): letters just missed, retested soon so a wrong
  // answer is followed up on rather than possibly not seen again this session.
  let retryQueue = [];

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
      order.filter((letter) => !unlocked.includes(letter)).slice(0, STARTING_LETTERS - unlocked.length)
        .forEach((letter) => unlocked.push(letter));
    }
    return { unlocked, scores: stored.scores };
  }

  function persist() {
    window.NorwegianProgress.saveJourney(journey);
  }

  function scoreFor(letter) {
    return journey.scores[letter] || 0;
  }

  function isRecognized(letter) {
    return scoreFor(letter) >= CORRECT_TO_UNLOCK;
  }

  function lockedLetters() {
    return orderedLetters().filter((letter) => !journey.unlocked.includes(letter));
  }

  function unlockIfReady() {
    if (!journey.unlocked.every(isRecognized)) return null;
    const next = lockedLetters().slice(0, UNLOCK_BATCH_SIZE);
    journey.unlocked.push(...next);
    return next.length > 0 ? next : null;
  }

  function render(container) {
    const previousSession = session;
    session = window.PracticeSession.begin("journey", container, () => render(container));
    if (previousSession !== session) {
      retryQueue = [];
      currentLetter = null;
      introSpoken = false;
    }
    journey = loadJourney();
    persist();

    container.innerHTML = "";

    const heading = document.createElement("div");
    heading.className = "page-header";
    heading.innerHTML = `
      <h2>Bokstavreisen — Letter Journey</h2>
      <p>Hør lyden. Trykk på bokstaven.</p>
      ${window.SoundButton.html({ kind: "word", value: "Hør lyden. Trykk på bokstaven.", label: "Hør oppgaven" })}
    `;
    container.appendChild(heading);

    const card = document.createElement("div");
    card.className = "word-card journey-card";
    card.innerHTML = `
      <div class="journey-status" id="journey-status" aria-live="polite"></div>
      <div class="detail-actions" id="journey-replay-actions"></div>
      <div class="letter-grid journey-options" id="journey-options" role="group" aria-label="Velg bokstav"></div>
      <div class="feedback" id="journey-feedback" aria-live="polite"></div>
      <div class="nav-buttons">
        <button type="button" class="btn btn-outline" id="journey-next" disabled>Neste ⟶</button>
      </div>
    `;
    container.appendChild(card);

    const pool = document.createElement("div");
    pool.className = "journey-pool";
    pool.id = "journey-pool";
    container.appendChild(pool);

    const resetWrap = document.createElement("div");
    resetWrap.className = "detail-actions";
    resetWrap.innerHTML = `<button type="button" class="btn btn-outline" id="journey-reset">Start reisen på nytt</button>`;
    container.appendChild(resetWrap);
    session.attach();
    const active = window.PracticeSession.scope(container);

    card.querySelector("#journey-next").addEventListener("click", () => {
      if (active() && answered) startRound(container);
    });
    resetWrap.querySelector("#journey-reset").addEventListener("click", () => {
      window.ChildConfirm.show({
        message: "Starte på nytt? Da nullstilles bokstavreisen.",
        spokenMessage: "Vil du starte bokstavreisen på nytt? Da mister du bokstavene du har låst opp.",
        confirmLabel: "🔄 Start på nytt",
        cancelLabel: "↩️ Fortsett å øve",
        onConfirm: () => {
          if (!active()) return;
          currentLetter = null;
          retryQueue = [];
          journey = { unlocked: orderedLetters().slice(0, STARTING_LETTERS), scores: {} };
          persist();
          window.PracticeSession.invalidate();
          render(container);
        }
      });
    });

    startRound(container);
  }

  function startRound(container) {
    if (!session.active()) return;
    answered = false;
    taskNumber += 1;
    container.querySelector("#journey-next").disabled = true;

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
      tile.setAttribute("aria-label", `Bokstav ${letter}`);
      tile.innerHTML = `<span class="letter-tile-char">${letter}</span>`;
      tile.addEventListener("click", () => checkAnswer(letter, tile, container));
      optionsContainer.appendChild(tile);
    });

    const feedback = container.querySelector("#journey-feedback");
    feedback.className = "feedback";
    feedback.innerHTML = "";

    renderReplayButton(container, currentLetter);

    updateStatus(container);
    if (!introSpoken) {
      introSpoken = true;
      // One sequence, so the letter sound starts when the instruction has
      // actually finished instead of cutting it off on a slow voice.
      window.NorwegianAudio.speakSequence([
        { text: "Trykk på bokstaven du hører." },
        { letter: currentLetter }
      ]);
    } else {
      speakLetter(currentLetter);
    }
  }

  function speakLetter(letter) {
    window.SoundButton.play("letter", letter);
  }

  /** Re-render the replay control so it always points at the letter being asked about. */
  function renderReplayButton(container, letter) {
    const actions = container.querySelector("#journey-replay-actions");
    if (!actions) return;
    actions.innerHTML = window.SoundButton.html({ kind: "letter", value: letter, label: "Hør lyden" });
  }

  /**
   * Prefer new letters, but keep previously recognized letters in rotation for
   * recall, and prioritize anything just missed so a wrong answer gets
   * retested soon rather than possibly not again this session.
   */
  function pickLetter(unlocked) {
    retryQueue = retryQueue.filter((letter) => unlocked.includes(letter));
    if (retryQueue.length > 0 && Math.random() < 0.6) {
      return retryQueue.shift();
    }
    const newLetters = unlocked.filter((letter) => !isRecognized(letter));
    const practicePool = newLetters.length > 0 && Math.random() < 0.7 ? newLetters : unlocked;
    const candidates = practicePool.length > 0 ? practicePool : unlocked;
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
    if (answered || !session.active() || !tile.isConnected) return;
    answered = true;

    const isCorrect = letter === currentLetter;
    const entry = entryFor(currentLetter);
    const wasRecognized = isRecognized(currentLetter);

    if (isCorrect) {
      journey.scores[currentLetter] = Math.min(scoreFor(currentLetter) + 1, CORRECT_TO_UNLOCK);
    } else {
      if (!retryQueue.includes(currentLetter)) retryQueue.push(currentLetter);
    }

    const nowRecognized = isRecognized(currentLetter);
    // Earned recognition evidence is retained after a later mistake.
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
    const soundHint = entry ? ` (${entry.phoneme || entry.sound})` : "";
    if (isCorrect) {
      feedback.className = "feedback feedback-correct";
      feedback.innerHTML = nowRecognized && !wasRecognized
        ? `⭐ Du har kjent igjen <strong>${currentLetter}</strong> tre ganger!`
        : `🎉 Riktig! Det er <strong>${currentLetter}</strong>${soundHint}.`;
    } else {
      feedback.className = "feedback feedback-incorrect";
      feedback.innerHTML = `Dette er <strong>${currentLetter}</strong>${soundHint}. Hør og prøv lyden selv.
        ${window.SoundButton.html({ kind: "letter", value: currentLetter, label: "Hør igjen" })}`;
      speakLetter(currentLetter);
    }

    if (unlockedLetter) {
      feedback.insertAdjacentHTML(
        "beforeend",
        `<div class="journey-unlock">🔓 Nye bokstaver: <strong>${unlockedLetter.join(", ")}</strong>!</div>`
      );
    }

    updateStatus(container);
    container.querySelector("#journey-next").disabled = false;
    session.complete(`question-${taskNumber}`, feedback);
  }

  function updateStatus(container) {
    const status = container.querySelector("#journey-status");
    const total = orderedLetters().length;
    const recognizedCount = journey.unlocked.filter(isRecognized).length;
    const recognizedPercent = total > 0 ? (recognizedCount / total) * 100 : 0;
    if (status) {
      status.innerHTML = `
        <div class="journey-counts">Bokstaver: ${journey.unlocked.length} / ${total} · Kjent igjen tre ganger: ${recognizedCount}</div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${recognizedPercent}%"></div></div>
      `;
    }

    const pool = container.querySelector("#journey-pool");
    if (!pool) return;
    pool.innerHTML = "";
    journey.unlocked.forEach((letter) => {
      const chip = document.createElement("div");
      chip.className = `journey-chip${isRecognized(letter) ? " mastered" : ""}`;
      chip.innerHTML = `
        <span class="journey-chip-letter">${letter}</span>
        <span class="journey-chip-score">${scoreFor(letter)} / ${CORRECT_TO_UNLOCK}</span>
      `;
      pool.appendChild(chip);
    });

    const remaining = lockedLetters();
    if (remaining.length > 0) {
      const locked = document.createElement("div");
      locked.className = "journey-chip locked";
      locked.innerHTML = `<span class="journey-chip-letter">🔒</span><span class="journey-chip-score">${Math.min(UNLOCK_BATCH_SIZE, remaining.length)} nye</span>`;
      pool.appendChild(locked);
    }
  }

  return { render };
})();

if (typeof window !== "undefined") {
  window.JourneyPage = JourneyPage;
}
