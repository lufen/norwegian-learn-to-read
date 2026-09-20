/**
 * Progress tracking — records which letters/words the learner has mastered.
 * Stored in localStorage so no account/login is required.
 */

const NorwegianProgress = (() => {
  const STORAGE_KEY = "nlr_progress";

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { letters: {}, words: {} };
    } catch (e) {
      return { letters: {}, words: {} };
    }
  }

  function save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore storage errors */
    }
  }

  let state = load();

  function markLetterMastered(letter) {
    state.letters[letter] = true;
    save(state);
  }

  function isLetterMastered(letter) {
    return !!state.letters[letter];
  }

  function markWordMastered(word) {
    state.words[word] = true;
    save(state);
  }

  function isWordMastered(word) {
    return !!state.words[word];
  }

  function getSummary() {
    const letterCount = Object.keys(state.letters).length;
    const wordCount = Object.keys(state.words).length;
    return { letterCount, wordCount };
  }

  function reset() {
    state = { letters: {}, words: {} };
    save(state);
  }

  return {
    markLetterMastered,
    isLetterMastered,
    markWordMastered,
    isWordMastered,
    getSummary,
    reset
  };
})();

if (typeof window !== "undefined") {
  window.NorwegianProgress = NorwegianProgress;
}
