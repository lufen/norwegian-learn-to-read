/**
 * Progress tracking — records which letters/words the learner has mastered.
 * Stored in localStorage so no account/login is required.
 */

const NorwegianProgress = (() => {
  const STORAGE_KEY = "nlr_progress";

  function emptyState() {
    return { letters: {}, words: {}, journey: { unlocked: [], scores: {} } };
  }

  function withDefaults(parsed) {
    const base = emptyState();
    if (!parsed || typeof parsed !== "object") return base;
    return {
      letters: parsed.letters || base.letters,
      words: parsed.words || base.words,
      journey: {
        unlocked: Array.isArray(parsed.journey && parsed.journey.unlocked)
          ? parsed.journey.unlocked
          : base.journey.unlocked,
        scores: (parsed.journey && parsed.journey.scores) || base.journey.scores
      }
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return withDefaults(parsed);
    } catch (e) {
      return withDefaults(null);
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

  function getJourney() {
    return { unlocked: state.journey.unlocked.slice(), scores: Object.assign({}, state.journey.scores) };
  }

  function saveJourney(journey) {
    state.journey = {
      unlocked: Array.isArray(journey.unlocked) ? journey.unlocked.slice() : [],
      scores: journey.scores || {}
    };
    save(state);
  }

  function reset() {
    state = emptyState();
    save(state);
  }

  return {
    markLetterMastered,
    isLetterMastered,
    markWordMastered,
    isWordMastered,
    getSummary,
    getJourney,
    saveJourney,
    reset
  };
})();

if (typeof window !== "undefined") {
  window.NorwegianProgress = NorwegianProgress;
}
