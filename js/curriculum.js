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

  /** Small HTML badge to show next to a word/page when it uses unmet letters or sound patterns. Empty string if none. */
  function newLetterBadge(text) {
    const unknown = unknownLettersIn(text);
    const patterns = patternsIn(text);
    if (unknown.length === 0 && patterns.length === 0) return "";
    const parts = unknown.concat(patterns);
    const spoken = `Dette ordet har lyder du ikke har møtt ennå i bokstavreisen: ${parts.join(", ")}.`;
    return `<button type="button" class="new-letter-badge" data-spoken="${spoken.replace(/"/g, "&quot;")}" title="Uses sounds not yet unlocked in Letter Journey: ${parts.join(", ")}">🆕 ${parts.join("")}</button>`;
  }

  /** Wire up tap-to-hear on any newLetterBadge() buttons already inserted into `container`. */
  function bindBadgeAudio(container) {
    if (!container || !window.NorwegianAudio) return;
    container.querySelectorAll(".new-letter-badge[data-spoken]").forEach((btn) => {
      btn.addEventListener("click", () => window.NorwegianAudio.speak(btn.dataset.spoken));
    });
  }

  return { knownLetters, requiredLettersFor, unknownLettersIn, patternsIn, newLetterBadge, bindBadgeAudio };
})();

if (typeof window !== "undefined") {
  window.Curriculum = Curriculum;
}
