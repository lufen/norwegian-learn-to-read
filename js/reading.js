/**
 * Decodable mini-books — short texts built from a small, known letter set.
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
    const question = createQuestion(page);
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
              <h3>${question.prompt}</h3>
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
    container.querySelector(".reading-questions").addEventListener("click", (event) => {
      const button = event.target.closest(".reading-choice");
      if (!button) return;
      const feedback = button.closest(".reading-question").querySelector(".reading-feedback");
      const correct = button.dataset.choice === question.answer;
      feedback.className = `feedback reading-feedback ${correct ? "feedback-correct" : "feedback-incorrect"}`;
      feedback.textContent = correct ? "Ja! Du fant riktig. You found it!" : "Prøv igjen. Try again.";
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
  }

  function savePosition() {
    window.NorwegianProgress.saveActivityState("reading", { bookIndex, pageIndex });
  }

  function createQuestion(page) {
    const source = page.questions[Math.floor(Math.random() * page.questions.length)];
    return {
      prompt: source.prompt,
      answer: source.answer,
      choices: shuffle(source.choices)
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
