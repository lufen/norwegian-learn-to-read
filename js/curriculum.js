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

  /** Letters in `text` that haven't been unlocked yet in Letter Journey. */
  function unknownLettersIn(text) {
    const known = knownLetters();
    return requiredLettersFor(text).filter((letter) => !known.has(letter));
  }

  /** Small HTML badge to show next to a word/page when it uses unmet letters. Empty string if none. */
  function newLetterBadge(text) {
    const unknown = unknownLettersIn(text);
    if (unknown.length === 0) return "";
    const label = unknown.length === 1 ? "new letter" : "new letters";
    return `<span class="new-letter-badge" title="Uses ${label} not yet unlocked in Letter Journey: ${unknown.join(", ")}">🆕 ${unknown.join("")}</span>`;
  }

  return { knownLetters, requiredLettersFor, unknownLettersIn, newLetterBadge };
})();

if (typeof window !== "undefined") {
  window.Curriculum = Curriculum;
}
