/**
 * Write Letters — instead of asking the child to draw on the screen, this
 * page *animates* the correct stroke order/direction for each letter so a
 * grown-up or child can watch it, then copy the letter onto real paper with
 * a pencil. This matches how handwriting is actually taught: a real pencil
 * on paper builds the motor skill; a screen animation is best used only to
 * demonstrate the correct strokes.
 */

const HandwritingPage = (() => {
  const CANVAS_WIDTH = 420;
  const CANVAS_HEIGHT = 260;
  const BOX = { x: 40, y: 15, width: 340, height: 225 }; // maps the 0-100 letter grid onto the canvas
  const STROKE_DURATION_MS = 850;
  const PAUSE_BETWEEN_STROKES_MS = 350;

  let letterIndex = 0;
  let animationFrame = null;
  let animationToken = 0;
  let introSpoken = false;

  function render(container) {
    stopAnimation();
    const saved = window.NorwegianProgress.getActivityState("handwriting");
    letterIndex = Number.isInteger(saved.letterIndex) ? saved.letterIndex : letterIndex;
    letterIndex = Math.min(Math.max(letterIndex, 0), window.NORWEGIAN_LETTERS.length - 1);
    savePosition();
    const practiced = saved.practiced || {};
    const entry = window.NORWEGIAN_LETTERS[letterIndex];
    const alreadyPracticed = !!practiced[entry.letter];

    container.innerHTML = `
      <div class="page-header">
        <h2>Skriv bokstaven — Write the letter</h2>
        <p>Watch how the letter is written, then pick up a pencil and write it on paper.</p>
      </div>
      <div class="handwriting-card">
        <div class="handwriting-letter">${entry.letter}</div>
        <p class="sound-hint">The sound is <strong>${entry.phoneme || entry.sound}</strong>.</p>
        <canvas id="trace-canvas" class="trace-canvas" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" aria-label="Animated demonstration of how to write the letter ${entry.letter}"></canvas>
        <p class="hint" id="stroke-hint">Get a pencil and paper ready, then press play.</p>
        <div class="detail-actions">
          <button type="button" class="btn" id="hear-letter">🔊 Hear it</button>
          <button type="button" class="btn btn-secondary" id="replay-trace">▶ Watch again</button>
        </div>
        <div class="feedback ${alreadyPracticed ? "feedback-correct" : ""}" id="trace-feedback" aria-live="polite">
          ${alreadyPracticed ? "✅ Marked as practiced on paper. Nice work!" : "Write the letter on your paper, then tell the game you did it."}
        </div>
        <div class="detail-actions">
          <button type="button" class="btn btn-secondary" id="mark-practiced">✏️ I wrote it on paper!</button>
        </div>
        <div class="nav-buttons">
          <button type="button" class="btn btn-outline" id="previous-letter">⟵ Previous</button>
          <button type="button" class="btn btn-outline" id="next-letter">Next ⟶</button>
        </div>
      </div>
    `;

    const canvas = container.querySelector("#trace-canvas");
    const context = canvas.getContext("2d");

    if (!introSpoken) {
      introSpoken = true;
      window.NorwegianAudio.speak("Se hvordan bokstaven skrives, og øv med blyant på papir.");
    }

    container.querySelector("#hear-letter").addEventListener("click", () => {
      window.NorwegianAudio.speak(entry.spokenSound || entry.letter.toLowerCase());
    });
    container.querySelector("#replay-trace").addEventListener("click", () => {
      playAnimation(context, entry, container);
    });
    container.querySelector("#mark-practiced").addEventListener("click", () => {
      const current = window.NorwegianProgress.getActivityState("handwriting");
      const updatedPracticed = Object.assign({}, current.practiced, { [entry.letter]: true });
      window.NorwegianProgress.saveActivityState("handwriting", { letterIndex, practiced: updatedPracticed });
      const feedback = container.querySelector("#trace-feedback");
      feedback.className = "feedback feedback-correct";
      feedback.textContent = "✅ Marked as practiced on paper. Nice work!";
    });
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

    drawStatic(context, entry);
    playAnimation(context, entry, container);
  }

  function savePosition() {
    const current = window.NorwegianProgress.getActivityState("handwriting");
    window.NorwegianProgress.saveActivityState("handwriting", Object.assign({}, current, { letterIndex }));
  }

  function toCanvasPoint(point) {
    return {
      x: BOX.x + (point.x / 100) * BOX.width,
      y: BOX.y + (point.y / 100) * BOX.height
    };
  }

  function getStrokes(entry) {
    const raw = (window.LETTER_STROKES && window.LETTER_STROKES[entry.letter]) || [];
    return raw.map((stroke) => stroke.map(toCanvasPoint));
  }

  function drawBackground(context) {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.fillStyle = "#f7f8fc";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // baseline
    const baseline = toCanvasPoint({ x: 0, y: 90 }).y;
    context.strokeStyle = "#dfe4f7";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(BOX.x - 10, baseline);
    context.lineTo(BOX.x + BOX.width + 10, baseline);
    context.stroke();
  }

  /** Draw the full pale letter outline as a reference, without strokes highlighted. */
  function drawStatic(context, entry) {
    drawBackground(context);
    const strokes = getStrokes(entry);
    context.strokeStyle = "#c9d2f2";
    context.lineWidth = 10;
    context.lineCap = "round";
    context.lineJoin = "round";
    strokes.forEach((stroke) => {
      context.beginPath();
      stroke.forEach((point, index) => {
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });
      context.stroke();
    });
  }

  function pathLength(points) {
    let total = 0;
    for (let i = 1; i < points.length; i += 1) {
      total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    }
    return total;
  }

  function pointAtDistance(points, distance) {
    let remaining = distance;
    for (let i = 1; i < points.length; i += 1) {
      const segLength = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
      if (remaining <= segLength || i === points.length - 1) {
        const t = segLength === 0 ? 0 : remaining / segLength;
        return {
          x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
          y: points[i - 1].y + (points[i].y - points[i - 1].y) * t
        };
      }
      remaining -= segLength;
    }
    return points[points.length - 1];
  }

  function playAnimation(context, entry, container) {
    stopAnimation();
    const token = (animationToken += 1);
    const strokes = getStrokes(entry);
    const hint = container.querySelector("#stroke-hint");
    drawStatic(context, entry);

    let strokeIndex = 0;

    function runStroke() {
      if (token !== animationToken) return;
      if (strokeIndex >= strokes.length) {
        if (hint) hint.textContent = "That's the whole letter! Now try it yourself on paper.";
        return;
      }
      const stroke = strokes[strokeIndex];
      const total = pathLength(stroke);
      const startedAt = performance.now();
      if (hint) {
        hint.textContent = strokes.length > 1
          ? `Stroke ${strokeIndex + 1} of ${strokes.length}: follow the moving dot.`
          : "Follow the moving dot.";
      }

      function step(now) {
        if (token !== animationToken) return;
        const elapsed = now - startedAt;
        const progress = Math.min(1, elapsed / STROKE_DURATION_MS);
        const distance = total * progress;
        const point = pointAtDistance(stroke, distance);

        drawStatic(context, entry);
        // redraw completed strokes solid
        for (let i = 0; i < strokeIndex; i += 1) {
          drawStrokeSegment(context, strokes[i]);
        }
        // draw current stroke progress
        drawStrokeUpTo(context, stroke, distance);
        // draw the pen dot + stroke number badge at the start
        drawPenDot(context, point);
        drawStrokeBadge(context, stroke[0], strokeIndex + 1);

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(step);
        } else {
          strokeIndex += 1;
          animationFrame = window.setTimeout(() => window.requestAnimationFrame(runStroke), PAUSE_BETWEEN_STROKES_MS);
        }
      }

      animationFrame = window.requestAnimationFrame(step);
    }

    runStroke();
  }

  function drawStrokeSegment(context, points) {
    context.strokeStyle = "#002868";
    context.lineWidth = 9;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    points.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    });
    context.stroke();
  }

  function drawStrokeUpTo(context, points, distance) {
    let remaining = distance;
    const path = [points[0]];
    for (let i = 1; i < points.length && remaining > 0; i += 1) {
      const segLength = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
      if (remaining >= segLength) {
        path.push(points[i]);
        remaining -= segLength;
      } else {
        const t = segLength === 0 ? 0 : remaining / segLength;
        path.push({
          x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
          y: points[i - 1].y + (points[i].y - points[i - 1].y) * t
        });
        remaining = 0;
      }
    }
    drawStrokeSegment(context, path);
  }

  function drawPenDot(context, point) {
    context.fillStyle = "#ef2b2d";
    context.beginPath();
    context.arc(point.x, point.y, 8, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#ffffff";
    context.lineWidth = 2;
    context.stroke();
  }

  function drawStrokeBadge(context, startPoint, number) {
    context.fillStyle = "#ef2b2d";
    context.beginPath();
    context.arc(startPoint.x - 14, startPoint.y - 14, 10, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#ffffff";
    context.font = "bold 13px Segoe UI, Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(String(number), startPoint.x - 14, startPoint.y - 13);
  }

  function stopAnimation() {
    animationToken += 1;
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(animationFrame);
      animationFrame = null;
    }
  }

  return { render };
})();

if (typeof window !== "undefined") {
  window.HandwritingPage = HandwritingPage;
}
