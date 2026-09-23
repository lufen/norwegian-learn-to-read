/**
 * Curriculum map — a lightweight, honest way to tie Letter Journey, Spell
 * Words, Write Words, and Little Books together.
 *
 * Letter Journey is the one place letter introduction order is deliberately
 * controlled (a few letters unlocked at a time). Everything else in the app
 * previously let a child open any word/book regardless of whether it used
 * letters they'd never met. This module doesn't lock content — free
 * exploration is still allowed — but it makes the mismatch visible with a
 * small "new letters" badge, so difficulty claims are honest instead of
 * silent.
 */

const Curriculum = (() => {
  // Common Norwegian multi-letter sound units — a badge based on distinct
  // capital letters alone misses these, so a word with zero "new letters"
  // can still contain a sound-pattern the child has never met.
  const KNOWN_PATTERNS = ["skj", "kj", "gj", "sj", "sk", "ng"];

  function knownLetters() {
    const unlocked = (window.NorwegianProgress && window.NorwegianProgress.getJourney().unlocked) || [];
    return new Set(unlocked);
  }

  function requiredLettersFor(text) {
    const letters = new Set();
    String(text)
      .toUpperCase()
      .replace(/[^A-ZÆØÅ]/g, "")
      .split("")
      .forEach((ch) => letters.add(ch));
    return Array.from(letters).sort();
  }

  /** Multi-letter sound patterns (kj, sk, skj, ...) present in `text`, lowercase. */
  function patternsIn(text) {
    const lower = String(text).toLowerCase();
    return KNOWN_PATTERNS.filter((pattern) => lower.includes(pattern));
  }

  /** Letters in `text` that haven't been unlocked yet in Letter Journey. */
  function unknownLettersIn(text) {
    const known = knownLetters();
    return requiredLettersFor(text).filter((letter) => !known.has(letter));
  }

  function recommendations() {
    const scores = window.NorwegianProgress.getJourney().scores;
    const ready = (text) => requiredLettersFor(text).every((letter) => scores[letter] >= 1)
      && patternsIn(text).length === 0;
    const history = window.NorwegianProgress.getActivityState("recommendations");
    const writing = window.NorwegianProgress.getActivityState("writing");
    const spelling = window.NorwegianProgress.getActivityState("spelling");
    const reading = window.NorwegianProgress.getActivityState("reading");
    const count = (value) => Number.isSafeInteger(value) && value >= 0 ? value : 0;
    const choose = (kind, candidates) => {
      if (!candidates.length) return null;
      const saved = history[kind] || {};
      const shown = { ...saved.shown };
      const turn = count(saved.turn);
      // Alternate new practice and revisiting, without repeating the last suggestion.
      const fresh = candidates.filter((item) => !item.practiced);
      const revisits = candidates.filter((item) => item.practiced);
      let pool = turn % 2 === 0 ? fresh : revisits;
      if (!pool.length) pool = candidates;
      const alternatives = pool.filter((item) => item.key !== saved.last);
      if (alternatives.length) pool = alternatives;
      else if (candidates.length > 1) pool = candidates.filter((item) => item.key !== saved.last);
      const selected = pool.slice().sort((a, b) => count(shown[a.key]) - count(shown[b.key]))[0];
      shown[selected.key] = count(shown[selected.key]) + 1;
      history[kind] = { shown, last: selected.key, turn: turn + 1 };
      return selected;
    };
    const words = [];
    window.WORD_LEVELS.slice(1).forEach((level, offset) => {
      level.words.forEach((item, wordIndex) => {
        if (!ready(item.text)) return;
        const built = (writing.completed || {})[item.text] || {};
        const matched = (reading.wordStats || {})[item.text] || {};
        words.push({
          ...item, levelIndex: offset + 1, wordIndex, key: item.text,
          practiced: count(built.withHelp) + count(built.withoutExtraHelp) > 0 ||
            !!(spelling.selfReported || {})[item.text] ||
            count(matched.independent) + count(matched.withHelp) + count(matched.recognizedOnly) > 0
        });
      });
    });
    const unlocked = Number.isInteger(reading.unlockedCount) ? reading.unlockedCount : 1;
    const books = window.DECODABLE_BOOKS.map((book, index) => ({
      key: book.id, index, book,
      practiced: count(((reading.bookProgress || {})[book.id] || {}).completions) > 0
    })).filter(({ book, index }) => index < unlocked && book.pages.every((page) => ready(page.text)));
    const word = choose("words", words);
    const book = choose("books", books);
    window.NorwegianProgress.saveActivityState("recommendations", history);
    return { word, bookIndex: book ? book.index : -1 };
  }

  /**
   * Small HTML badge to show next to a word/page when it uses unmet letters or
   * sound patterns. Empty string if none. It's a SoundButton like every other
   * tap-to-hear control, so it plays its explanation with no extra wiring.
   */
  function newLetterBadge(text) {
    const unknown = unknownLettersIn(text);
    const patterns = patternsIn(text);
    if (unknown.length === 0 && patterns.length === 0) return "";
    const parts = unknown.concat(patterns);
    return window.SoundButton.html({
      kind: "word",
      value: `Her er bokstaver eller lydmønstre dere kan øve på sammen: ${parts.join(", ")}.`,
      icon: "🆕",
      label: parts.join(""),
      variant: "bare",
      className: "new-letter-badge",
      title: `Bokstaver eller lydmønstre å øve på: ${parts.join(", ")}`,
      ariaLabel: `Hear which sounds in this are new: ${parts.join(", ")}`
    });
  }

  return { knownLetters, requiredLettersFor, unknownLettersIn, patternsIn, newLetterBadge, recommendations };
})();

if (typeof window !== "undefined") {
  window.Curriculum = Curriculum;
}
