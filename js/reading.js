/**
 * Decodable mini-books — short texts built from a small, known word bank.
 *
 * Design (see docs/little-books-design.md for the full write-up and the
 * teacher-review findings it responds to):
 * - Print is visible while a spoken prompt asks for word or picture
 *   recognition. Sentence audio and word support are always available on
 *   request, never forced or withheld by level.
 * - A wrong answer offers recorded sounds, or a slow spoken word when
 *   recordings are unavailable, as well as a manual retry.
 * - Books are sequenced and unlock one at a time, like Letter Journey.
 * - Progress describes spoken-word/print matching, not proven decoding.
 * - Finishing a book shows a calm summary and a real stopping point instead
 *   of looping straight into more questions.
 */

const ReadingPage = (() => {
  const DEFAULT_STATE = { bookIndex: 0, pageIndex: 0, unlockedCount: 1, wordStats: {} };

  let bookIndex = 0;
  let pageIndex = 0;
  let unlockedCount = 1;
  let wordStats = {};
  // Cumulative evidence is separate from replay coverage; legacy unlocks
  // and word statistics are never treated as completed pages or passes.
  let bookProgress = {};
  let bookPasses = {};
  let questionNumber = 0;
  let question = null;
  let helpUsedThisAttempt = false;
  let showingSummary = false;
  let viewActive = () => false;

  function loadState() {
    const saved = window.NorwegianProgress.getActivityState("reading");
    bookIndex = Number.isInteger(saved.bookIndex) ? saved.bookIndex : DEFAULT_STATE.bookIndex;
    pageIndex = Number.isInteger(saved.pageIndex) ? saved.pageIndex : DEFAULT_STATE.pageIndex;
    unlockedCount = Number.isInteger(saved.unlockedCount) ? saved.unlockedCount : DEFAULT_STATE.unlockedCount;
    wordStats = saved.wordStats && typeof saved.wordStats === "object" ? saved.wordStats : {};
    bookProgress = {};
    bookPasses = {};
    window.DECODABLE_BOOKS.forEach((book) => {
      const validPages = (pages) => [...new Set(Array.isArray(pages) ? pages.filter((index) =>
        Number.isInteger(index) && index >= 0 && index < book.pages.length) : [])].sort((a, b) => a - b);
      const evidence = saved.bookProgress && saved.bookProgress[book.id];
      const completedPages = validPages(evidence && evidence.completedPages);
      const completions = evidence && Number.isSafeInteger(evidence.completions) && evidence.completions >= 0 &&
        completedPages.length === book.pages.length ? evidence.completions : 0;
      bookProgress[book.id] = { completedPages, completions };
      const pass = saved.bookPasses && saved.bookPasses[book.id];
      const passPages = pass ? validPages(pass.completedPages).filter((index) => completedPages.includes(index))
        : completedPages.slice();
      bookPasses[book.id] = {
        completedPages: passPages,
        counted: passPages.length === book.pages.length && completions > 0 && (!pass || pass.counted === true)
      };
    });
    unlockedCount = Math.max(1, Math.min(unlockedCount, window.DECODABLE_BOOKS.length));
    bookIndex = Math.max(0, Math.min(bookIndex, unlockedCount - 1));
    pageIndex = Math.max(0, Math.min(pageIndex, window.DECODABLE_BOOKS[bookIndex].pages.length - 1));
  }

  function saveState() {
    window.NorwegianProgress.saveActivityState("reading", {
      bookIndex, pageIndex, unlockedCount, wordStats, bookProgress, bookPasses
    });
  }

  function completePage(book) {
    const evidence = bookProgress[book.id];
    const pass = bookPasses[book.id];
    [evidence, pass].forEach((entry) => {
      if (!entry.completedPages.includes(pageIndex)) {
        entry.completedPages.push(pageIndex);
        entry.completedPages.sort((a, b) => a - b);
      }
    });
    if (pass.completedPages.length === book.pages.length && !pass.counted) {
      evidence.completions = Math.min(Number.MAX_SAFE_INTEGER, evidence.completions + 1);
      pass.counted = true;
      unlockedCount = Math.max(unlockedCount, Math.min(bookIndex + 2, window.DECODABLE_BOOKS.length));
    }
    saveState();
  }

  function soundOutLabel(word) {
    return window.NorwegianAudio.canSoundOut && window.NorwegianAudio.canSoundOut(word)
      ? "Hør lydene" : "Hør ordet sakte";
  }

  function restartCompletedPass(book) {
    if (!bookPasses[book.id].counted) return false;
    bookPasses[book.id] = { completedPages: [], counted: false };
    pageIndex = 0;
    return true;
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
    const entering = !viewActive();
    if (entering) {
      question = null;
      showingSummary = false;
      questionNumber = 0;
    }
    loadState();
    const book = window.DECODABLE_BOOKS[bookIndex];
    if (entering && restartCompletedPass(book)) saveState();
    const page = book.pages[pageIndex];
    const isLastPage = pageIndex === book.pages.length - 1;

    if (showingSummary && bookPasses[book.id].completedPages.length === book.pages.length) {
      renderSummary(container, book);
      return;
    }
    showingSummary = false;

    if (!question) {
      question = createQuestion(book, page, isLastPage);
      questionNumber += 1;
      helpUsedThisAttempt = false;
    }

    container.innerHTML = `
      <div class="page-header">
        <h2>Les en liten bok — Read a little book</h2>
        <p>Se på ordene. Du kan få hjelp når du vil.</p>
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
          <p class="reading-hint">Prøv å lese. Du kan alltid få hjelp. 🤗</p>
          <div class="detail-actions">
            ${window.SoundButton.html({ kind: "word", value: page.text, label: "Hør setningen", id: "read-sentence" })}
            ${window.SoundButton.html({ kind: "sound-out", value: page.keyword, label: soundOutLabel(page.keyword), variant: "secondary", id: "sound-words" })}
          </div>
          <div class="reading-questions">
            <section class="reading-question">
              <p class="reading-question-count">Oppgave ${questionNumber}</p>
              <div class="reading-prompt">
                ${window.SoundButton.html({ kind: "word", value: question.spokenPrompt, variant: "icon", id: "replay-prompt", ariaLabel: "Hør oppgaven" })}
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
          <button type="button" class="btn btn-outline" id="previous-page" ${pageIndex === 0 ? "disabled" : ""}>⟵ Forrige</button>
          <span class="reading-page-count">Side ${pageIndex + 1} av ${book.pages.length}</span>
          <button type="button" class="btn btn-outline" id="next-page" ${isLastPage ? "disabled" : ""}>Neste ⟶</button>
        </div>
      </div>
    `;
    const active = window.PracticeSession.scope(container);
    viewActive = active;
    const asked = question;
    let answering = false;
    let answered = false;
    window.setTimeout(() => {
      if (active() && question === asked && !answered) window.NorwegianAudio.speak(asked.spokenPrompt);
    }, 400);

    container.querySelectorAll("[data-book]").forEach((button) => {
      if (button.disabled) return;
      button.addEventListener("click", () => {
        if (!active()) return;
        bookIndex = Number(button.dataset.book);
        pageIndex = 0;
        restartCompletedPass(window.DECODABLE_BOOKS[bookIndex]);
        question = null;
        showingSummary = false;
        saveState();
        render(container);
      });
    });
    // The buttons themselves play their sound (SoundButton handles that
    // globally); these listeners only record that help was asked for.
    ["#read-sentence", "#sound-words"].forEach((selector) => {
      container.querySelector(selector).addEventListener("click", () => {
        if (active() && !answered) helpUsedThisAttempt = true;
      });
    });
    container.querySelector(".reading-questions").addEventListener("click", (event) => {
      const button = event.target.closest(".reading-choice");
      if (!button || button.disabled || !active() || answering || answered) return;
      answering = true;
      // Disable all choices the instant a tap lands, before the ~1.1s
      // "correct" pause — otherwise excited/rapid tapping during that
      // window can register as answers to the next rendered question and
      // skip a page.
      container.querySelectorAll(".reading-choice").forEach((btn) => { btn.disabled = true; });
      const feedback = button.closest(".reading-question").querySelector(".reading-feedback");
      const correct = button.dataset.choice === question.answer;
      if (correct) {
        answered = true;
        feedback.className = "feedback reading-feedback feedback-correct";
        feedback.textContent = question.type === "picture"
          ? "🎉 Du fant riktig bilde!"
          : (helpUsedThisAttempt ? "🎉 Du fant ordet med hjelp!" : "🎉 Du fant riktig ord!");
        // Picture-matching only checks that a spoken word was understood,
        // not that the child decoded any print — don't count it toward
        // "read without help".
        recordAttempt(question.answerWord, true, helpUsedThisAttempt, question.type !== "picture");
        completePage(book);
        window.setTimeout(() => {
          // Abort if the active profile changed (or progress was reset)
          // while this was pending, so we never write one child's session
          // into another's storage or force-navigate them away.
          if (!active() || question !== asked) return;
          const unanswered = book.pages.findIndex((_, index) => !bookPasses[book.id].completedPages.includes(index));
          if (unanswered === -1) {
            showingSummary = true;
          } else if (isLastPage) {
            feedback.insertAdjacentHTML("beforeend", `
              <p>Du har flere sider å øve på før boka er ferdig.</p>
              <button type="button" class="btn" data-unanswered>Gå til side ${unanswered + 1}</button>`);
            feedback.querySelector("[data-unanswered]").addEventListener("click", () => {
              if (!active() || question !== asked) return;
              pageIndex = unanswered;
              question = null;
              saveState();
              render(container);
            });
            return;
          } else {
            pageIndex += 1;
            question = null;
          }
          saveState();
          render(container);
        }, 1100);
      } else {
        feedback.className = "feedback reading-feedback feedback-incorrect";
        feedback.innerHTML = `${soundOutLabel(question.answerWord)}. Prøv igjen.
          ${window.SoundButton.html({ kind: "sound-out", value: question.answerWord, label: soundOutLabel(question.answerWord) })}
          <button type="button" class="btn btn-outline" data-retry>Prøv igjen</button>`;
        helpUsedThisAttempt = true;
        // Audio may be unavailable; the manual retry always remains available.
        const retry = () => {
          if (!active() || question !== asked || answered) return;
          answering = false;
          container.querySelectorAll(".reading-choice").forEach((btn) => { btn.disabled = false; });
        };
        feedback.querySelector("[data-retry]").addEventListener("click", retry);
        soundOutWord(question.answerWord, retry);
      }
    });
    container.querySelector("#previous-page").addEventListener("click", () => {
      if (!active() || pageIndex === 0) return;
      pageIndex -= 1;
      question = null;
      saveState();
      render(container);
    });
    const nextButton = container.querySelector("#next-page");
    if (nextButton && !nextButton.disabled) {
      nextButton.addEventListener("click", () => {
        if (!active()) return;
        pageIndex += 1;
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
        return `<li>${word} — ingen svar registrert ennå</li>`;
      }
      if (stat.independent > 0) {
        return `<li>${word} — fant skrevet ord uten ekstra hjelp ✅</li>`;
      }
      if (stat.withHelp > 0) {
        return `<li>${word} — fant skrevet ord med hjelp 🧩</li>`;
      }
      return `<li>${word} — fant bildet 👀</li>`;
    });
    container.innerHTML = `
      <div class="page-header">
        <h2>Flott jobbet! — Great work!</h2>
        <p>Registrerte svar i «${book.title}», også fra tidligere økter:</p>
      </div>
      <div class="reading-card reading-summary">
        <ul class="reading-summary-list">${lines.join("")}</ul>
        <p class="reading-hint">Dette viser ord- og bildegjenkjenning, ikke sikker lesing. Les gjerne med en voksen.</p>
        ${window.SoundButton.html({ kind: "word", value: "Flott øvd! Vil du lese igjen eller ta en pause?", label: "Hør" })}
        <div class="detail-actions">
          <button type="button" class="btn btn-secondary" id="summary-replay">🔁 Les igjen</button>
          <button type="button" class="btn" id="summary-continue">Fortsett ➡️</button>
          <button type="button" class="btn btn-outline" id="summary-home">🏠 Ta en pause</button>
        </div>
      </div>
    `;
    const active = window.PracticeSession.scope(container);
    viewActive = active;
    container.querySelector("#summary-replay").addEventListener("click", () => {
      if (!active()) return;
      bookPasses[book.id] = { completedPages: [], counted: false };
      pageIndex = 0;
      question = null;
      showingSummary = false;
      saveState();
      render(container);
    });
    container.querySelector("#summary-continue").addEventListener("click", () => {
      if (!active()) return;
      const hasNextBook = bookIndex + 1 < window.DECODABLE_BOOKS.length;
      bookIndex = hasNextBook ? bookIndex + 1 : bookIndex;
      pageIndex = 0;
      restartCompletedPass(window.DECODABLE_BOOKS[bookIndex]);
      question = null;
      showingSummary = false;
      saveState();
      render(container);
    });
    container.querySelector("#summary-home").addEventListener("click", () => {
      if (!active()) return;
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
   * question. Matching a spoken target to print is still recognition
   * evidence, not proof that the child decoded independently.
   */
  function createQuestion(book, page, isLastPage) {
    if (isLastPage && book.transferWord) {
      const bank = book.wordBank || {};
      const distractors = shuffle(Object.keys(bank)).slice(0, 2);
      const choices = shuffle([book.transferWord.word, ...distractors]);
      return {
        prompt: "Finn det nye ordet.",
        spokenPrompt: `Finn det nye ordet ${book.transferWord.word}.`,
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
