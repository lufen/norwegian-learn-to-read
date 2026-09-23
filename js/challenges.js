/**
 * Five short, untimed listening/picture activities. Replays are always free;
 * only explicit hints and unsuccessful attempts mark a round as supported.
 */
const ChallengesPage = (() => {
  const MODES = [
    { id: "sound", icon: "🔎", title: "Finn første lyd", instruction: "Lytt til lyden. Velg bildet som begynner med lyden." },
    { id: "rhyme", icon: "🏡", title: "Finn rimvennen", instruction: "Lytt til ordet. Velg bildet som rimer." },
    { id: "syllables", icon: "🪨", title: "Klapp og tell", instruction: "Si ordet og klapp stavelsene. Velg hvor mange klapp." },
    { id: "letters", icon: "🔤", title: "Bokstavvenner", instruction: "Se på den store bokstaven. Finn den lille vennen." },
    { id: "story", icon: "🌱", title: "Bilder i rekkefølge", instruction: "Hva skjer først? Trykk på bildene i rekkefølge." }
  ];
  const PICTURES = [
    { id: "sol", picture: "☀️", name: "sol", first: "S", syllables: ["sol"] },
    { id: "mus", picture: "🐭", name: "mus", first: "M", syllables: ["mus"] },
    { id: "fisk", picture: "🐟", name: "fisk", first: "F", syllables: ["fisk"] },
    { id: "rev", picture: "🦊", name: "rev", first: "R", syllables: ["rev"] },
    { id: "lam", picture: "🐑", name: "lam", first: "L", syllables: ["lam"] },
    { id: "eple", picture: "🍎", name: "eple", first: "E", syllables: ["ep", "le"] },
    { id: "banan", picture: "🍌", name: "banan", first: "B", syllables: ["ba", "nan"] },
    { id: "ugle", picture: "🦉", name: "ugle", first: "U", syllables: ["ug", "le"] },
    { id: "ananas", picture: "🍍", name: "ananas", first: "A", syllables: ["a", "na", "nas"] }
  ];
  const RHYMES = [
    { target: "sol", answer: { id: "stol", picture: "🪑", name: "stol" } },
    { target: "mus", answer: { id: "hus", picture: "🏠", name: "hus" } },
    { target: "katt", answer: { id: "hatt", picture: "🎩", name: "hatt" } },
    { target: "bil", answer: { id: "pil", picture: "⬆️", name: "pil" } },
    { target: "pose", answer: { id: "rose", picture: "🌹", name: "rose" } }
  ];
  const STORIES = [
    [
      { picture: "🫘🪴", name: "Et frø blir sådd." },
      { picture: "💧🪴", name: "Frøet får vann." },
      { picture: "🌻", name: "En blomst har vokst opp." }
    ],
    [
      { picture: "🍌", name: "En banan med skall." },
      { picture: "🤲🍌", name: "Skallet tas av bananen." },
      { picture: "😋🍌", name: "Bananen blir spist." }
    ],
    [
      { picture: "🧦🧺", name: "Sokkene er skitne." },
      { picture: "🧦🫧", name: "Sokkene blir vasket." },
      { picture: "🧦☀️", name: "De rene sokkene tørker." }
    ],
    [
      { picture: "🥚", name: "Et helt egg." },
      { picture: "🐣", name: "Egget klekker." },
      { picture: "🐥", name: "Kyllingen er ute av egget." }
    ],
    [
      { picture: "⛄", name: "En snømann står i snøen." },
      { picture: "☀️⛄", name: "Sola varmer snømannen." },
      { picture: "💧🥕", name: "Snømannen har smeltet." }
    ]
  ];
  let generation = 0;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(text, action, className = "btn") {
    const node = element("button", className, text);
    node.type = "button";
    node.addEventListener("click", action);
    return node;
  }

  function listen(value, label = "Lytt", kind = "word") {
    return window.SoundButton.create({
      kind, value, label, variant: "outline",
      ariaLabel: `${label}: ${value}`
    });
  }

  function shuffle(items) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function count(value) {
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
  }

  function loadState() {
    const saved = window.NorwegianProgress.getActivityState("challenges");
    const modes = {};
    MODES.forEach(({ id }) => {
      const entry = saved.modes && saved.modes[id] || {};
      const evidence = {};
      if (entry.evidence && typeof entry.evidence === "object") {
        Object.keys(entry.evidence).forEach((key) => {
          if (count(entry.evidence[key]) > 0) evidence[key] = count(entry.evidence[key]);
        });
      }
      modes[id] = {
        rounds: count(entry.rounds), independent: count(entry.independent),
        withHelp: count(entry.withHelp), sets: count(entry.sets), evidence
      };
    });
    const lastMode = MODES.some((mode) => mode.id === saved.lastMode) ? saved.lastMode : null;
    return { modes, lastMode };
  }

  function ready(entry) {
    return entry.independent >= 4 && Object.keys(entry.evidence).length >= 3;
  }

  function familiarLetters() {
    const journey = window.NorwegianProgress.getJourney();
    const practised = Object.keys(journey.scores).filter((letter) => journey.scores[letter] > 0);
    const pool = [...new Set([...practised, ...journey.unlocked])]
      .filter((letter) => /^[A-ZÆØÅ]$/.test(letter));
    for (const letter of ["S", "O"]) {
      if (pool.length < 2 && !pool.includes(letter)) pool.push(letter);
    }
    return pool;
  }

  function makeRound(mode, entry) {
    const harder = ready(entry);
    const size = harder ? 3 : 2;
    const index = entry.rounds;
    let question;
    if (mode === "sound") {
      const pool = PICTURES.slice(0, 5);
      const answer = pool[index % pool.length];
      question = {
        id: answer.id, target: answer.first, kind: "letter", answer: answer.id,
        choices: shuffle([answer, ...shuffle(pool.filter((item) => item.first !== answer.first)).slice(0, size - 1)]),
        hint: `${answer.name} begynner med lyden. Lytt: ${answer.name}.`
      };
    } else if (mode === "rhyme") {
      const pair = RHYMES[index % RHYMES.length];
      question = {
        id: pair.target, target: pair.target, kind: "word", answer: pair.answer.id,
        choices: shuffle([pair.answer, ...shuffle(RHYMES.filter((item) => item !== pair).map((item) => item.answer)).slice(0, size - 1)]),
        hint: `${pair.target} og ${pair.answer.name} rimer. Lytt til slutten av ordene.`
      };
    } else if (mode === "syllables") {
      const pool = harder ? [PICTURES[8], PICTURES[5], PICTURES[0], PICTURES[6], PICTURES[7]] :
        [PICTURES[0], PICTURES[5], PICTURES[1], PICTURES[6], PICTURES[7]];
      const answer = pool[index % pool.length];
      const number = answer.syllables.length;
      question = {
        id: answer.id, target: answer.name, picture: answer.picture, kind: "word",
        answer: String(number),
        choices: Array.from({ length: size }, (_, i) => ({
          id: String(i + 1), picture: "🪨".repeat(i + 1), name: `${i + 1} klapp`
        })),
        hint: `${answer.syllables.join(". ")}. ${["", "Ett", "To", "Tre"][number]} klapp.`
      };
    } else if (mode === "letters") {
      const pool = familiarLetters();
      const target = pool[index % pool.length];
      question = {
        id: target, target, kind: "letter", answer: target.toLowerCase(),
        choices: shuffle([target, ...shuffle(pool.filter((letter) => letter !== target)).slice(0, Math.min(size, pool.length) - 1)])
          .map((letter) => ({ id: letter.toLowerCase(), picture: letter.toLowerCase(), name: letter.toLowerCase(), kind: "letter" })),
        hint: `Stor ${target} og liten ${target.toLowerCase()} er bokstavvenner.`,
        visualHint: `${target} — ${target.toLowerCase()}`
      };
    } else {
      const story = STORIES[index % STORIES.length];
      const steps = (harder ? story : [story[0], story[2]]).map((step, i) => ({ ...step, id: String(i) }));
      question = {
        id: `story-${index % STORIES.length}`, order: steps.map((step) => step.id),
        choices: shuffle(steps), hint: `Først: ${steps[0].name}`
      };
    }
    return { ...question, assisted: false, done: false, selected: [], clapped: false };
  }

  function render(container) {
    const token = ++generation;
    const epoch = window.NorwegianProgress.getEpoch();
    const profile = window.NorwegianProfiles ? window.NorwegianProfiles.getActiveId() : null;
    const root = element("div", "challenges-page");
    root.lang = "nb";
    container.replaceChildren(root);
    const state = loadState();
    let mode = null;
    let round = null;
    let completed = 0;
    let independent = 0;
    let screen = 0;

    function active() {
      return token === generation && root.isConnected && container.contains(root) &&
        epoch === window.NorwegianProgress.getEpoch() &&
        (!window.NorwegianProfiles || profile === window.NorwegianProfiles.getActiveId());
    }

    function persist() {
      if (active()) window.NorwegianProgress.saveActivityState("challenges", state);
    }

    function focusHeading() {
      const heading = root.querySelector("h2");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus();
      }
    }

    function heading(title, instruction) {
      const header = element("div", "page-header");
      header.append(element("h2", "", title), element("p", "", instruction), listen(instruction, "Hør oppgaven"));
      root.append(header);
    }

    function home() {
      if (!active()) return;
      resetSession();
      if (window.App) window.App.navigate("home");
    }

    function showPicker() {
      if (!active()) return;
      screen += 1;
      mode = null;
      round = null;
      completed = 0;
      independent = 0;
      root.replaceChildren();
      heading("Små utfordringer", "Velg en lek. Vi tar fem små runder. Du kan lytte så mye du vil.");
      function choose(item) {
        if (!active() || mode) return;
        mode = item;
        state.lastMode = item.id;
        persist();
        startRound();
      }
      const previousMode = MODES.find((item) => item.id === state.lastMode);
      if (previousMode) {
        const resume = element("div", "detail-actions");
        const label = `Fortsett med ${previousMode.title.toLowerCase()}`;
        resume.append(button(`${previousMode.icon} ${label}`, () => choose(previousMode)), listen(label, "Hør valget"));
        root.append(resume);
      }
      const picker = element("div", "reading-choices");
      MODES.forEach((item) => {
        const card = element("div", "word-card");
        const choice = button(`${item.icon} ${item.title}`, () => choose(item), "reading-choice");
        card.append(choice, listen(item.title, "Hør navnet"));
        picker.append(card);
      });
      root.append(picker, button("⌂ Hjem", home, "btn btn-outline"));
    }

    function progress() {
      const dots = element("p", "challenge-progress");
      dots.setAttribute("aria-label", `${completed} av 5 runder ferdige`);
      const visual = element("span", "", Array.from({ length: 5 }, (_, i) => i < completed ? "●" : "○").join(" "));
      visual.setAttribute("aria-hidden", "true");
      dots.append(visual, element("span", "", `  ${completed} / 5`));
      return dots;
    }

    function startRound() {
      if (!active()) return;
      round = makeRound(mode.id, state.modes[mode.id]);
      showRound();
    }

    function showRound() {
      if (!active()) return;
      const currentScreen = ++screen;
      const currentRound = round;
      const valid = () => active() && screen === currentScreen && round === currentRound;
      root.replaceChildren();
      heading(`${mode.icon} ${mode.title}`, mode.instruction);
      const dots = progress();
      root.append(dots);
      const card = element("section", "reading-card");
      card.setAttribute("aria-label", `Runde ${completed + 1}`);
      const target = element("div", "word-card");
      if (round.target) {
        if (mode.id === "letters") {
          target.append(element("div", "word-emoji", round.target));
        } else if (round.picture) {
          const picture = element("div", "word-emoji", round.picture);
          picture.setAttribute("role", "img");
          picture.setAttribute("aria-label", round.target);
          target.append(picture);
        }
        target.append(listen(round.target, mode.id === "sound" ? "Hør lyden" : "Hør igjen", round.kind));
        card.append(target);
      }
      if (mode.id === "sound") {
        const note = "Stemmen kan si bokstavnavn. En voksen kan vise lyden.";
        card.append(element("p", "reading-hint", note), listen(note, "Hør om stemmen"));
      }
      let clapButton;
      if (mode.id === "syllables") {
        card.append(element("p", "", "Klapp i ditt eget tempo. Trykk her når du er klar."));
        clapButton = button("👏 Jeg har klappet", () => {
          if (!valid() || round.done || round.clapped) return;
          round.clapped = true;
          clapButton.disabled = true;
          answerButtons.forEach((node) => { node.disabled = false; });
          answerButtons[0].focus();
        });
        card.append(clapButton);
      }
      const sequence = element("p", "challenge-sequence");
      sequence.setAttribute("aria-live", "polite");
      if (mode.id === "story") {
        sequence.textContent = "Din rekkefølge: " + round.order.map(() => "□").join(" → ");
        card.append(sequence);
      }
      const choices = element("div", "reading-choices");
      const answerButtons = [];
      const feedback = element("div", "feedback reading-feedback");
      const status = element("p");
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      const feedbackAudio = element("div", "detail-actions");
      feedback.append(status, feedbackAudio);
      const actions = element("div", "detail-actions");
      const next = button("Neste →", () => {
        if (!valid() || !round.done) return;
        if (completed === 5) showSummary();
        else startRound();
        focusHeading();
      });
      next.hidden = true;
      let retry;

      function say(message) {
        status.textContent = message;
        feedbackAudio.replaceChildren(listen(message, "Hør beskjeden"));
        window.SoundButton.play("word", message);
      }

      function finish() {
        if (!valid() || round.done) return;
        round.done = true;
        answerButtons.forEach((node) => { node.disabled = true; });
        hint.disabled = true;
        const entry = state.modes[mode.id];
        entry.rounds += 1;
        completed += 1;
        if (round.assisted) entry.withHelp += 1;
        else {
          entry.independent += 1;
          entry.evidence[round.id] = count(entry.evidence[round.id]) + 1;
          independent += 1;
        }
        if (completed === 5) entry.sets += 1;
        persist();
        dots.replaceWith(progress());
        say("Ja, det stemmer. Fint jobbet!");
        next.textContent = completed === 5 ? "Se de fem rundene →" : "Neste →";
        next.hidden = false;
        next.focus();
      }

      round.choices.forEach((choice) => {
        const option = element("div", "word-card");
        const answer = button(choice.picture, () => {
          if (!valid() || round.done || answer.disabled) return;
          answer.disabled = true;
          if (mode.id === "story") {
            round.selected.push(choice.id);
            sequence.textContent = "Din rekkefølge: " + round.selected.map((id) =>
              round.choices.find((item) => item.id === id).picture).join(" → ");
            answer.setAttribute("aria-label", `${choice.name} Valgt som bilde ${round.selected.length}.`);
            if (round.selected.length !== round.order.length) return;
            if (round.selected.every((id, i) => id === round.order[i])) finish();
            else {
              round.assisted = true;
              say("La oss prøve igjen. Hva skjer først?");
              retry.hidden = false;
              retry.focus();
            }
          } else if (choice.id === round.answer) finish();
          else {
            round.assisted = true;
            say("Lytt gjerne igjen. Prøv et annet valg.");
          }
        }, "reading-choice");
        answer.setAttribute("aria-label", mode.id === "letters" ? `Velg liten ${choice.name}` : `Velg ${choice.name}`);
        if (mode.id === "syllables") {
          answer.append(element("span", "", ` ${choice.name}`));
          answer.disabled = !round.clapped;
        }
        answerButtons.push(answer);
        option.append(answer, listen(choice.name, mode.id === "story" ? "Hør bildet" : "Hør navnet", choice.kind || "word"));
        choices.append(option);
      });
      const hint = listen(round.hint, "💡 Hjelp");
      hint.addEventListener("click", () => {
        if (!valid() || round.done) return;
        round.assisted = true;
        status.textContent = round.visualHint || round.hint;
      });
      if (mode.id === "story") {
        retry = button("↻ Prøv rekkefølgen igjen", () => {
          if (!valid() || round.done || retry.hidden) return;
          round.selected = [];
          showRound();
          focusHeading();
        }, "btn btn-secondary");
        retry.hidden = true;
        actions.append(retry);
      }
      actions.append(hint, next);
      card.append(choices, feedback, actions);
      root.append(card, button("← Velg en annen lek", () => {
        if (!valid()) return;
        showPicker();
        focusHeading();
      }, "btn btn-outline"), button("⌂ Hjem", home, "btn btn-outline"));
    }

    function showSummary() {
      if (!active()) return;
      const currentScreen = ++screen;
      const valid = () => active() && screen === currentScreen;
      round = null;
      root.replaceChildren();
      const summary = `Du har øvd på fem runder. ${independent} uten hint eller nye forsøk. ${5 - independent} med støtte.`;
      heading("Fem små runder ferdige", summary);
      root.append(progress(), element("p", "", "Du kan ta en pause eller leke litt til."));
      const actions = element("div", "detail-actions");
      actions.append(
        button("⌂ Hjem og pause", home),
        button("Fortsett med fem nye →", () => {
          if (!valid()) return;
          completed = 0;
          independent = 0;
          startRound();
          focusHeading();
        }, "btn btn-secondary"),
        button("Velg en annen lek", () => {
          if (!valid()) return;
          showPicker();
          focusHeading();
        }, "btn btn-outline")
      );
      root.append(actions);
    }

    showPicker();
  }

  function resetSession() {
    generation += 1;
  }

  return { render, resetSession };
})();

if (typeof window !== "undefined") {
  window.ChallengesPage = ChallengesPage;
}
