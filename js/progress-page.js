/**
 * Progress summary page.
 */

const ProgressPage = (() => {
  let introSpoken = false;

  function render(container) {
    container.innerHTML = "";

    const summary = window.NorwegianProgress.getSummary();
    const totalLetters = window.NORWEGIAN_LETTERS.length;
    const totalWords = window.WORD_LEVELS.slice(1).reduce((sum, l) => sum + l.words.length, 0);
    const recognizedCount = window.NorwegianProgress.getJourneyMasteredLetters(3).length;
    const activity = (name) => window.NorwegianProgress.getActivityState(name);
    const count = (entries) => Object.values(entries || {}).filter(Boolean).length;
    const writing = activity("writing");
    const completed = Object.values(writing.completed || {});
    const helped = completed.filter((entry) => entry.withHelp > 0).length;
    const withoutExtraHelp = completed.filter((entry) => entry.withoutExtraHelp > 0).length;
    const reading = Object.values(activity("reading").wordStats || {});

    const heading = document.createElement("div");
    heading.className = "page-header";
    heading.innerHTML = `
      <h2>Min Fremgang — My Progress</h2>
      <p>Se hva du har øvd på. Vi lærer litt om gangen.</p>
      ${window.SoundButton.html({ kind: "word", value: "Se hva du har øvd på. Vi lærer litt om gangen.", label: "Hør" })}
    `;
    container.appendChild(heading);

    if (!introSpoken) {
      introSpoken = true;
      window.NorwegianAudio.speak("Se hva du har øvd på.");
    }

    const stats = document.createElement("div");
    stats.className = "progress-stats";
    stats.innerHTML = `
      <div class="progress-card">
        <div class="progress-number">${recognizedCount} / ${totalLetters}</div>
        <div class="progress-label">Bokstaver kjent igjen minst tre ganger i reisen</div>
        <p>Gjentatt gjenkjenning, ikke en prøve på varig læring.</p>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${(recognizedCount / totalLetters) * 100}%"></div></div>
      </div>
      <div class="progress-card">
        <div class="progress-number">${count(activity("alphabet").practiced)}</div>
        <div class="progress-label">Bokstavlyder du sier du har øvd på</div>
      </div>
      <div class="progress-card">
        <div class="progress-number">${count(activity("handwriting").practiced)}</div>
        <div class="progress-label">Bokstaver du sier du har skrevet på papir</div>
      </div>
      <div class="progress-card">
        <div class="progress-number">${count(activity("spelling").selfReported)}</div>
        <div class="progress-label">Ord du sier du har prøvd å lese</div>
      </div>
      <div class="progress-card">
        <div class="progress-number">${completed.length} / ${count(writing.practiced)}</div>
        <div class="progress-label">Ulike ord bygget ferdig / vist i ordbygging</div>
        <p>${helped} med ekstra hjelp · ${withoutExtraHelp} uten ekstra hjelp.</p>
        <p>Et ord kan stå i begge grupper etter flere økter. Ordbygging gir løpende støtte, ikke bevis på selvstendig lesing.</p>
      </div>
      <div class="progress-card">
        <div class="progress-number">${reading.filter((entry) => entry.independent > 0).length} / ${reading.filter((entry) => entry.withHelp > 0).length}</div>
        <div class="progress-label">Ulike skrevne ord funnet uten / med ekstra hjelp i småbøkene</div>
        <p>${reading.filter((entry) => entry.recognizedOnly > 0).length} ord koblet til bilde. Dette er gjenkjenning, ikke en leseprøve.</p>
      </div>
      <div class="progress-card">
        <div class="progress-number">${summary.letterCount} / ${totalLetters}</div>
        <div class="progress-label">Tidligere egenrapporterte bokstaver (eldre versjon)</div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${(summary.letterCount / totalLetters) * 100}%"></div></div>
      </div>
      <div class="progress-card">
        <div class="progress-number">${summary.wordCount} / ${totalWords}</div>
        <div class="progress-label">Tidligere ordmarkeringer (eldre versjon)</div>
        <p>Disse blandet egenrapportering og ordbygging. De er bevart, men viser ikke sikker lesing.</p>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${(summary.wordCount / totalWords) * 100}%"></div></div>
      </div>
    `;
    container.appendChild(stats);

    const resetWrap = document.createElement("div");
    resetWrap.className = "detail-actions";
    resetWrap.innerHTML = `<button type="button" class="btn btn-outline" id="reset-progress">Nullstill fremgang</button>`;
    container.appendChild(resetWrap);
    const active = window.PracticeSession.scope(container);

    resetWrap.querySelector("#reset-progress").addEventListener("click", () => {
      window.ChildConfirm.show({
        message: "Slette all fremgang? Alle stjernene forsvinner.",
        spokenMessage: "Er du sikker på at du vil slette alt? Da forsvinner alle stjernene dine.",
        confirmLabel: "🗑️ Slett alt",
        cancelLabel: "↩️ Behold fremgangen",
        onConfirm: () => {
          if (!active()) return;
          window.NorwegianProgress.reset();
          render(container);
        }
      });
    });
  }

  return { render };
})();

if (typeof window !== "undefined") {
  window.ProgressPage = ProgressPage;
}
