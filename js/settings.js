/**
 * Settings — text size, audio speed, dyslexia-friendly font.
 * Persisted to localStorage so preferences survive reloads.
 */

const NorwegianSettings = (() => {
  const STORAGE_KEY = "nlr_settings";
  const defaults = { textSize: "normal", audioRate: 1, dyslexiaFont: false };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
    } catch (e) {
      return { ...defaults };
    }
  }

  function save(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      /* ignore storage errors (e.g. private browsing) */
    }
  }

  let state = load();

  function applyToDocument() {
    document.body.classList.remove("text-normal", "text-large", "text-xlarge");
    document.body.classList.add(`text-${state.textSize}`);
    document.body.classList.toggle("dyslexia-font", !!state.dyslexiaFont);
  }

  function getAudioRate() {
    return state.audioRate;
  }

  function setAudioRate(rate) {
    state.audioRate = rate;
    save(state);
  }

  function getTextSize() {
    return state.textSize;
  }

  function setTextSize(size) {
    state.textSize = size;
    save(state);
    applyToDocument();
  }

  function getDyslexiaFont() {
    return state.dyslexiaFont;
  }

  function setDyslexiaFont(value) {
    state.dyslexiaFont = value;
    save(state);
    applyToDocument();
  }

  return {
    getAudioRate,
    setAudioRate,
    getTextSize,
    setTextSize,
    getDyslexiaFont,
    setDyslexiaFont,
    applyToDocument
  };
})();

if (typeof window !== "undefined") {
  window.NorwegianSettings = NorwegianSettings;
}
