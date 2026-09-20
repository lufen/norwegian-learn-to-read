/**
 * Letter tracing — a forgiving touch/mouse activity for forming letters.
 */

const HandwritingPage = (() => {
  let letterIndex = 0;
  let drawing = false;
  let points = [];

  function render(container) {
    const saved = window.NorwegianProgress.getActivityState("handwriting");
    letterIndex = Number.isInteger(saved.letterIndex) ? saved.letterIndex : letterIndex;
    letterIndex = Math.min(letterIndex, window.NORWEGIAN_LETTERS.length - 1);
    savePosition();
    const entry = window.NORWEGIAN_LETTERS[letterIndex];
    container.innerHTML = `
      <div class="page-header">
        <h2>Skriv bokstaven — Write the letter</h2>
        <p>Trace the big letter, then try it by yourself.</p>
      </div>
      <div class="handwriting-card">
        <div class="handwriting-letter">${entry.letter}</div>
        <p class="sound-hint">The sound is <strong>${entry.phoneme || entry.sound}</strong>.</p>
        <canvas id="trace-canvas" class="trace-canvas" width="420" height="260" aria-label="Trace the letter"></canvas>
        <div class="detail-actions">
          <button type="button" class="btn" id="hear-letter">🔊 Hear it</button>
          <button type="button" class="btn btn-secondary" id="clear-trace">Try again</button>
        </div>
        <div class="feedback" id="trace-feedback" aria-live="polite">Follow the pale letter with your finger.</div>
        <div class="nav-buttons">
          <button type="button" class="btn btn-outline" id="previous-letter">⟵ Previous</button>
          <button type="button" class="btn btn-outline" id="next-letter">Next ⟶</button>
        </div>
      </div>
    `;

    const canvas = container.querySelector("#trace-canvas");
    const context = canvas.getContext("2d");
    drawGuide(context, entry.letter);

    const position = (event) => {
      const rect = canvas.getBoundingClientRect();
      const source = event.touches ? event.touches[0] : event;
      return {
        x: ((source.clientX - rect.left) / rect.width) * canvas.width,
        y: ((source.clientY - rect.top) / rect.height) * canvas.height
      };
    };
    const start = (event) => {
      event.preventDefault();
      drawing = true;
      points = [position(event)];
    };
    const move = (event) => {
      if (!drawing) return;
      event.preventDefault();
      const next = position(event);
      const previous = points[points.length - 1];
      points.push(next);
      context.strokeStyle = "#002868";
      context.lineWidth = 8;
      context.lineCap = "round";
      context.beginPath();
      context.moveTo(previous.x, previous.y);
      context.lineTo(next.x, next.y);
      context.stroke();
    };
    const end = () => {
      if (!drawing) return;
      drawing = false;
      const feedback = container.querySelector("#trace-feedback");
      feedback.className = `feedback ${points.length > 12 ? "feedback-correct" : "feedback-incorrect"}`;
      feedback.textContent = points.length > 12
        ? "Bra skrevet! Nice writing!"
        : "Draw a little more of the letter.";
    };
    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseup", end);
    canvas.addEventListener("mouseleave", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);
    container.querySelector("#hear-letter").addEventListener("click", () => {
      window.NorwegianAudio.speak(entry.letter.toLowerCase());
    });
    container.querySelector("#clear-trace").addEventListener("click", () => render(container));
    container.querySelector("#previous-letter").addEventListener("click", () => {
      letterIndex = (letterIndex - 1 + window.NORWEGIAN_LETTERS.length) % window.NORWEGIAN_LETTERS.length;
      savePosition();
      render(container);
    });
    container.querySelector("#next-letter").addEventListener("click", () => {
      letterIndex = (letterIndex + 1) % window.NORWEGIAN_LETTERS.length;
      savePosition();
      render(container);
    });
  }

  function savePosition() {
    window.NorwegianProgress.saveActivityState("handwriting", { letterIndex });
  }

  function drawGuide(context, letter) {
    context.clearRect(0, 0, 420, 260);
    context.fillStyle = "#f7f8fc";
    context.fillRect(0, 0, 420, 260);
    context.strokeStyle = "#dfe4f7";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(24, 210);
    context.lineTo(396, 210);
    context.stroke();
    context.font = "190px Segoe UI, Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#dfe4f7";
    context.fillText(letter, 210, 125);
  }

  return { render };
})();

if (typeof window !== "undefined") {
  window.HandwritingPage = HandwritingPage;
}
