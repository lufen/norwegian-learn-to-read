/**
 * Writing/Dictation module — plays a word, the learner types it, and the
 * app checks the spelling letter-by-letter with instant feedback.
 */

const WritingPage = (() => {
  let currentLevelIndex = 1;
  let currentWordIndex = 0;

  function render(container) {
    const saved = window.NorwegianProgress.getActivityState("writing");
    currentLevelIndex = Number.isInteger(saved.levelIndex) ? saved.levelIndex : currentLevelIndex;
    currentWordIndex = Number.isInteger(saved.wordIndex) ? saved.wordIndex : currentWordIndex;
    const level = window.WORD_LEVELS[currentLevelIndex] || window.WORD_LEVELS[1];
    currentLevelIndex = window.WORD_LEVELS.indexOf(level);
    currentWordIndex = Math.min(currentWordIndex, level.words.length - 1);
    savePosition();
    container.innerHTML = "";

    const heading = document.createElement("div");
    heading.className = "page-header";
    heading.innerHTML = `
      <h2>Skriv Ord — Write Words</h2>
      <p>Listen to the word, then type what you hear.</p>
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
      <div class="detail-actions">
        <button type="button" class="btn" id="play-word">🔊 Play word</button>
        <button type="button" class="btn btn-secondary" id="play-slow">🐢 Play slowly</button>
      </div>
      <form id="dictation-form" autocomplete="off">
        <label for="dictation-input" class="visually-hidden">Type the word you heard</label>
        <input type="text" id="dictation-input" class="dictation-input" placeholder="Type here..." />
        <button type="submit" class="btn">Check</button>
      </form>
      <div class="feedback" id="feedback" aria-live="polite"></div>
      <div class="nav-buttons">
        <button type="button" class="btn btn-outline" id="prev-word">⟵ Previous</button>
        <button type="button" class="btn btn-outline" id="next-word">Next ⟶</button>
      </div>
    `;
    container.appendChild(card);

    card.querySelector("#play-word").addEventListener("click", () => {
      window.NorwegianAudio.speak(word.text, { rate: window.NorwegianSettings.getAudioRate() });
    });
    card.querySelector("#play-slow").addEventListener("click", () => {
      window.NorwegianAudio.speak(word.text, { rate: 0.6 });
    });

    const form = card.querySelector("#dictation-form");
    const input = card.querySelector("#dictation-input");
    const feedback = card.querySelector("#feedback");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      checkAnswer(word.text, input.value, feedback);
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
    window.NorwegianProgress.saveActivityState("writing", {
      levelIndex: currentLevelIndex,
      wordIndex: currentWordIndex
    });
  }

  function checkAnswer(correctText, userText, feedbackEl) {
    const correct = correctText.trim().toLowerCase();
    const attempt = (userText || "").trim().toLowerCase();

    if (window.NorwegianContentFilter && window.NorwegianContentFilter.containsBlockedWord(attempt)) {
      feedbackEl.className = "feedback feedback-incorrect";
      feedbackEl.innerHTML = `Let's try that word again — type only the word you heard.`;
      return;
    }

    if (attempt === correct) {
      feedbackEl.className = "feedback feedback-correct";
      feedbackEl.innerHTML = `🎉 Riktig! That's correct — great job!`;
      window.NorwegianProgress.markWordMastered(correct);
      return;
    }

    const maxLen = Math.max(correct.length, attempt.length);
    let highlighted = "";
    for (let i = 0; i < maxLen; i++) {
      const expectedChar = escapeHtml(correct[i] || "");
      const typedChar = attempt[i];
      if (typedChar === undefined) {
        highlighted += `<span class="char-missing">${expectedChar}</span>`;
      } else if (typedChar === correct[i]) {
        highlighted += `<span class="char-correct">${escapeHtml(typedChar)}</span>`;
      } else {
        highlighted += `<span class="char-wrong">${escapeHtml(typedChar)}</span>`;
      }
    }

    feedbackEl.className = "feedback feedback-incorrect";
    feedbackEl.innerHTML = `
      <p>Not quite — try again! Here's how your answer compares:</p>
      <p class="char-compare">${highlighted}</p>
      <p class="correct-answer">Correct spelling: <strong>${escapeHtml(correct)}</strong></p>
    `;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[ch]);
  }

  return { render };
})();

if (typeof window !== "undefined") {
  window.WritingPage = WritingPage;
}
