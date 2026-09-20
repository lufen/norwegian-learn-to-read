/**
 * Decodable mini-books — short texts built from a small, known letter set.
 *
 * Comprehension questions are generated from each book's own small
 * `wordBank` using two fixed, audio-backed templates ("Finn ordet" /
 * "Pek på bildet"). This keeps every question fully decodable (no
 * surprise vocabulary), predictable in structure (so a child recognizes
 * the pattern instead of parsing a new sentence each time), and safe for
 * independent play since the prompt itself is always spoken aloud.
 */

const ReadingPage = (() => {
  let bookIndex = 0;
  let pageIndex = 0;
  let questionNumber = 0;

  function render(container) {
    const saved = window.NorwegianProgress.getActivityState("reading");
    bookIndex = Number.isInteger(saved.bookIndex) ? saved.bookIndex : bookIndex;
    pageIndex = Number.isInteger(saved.pageIndex) ? saved.pageIndex : pageIndex;
    bookIndex = Math.min(bookIndex, window.DECODABLE_BOOKS.length - 1);
    pageIndex = Math.min(pageIndex, window.DECODABLE_BOOKS[bookIndex].pages.length - 1);
    savePosition();
    const book = window.DECODABLE_BOOKS[bookIndex];
    const page = book.pages[pageIndex];
    const question = createQuestion(book, page);
    questionNumber += 1;
    container.innerHTML = `
      <div class="page-header">
        <h2>Les en liten bok — Read a little book</h2>
        <p>Start with one word, then try tiny sentences and stories.</p>
      </div>
      <div class="reading-card">
        <div class="reading-book-picker">
          ${window.DECODABLE_BOOKS.map((item, index) => `
            <button type="button" class="btn btn-level${index === bookIndex ? " active" : ""}" data-book="${index}">
              <span class="book-icon" aria-hidden="true">${item.icon || "📖"}</span>
              ${item.title}<small>${item.level || ""}</small>
            </button>
          `).join("")}
        </div>
        <div class="reading-page" aria-live="polite">
          <div class="reading-picture" aria-hidden="true">${page.picture}</div>
          <p class="reading-sentence" id="reading-sentence">${page.text}</p>
          <div class="detail-actions">
            <button type="button" class="btn" id="read-sentence">🔊 Read it</button>
            <button type="button" class="btn btn-secondary" id="sound-words">🔤 Sound it out</button>
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
          <button type="button" class="btn btn-secondary" id="new-question">🔄 New question</button>
        </div>
        <div class="nav-buttons">
          <button type="button" class="btn btn-outline" id="previous-page">⟵ Previous</button>
          <span class="reading-page-count">Page ${pageIndex + 1} of ${book.pages.length}</span>
          <button type="button" class="btn btn-outline" id="next-page">Next ⟶</button>
        </div>
      </div>
    `;

    container.querySelectorAll("[data-book]").forEach((button) => {
      button.addEventListener("click", () => {
        bookIndex = Number(button.dataset.book);
        pageIndex = 0;
        questionNumber = 0;
        savePosition();
        render(container);
      });
    });
    container.querySelector("#read-sentence").addEventListener("click", () => {
      window.NorwegianAudio.speak(page.text);
    });
    container.querySelector("#sound-words").addEventListener("click", () => {
      page.text.split(/\s+/).forEach((word, index) => {
        window.setTimeout(() => window.NorwegianAudio.speak(word.replace(/[.?!]/g, "")), index * 450);
      });
    });
    container.querySelector("#replay-prompt").addEventListener("click", () => {
      window.NorwegianAudio.speak(question.spokenPrompt);
    });
    container.querySelector(".reading-questions").addEventListener("click", (event) => {
      const button = event.target.closest(".reading-choice");
      if (!button) return;
      const feedback = button.closest(".reading-question").querySelector(".reading-feedback");
      const correct = button.dataset.choice === question.answer;
      feedback.className = `feedback reading-feedback ${correct ? "feedback-correct" : "feedback-incorrect"}`;
      feedback.textContent = correct ? "🎉 Riktig! Du fant det!" : "Ikke helt — prøv igjen.";
    });
    container.querySelector("#new-question").addEventListener("click", () => render(container));
    container.querySelector("#previous-page").addEventListener("click", () => {
      pageIndex = (pageIndex - 1 + book.pages.length) % book.pages.length;
      questionNumber = 0;
      savePosition();
      render(container);
    });
    container.querySelector("#next-page").addEventListener("click", () => {
      pageIndex = (pageIndex + 1) % book.pages.length;
      questionNumber = 0;
      savePosition();
      render(container);
    });

    // Read the sentence, then the question prompt, aloud automatically so a
    // child can complete the page by listening alone, without needing an
    // adult to read anything out loud for them.
    window.NorwegianAudio.speak(page.text);
    window.setTimeout(() => window.NorwegianAudio.speak(question.spokenPrompt), 900);
  }

  function savePosition() {
    window.NorwegianProgress.saveActivityState("reading", { bookIndex, pageIndex });
  }

  /**
   * Build one of two decodable, audio-backed question types from the book's
   * own word bank: matching a spoken word to its printed form, or matching
   * a spoken word to its picture. Distractors are always drawn from the
   * same book's word bank, so nothing undecodable ever appears.
   */
  function createQuestion(book, page) {
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
