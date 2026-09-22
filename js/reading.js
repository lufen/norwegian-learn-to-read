/**
 * Decodable mini-books — short texts built from a small, known word bank.
 *
 * Design (see docs/little-books-design.md for the full write-up and the
 * teacher-review findings it responds to):
 * - The child sees print FIRST and must attempt it before any audio is
 *   played automatically. "Hear it" / "Sound it out with me" are always
 *   available on request, never forced or withheld by level — support is
 *   child-controlled, not faded on a schedule.
 * - A wrong answer re-teaches (sounds out the missed word) instead of just
 *   saying "try again."
 * - Books are sequenced and unlock one at a time, like Letter Journey.
 * - Progress language is honest about what was observed ("read without
 *   help" / "practiced with help") — never "mastered," since tap data alone
 *   can't support that claim.
 * - Finishing a book shows a calm summary and a real stopping point instead
 *   of looping straight into more questions.
 */

const ReadingPage = (() => {
  const DEFAULT_STATE = { bookIndex: 0, pageIndex: 0, unlockedCount: 1, wordStats: {} };

  let bookIndex = 0;
  let pageIndex = 0;
  let unlockedCount = 1;
  let wordStats = {};
  let questionNumber = 0;
  let question = null;
  let helpUsedThisAttempt = false;
  let showingSummary = false;

  function loadState() {
    const saved = window.NorwegianProgress.getActivityState("reading");
    bookIndex = Number.isInteger(saved.bookIndex) ? saved.bookIndex : DEFAULT_STATE.bookIndex;
    pageIndex = Number.isInteger(saved.pageIndex) ? saved.pageIndex : DEFAULT_STATE.pageIndex;
    unlockedCount = Number.isInteger(saved.unlockedCount) ? saved.unlockedCount : DEFAULT_STATE.unlockedCount;
    wordStats = saved.wordStats && typeof saved.wordStats === "object" ? saved.wordStats : {};
    unlockedCount = Math.max(1, Math.min(unlockedCount, window.DECODABLE_BOOKS.length));
    bookIndex = Math.max(0, Math.min(bookIndex, unlockedCount - 1));
    pageIndex = Math.max(0, Math.min(pageIndex, window.DECODABLE_BOOKS[bookIndex].pages.length - 1));
  }

  function saveState() {
    window.NorwegianProgress.saveActivityState("reading", { bookIndex, pageIndex, unlockedCount, wordStats });
  }

  function recordAttempt(word, correct, usedHelp, countsAsReading) {
    if (!correct) return;
    const entry = wordStats[word] || { independent: 0, withHelp: 0, recognizedOnly: 0 };
    if (!countsAsReading) {
      entry.recognizedOnly = (entry.recognizedOnly || 0) + 1;
    } else if (usedHelp) {
      entry.withHelp += 1;
    } else {
      entry.independent += 1;
    }
    wordStats[word] = entry;
    saveState();
  }

  function render(container) {
    loadState();
    const book = window.DECODABLE_BOOKS[bookIndex];
    const page = book.pages[pageIndex];
    const isLastPage = pageIndex === book.pages.length - 1;

    if (showingSummary) {
      renderSummary(container, book);
      return;
    }

    if (!question) {
      question = createQuestion(book, page, isLastPage);
      questionNumber += 1;
      helpUsedThisAttempt = false;
      const scheduledEpoch = window.NorwegianProgress.getEpoch();
      // Speak the task itself (not the story sentence) so a non-reader
      // knows what to do without needing the "🔊" replay button first.
      window.setTimeout(() => {
        if (window.NorwegianProgress.getEpoch() !== scheduledEpoch) return;
        window.NorwegianAudio.speak(question.spokenPrompt);
      }, 400);
    }

    container.innerHTML = `
      <div class="page-header">
        <h2>Les en liten bok — Read a little book</h2>
        <p>Look at the words first — ask for help any time you want it.</p>
      </div>
      <div class="reading-card">
        <div class="reading-book-picker">
          ${window.DECODABLE_BOOKS.map((item, index) => {
            const locked = index >= unlockedCount;
            return `
              <button type="button" class="btn btn-level${index === bookIndex ? " active" : ""}${locked ? " locked" : ""}"
                data-book="${index}" ${locked ? "disabled aria-disabled=\"true\"" : ""}>
                <span class="book-icon" aria-hidden="true">${locked ? "🔒" : (item.icon || "📖")}</span>
                ${locked ? "???" : item.title}<small>${locked ? "Finish the book before" : (item.level || "")}</small>
              </button>
            `;
          }).join("")}
        </div>
        <div class="reading-page" aria-live="polite">
          <div class="reading-picture" aria-hidden="true">${page.picture}</div>
          <p class="reading-sentence" id="reading-sentence">${page.text}</p>
          ${window.Curriculum ? window.Curriculum.newLetterBadge(page.text) : ""}
          <p class="reading-hint">Try reading it yourself first! 🤗</p>
          <div class="detail-actions">
            <button type="button" class="btn" id="read-sentence">🔊 Hear it</button>
            <button type="button" class="btn btn-secondary" id="sound-words">🧩 Sound it out with me</button>
          </div>
          <div class="reading-questions">
            <section class="reading-question">
              <p class="reading-question-count">Question ${questionNumber}</p>
              <div class="reading-prompt">
                <button type="button" class="btn btn-icon" id="replay-prompt" aria-label="Play the question aloud">🔊</button>
                <h3>${question.prompt}</h3>
              </div>
              <div class="reading-choices">
                ${question.choices.map((choice) => `<button type="button" class="reading-choice" data-choice="${choice}">${choice}</button>`).join("")}
              </div>
              <div class="feedback reading-feedback" aria-live="polite"></div>
            </section>
          </div>
        </div>
        <div class="nav-buttons">
          <button type="button" class="btn btn-outline" id="previous-page">⟵ Previous</button>
          <span class="reading-page-count">Page ${pageIndex + 1} of ${book.pages.length}</span>
          <button type="button" class="btn btn-outline" id="next-page" ${isLastPage ? "disabled" : ""}>Next ⟶</button>
        </div>
      </div>
    `;

    if (window.Curriculum) window.Curriculum.bindBadgeAudio(container);

    container.querySelectorAll("[data-book]").forEach((button) => {
      if (button.disabled) return;
      button.addEventListener("click", () => {
        bookIndex = Number(button.dataset.book);
        pageIndex = 0;
        question = null;
        showingSummary = false;
        saveState();
        render(container);
      });
    });
    container.querySelector("#read-sentence").addEventListener("click", () => {
      helpUsedThisAttempt = true;
      window.NorwegianAudio.speak(page.text);
    });
    container.querySelector("#sound-words").addEventListener("click", () => {
      helpUsedThisAttempt = true;
      soundOutWord(page.keyword);
    });
    container.querySelector("#replay-prompt").addEventListener("click", () => {
      helpUsedThisAttempt = true;
      window.NorwegianAudio.speak(question.spokenPrompt);
    });
    container.querySelector(".reading-questions").addEventListener("click", (event) => {
      const button = event.target.closest(".reading-choice");
      if (!button) return;
      // Disable all choices the instant a tap lands, before the ~1.1s
      // "correct" pause — otherwise excited/rapid tapping during that
      // window can register as answers to the next rendered question and
      // skip a page.
      container.querySelectorAll(".reading-choice").forEach((btn) => { btn.disabled = true; });
      const feedback = button.closest(".reading-question").querySelector(".reading-feedback");
      const correct = button.dataset.choice === question.answer;
      const scheduledEpoch = window.NorwegianProgress.getEpoch();
      if (correct) {
        feedback.className = "feedback reading-feedback feedback-correct";
        feedback.textContent = "🎉 Riktig! Du leste det!";
        // Picture-matching only checks that a spoken word was understood,
        // not that the child decoded any print — don't count it toward
        // "read without help".
        recordAttempt(question.answerWord, true, helpUsedThisAttempt, question.type !== "picture");
        window.setTimeout(() => {
          // Abort if the active profile changed (or progress was reset)
          // while this was pending, so we never write one child's session
          // into another's storage or force-navigate them away.
          if (window.NorwegianProgress.getEpoch() !== scheduledEpoch) return;
          if (isLastPage) {
            showingSummary = true;
          } else {
            pageIndex += 1;
            question = null;
          }
          saveState();
          render(container);
        }, 1100);
      } else {
        feedback.className = "feedback reading-feedback feedback-incorrect";
        feedback.textContent = "La oss lytte til lydene sammen — let's sound it out together.";
        helpUsedThisAttempt = true;
        // Let them try again once they've actually heard it sounded out,
        // instead of leaving every choice permanently disabled.
        soundOutWord(question.answerWord, () => {
          if (window.NorwegianProgress.getEpoch() !== scheduledEpoch) return;
          container.querySelectorAll(".reading-choice").forEach((btn) => { btn.disabled = false; });
        });
      }
    });
    container.querySelector("#previous-page").addEventListener("click", () => {
      pageIndex = (pageIndex - 1 + book.pages.length) % book.pages.length;
      question = null;
      saveState();
      render(container);
    });
    const nextButton = container.querySelector("#next-page");
    if (nextButton && !nextButton.disabled) {
      nextButton.addEventListener("click", () => {
        pageIndex = (pageIndex + 1) % book.pages.length;
        question = null;
        saveState();
        render(container);
      });
    }
  }

  function renderSummary(container, book) {
    const words = Object.keys(book.wordBank || {});
    const lines = words.map((word) => {
      const stat = wordStats[word];
      if (!stat || (stat.independent === 0 && stat.withHelp === 0 && !stat.recognizedOnly)) {
        return `<li>${word} — practiced today</li>`;
      }
      if (stat.independent > 0) {
        return `<li>${word} — read without help ✅</li>`;
      }
      if (stat.withHelp > 0) {
        return `<li>${word} — practiced with help 🧩</li>`;
      }
      return `<li>${word} — recognized the picture 👀</li>`;
    });
    container.innerHTML = `
      <div class="page-header">
        <h2>Flott jobbet! — Great work!</h2>
        <p>Here's what you practiced in "${book.title}":</p>
      </div>
      <div class="reading-card reading-summary">
        <ul class="reading-summary-list">${lines.join("")}</ul>
        <p class="reading-hint">👪 Want to read this one again with a grown-up?</p>
        <div class="detail-actions">
          <button type="button" class="btn btn-secondary" id="summary-replay">🔁 Read it again</button>
          <button type="button" class="btn" id="summary-continue">Keep going ➡️</button>
          <button type="button" class="btn btn-outline" id="summary-home">🏠 Take a break</button>
        </div>
      </div>
    `;
    container.querySelector("#summary-replay").addEventListener("click", () => {
      pageIndex = 0;
      question = null;
      showingSummary = false;
      saveState();
      render(container);
    });
    container.querySelector("#summary-continue").addEventListener("click", () => {
      unlockedCount = Math.max(unlockedCount, Math.min(bookIndex + 2, window.DECODABLE_BOOKS.length));
      const hasNextBook = bookIndex + 1 < window.DECODABLE_BOOKS.length;
      bookIndex = hasNextBook ? bookIndex + 1 : bookIndex;
      pageIndex = 0;
      question = null;
      showingSummary = false;
      saveState();
      render(container);
    });
    container.querySelector("#summary-home").addEventListener("click", () => {
      showingSummary = false;
      if (window.App && window.App.navigate) {
        window.App.navigate("home");
      } else {
        window.location.hash = "";
      }
    });
  }

  /**
   * Speak a word one sound at a time, then whole, to model blending.
   * Each sound waits for the previous one to finish (a fixed timer would let
   * the next utterance cancel the current one), and a second tap replaces the
   * running sequence instead of overlapping with it.
   */
  function soundOutWord(word, onDone) {
    window.NorwegianAudio.soundOutWord(word, { onDone });
  }

  /**
   * Build one of two decodable question types from the book's own word
   * bank: matching a spoken word to its printed form, or matching a spoken
   * word to its picture. Distractors always come from the same book's word
   * bank, so nothing undecodable ever appears. On the final page of a book
   * that defines a transfer word, always test it instead of a normal
   * question — this is the one required checkpoint that the child actually
   * decoded something new, rather than just recognizing a memorized word/
   * picture, so it must be attempted (and passed, via the existing retry
   * loop) before the book can be finished.
   */
  function createQuestion(book, page, isLastPage) {
    if (isLastPage && book.transferWord) {
      const bank = book.wordBank || {};
      const distractors = shuffle(Object.keys(bank)).slice(0, 2);
      const choices = shuffle([book.transferWord.word, ...distractors]);
      return {
        prompt: "Finn det nye ordet.",
        spokenPrompt: `Kan du lese dette nye ordet? Finn ordet ${book.transferWord.word}.`,
        answer: book.transferWord.word,
        answerWord: book.transferWord.word,
        type: "word",
        choices
      };
    }

    const keyword = page.keyword;
    const bank = book.wordBank || {};
    const otherWords = Object.keys(bank).filter((word) => word !== keyword);
    const distractorCount = Math.min(2, otherWords.length);
    const distractors = shuffle(otherWords).slice(0, distractorCount);
    const useWordMatch = Math.random() < 0.5 || distractors.length === 0;

    if (useWordMatch || distractors.length === 0) {
      const choices = shuffle([keyword, ...distractors]);
      return {
        prompt: "Finn ordet.",
        spokenPrompt: `Finn ordet ${keyword}.`,
        answer: keyword,
        answerWord: keyword,
        type: "word",
        choices
      };
    }

    const correctPicture = bank[keyword] || page.picture;
    const distractorPictures = distractors.map((word) => bank[word]).filter(Boolean);
    const choices = shuffle([correctPicture, ...distractorPictures]);
    return {
      prompt: "Pek på bildet.",
      spokenPrompt: `Pek på bildet av ${keyword}.`,
      answer: correctPicture,
      answerWord: keyword,
      type: "picture",
      choices
    };
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
  window.ReadingPage = ReadingPage;
}
