/**
 * Audio helper — wraps the Web Speech API SpeechSynthesis so the whole app
 * can "speak" Norwegian letters/words without needing pre-recorded audio files.
 * Falls back gracefully if speech synthesis is unavailable.
 *
 * Every module that plays a *letter sound* goes through `speakLetter()` here,
 * so a letter sounds the same everywhere in the app: the child-friendly cue
 * from the dataset (never the IPA symbol), with sustained cues like "mmm"
 * collapsed to a single clean "m", and a rate cap so a single phoneme isn't
 * rushed past a beginner.
 *
 * Playing several sounds in a row (sounding a word out) uses `speakSequence()`
 * rather than a chain of timers: each part starts only when the previous one
 * has actually finished, so nothing gets cut off by the cancel() that starts
 * the next utterance, and a new request cleanly replaces a running sequence
 * instead of interleaving with it.
 */

const NorwegianAudio = (() => {
  /** A single phoneme read at full speed is hard to catch — cap letter sounds. */
  const LETTER_SOUND_MAX_RATE = 0.85;
  /** Silence between the parts of a sequence, in ms. */
  const DEFAULT_GAP_MS = 220;

  let cachedVoice = null;
  let voicesReady = false;
  let speakRequest = 0;

  function pickVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    voicesReady = true;
    return (
      voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("nb")) ||
      voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("no")) ||
      voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("nn")) ||
      null
    );
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    cachedVoice = pickVoice();
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoice = pickVoice();
    };
  }

  function isSupported() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  /** The spoken cue for a letter: child-friendly, never an IPA symbol, never repeated. */
  function letterSound(letter) {
    const raw = String(letter || "").trim();
    if (!raw) return "";
    const entry = (window.NORWEGIAN_LETTERS || []).find(
      (item) => item.letter.toLowerCase() === raw.toLowerCase()
    );
    const cue = ((entry && entry.spokenSound) || raw).trim().toLowerCase();
    // Collapse sustained cues like "mmm"/"sss" to one clean sound.
    const repeated = cue.match(/^(.)\1{2,}$/u);
    return repeated ? repeated[1] : cue;
  }

  /** Stop anything currently speaking or queued. */
  function cancel() {
    speakRequest += 1;
    if (isSupported()) window.speechSynthesis.cancel();
  }

  function defaultRate() {
    return (window.NorwegianSettings && window.NorwegianSettings.getAudioRate()) || 1;
  }

  /** Rough upper bound on how long an utterance can take, used as an onend watchdog. */
  function watchdogMs(text, rate) {
    return Math.round((1200 + String(text).length * 180) / Math.max(rate, 0.3));
  }

  function playPart(parts, index, requestId, options) {
    if (requestId !== speakRequest) return;
    if (index >= parts.length) {
      if (typeof options.onDone === "function") options.onDone();
      return;
    }

    const part = parts[index];
    const isLetter = !!part.letter;
    const text = isLetter ? letterSound(part.letter) : String(part.text || "");
    if (!text) {
      playPart(parts, index + 1, requestId, options);
      return;
    }

    let rate = part.rate || options.rate || defaultRate();
    if (isLetter) rate = Math.min(rate, LETTER_SOUND_MAX_RATE);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nb-NO";
    utterance.rate = rate;
    if (cachedVoice) utterance.voice = cachedVoice;

    let advanced = false;
    const next = () => {
      if (advanced || requestId !== speakRequest) return;
      advanced = true;
      window.clearTimeout(watchdog);
      if (index + 1 >= parts.length) {
        playPart(parts, index + 1, requestId, options);
        return;
      }
      const gap = typeof options.gapMs === "number" ? options.gapMs : DEFAULT_GAP_MS;
      window.setTimeout(() => playPart(parts, index + 1, requestId, options), gap);
    };

    // Some browsers never fire onend (notably when a voice is missing) — the
    // watchdog keeps a sequence from stalling halfway through a word.
    const watchdog = window.setTimeout(next, watchdogMs(text, rate));
    utterance.onend = next;
    utterance.onerror = next;

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Speak one or more parts in order, replacing anything already speaking.
   * @param {Array<{text?: string, letter?: string, rate?: number}>} parts
   * @param {{rate?: number, gapMs?: number, onDone?: function}} [options]
   * @returns {boolean} whether the request was accepted
   */
  function speakSequence(parts, options = {}) {
    const list = (parts || []).filter(Boolean);
    if (list.length === 0 || !isSupported()) return false;
    const requestId = ++speakRequest;
    window.speechSynthesis.cancel();
    // Queue on the next macrotask so cancel() can settle first.
    window.setTimeout(() => playPart(list, 0, requestId, options), 0);
    return true;
  }

  /**
   * Speak the given text aloud, replacing anything already speaking.
   * @param {string} text
   * @param {{rate?: number, onDone?: function}} [options]
   * @returns {boolean} whether the request was accepted; it may still be superseded
   */
  function speak(text, options = {}) {
    if (!text) return false;
    return speakSequence([{ text }], options);
  }

  /** Speak a single letter's sound — the one way the app pronounces letters. */
  function speakLetter(letter, options = {}) {
    return speakSequence([{ letter }], options);
  }

  /**
   * Model blending: each letter sound in turn, then the whole word.
   * @param {string} word
   * @param {{onDone?: function}} [options]
   */
  function soundOutWord(word, options = {}) {
    const text = String(word || "").trim();
    if (!text) return false;
    const parts = text
      .split("")
      .filter((char) => /[a-zæøå]/i.test(char))
      .map((char) => ({ letter: char }));
    if (parts.length === 0) return false;
    parts.push({ text, rate: Math.min(defaultRate(), LETTER_SOUND_MAX_RATE) });
    return speakSequence(parts, { gapMs: 320, onDone: options.onDone });
  }

  return {
    speak,
    speakLetter,
    speakSequence,
    soundOutWord,
    letterSound,
    cancel,
    isSupported,
    voicesReady: () => voicesReady
  };
})();

if (typeof window !== "undefined") {
  window.NorwegianAudio = NorwegianAudio;
}
