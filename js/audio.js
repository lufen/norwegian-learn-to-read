/**
 * Shared Norwegian audio. Optional same-origin educator-reviewed recordings
 * take priority; device speech is an approximation, never a reviewed phoneme.
 * Word fragments fall back to their containing word, preserving context.
 */
const NorwegianAudio = (() => {
  const LETTER_SOUND_MAX_RATE = 0.85;
  const DEFAULT_GAP_MS = 220;
  const timers = new Set();
  let cachedVoice = null;
  let voicesReady = false;
  let speakRequest = 0;
  let stopActive = null;

  function synthesisSupported() {
    return typeof window !== "undefined" &&
      !!window.speechSynthesis &&
      typeof window.SpeechSynthesisUtterance === "function";
  }

  function pickVoice() {
    if (!synthesisSupported()) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    voicesReady = voices.length > 0;
    return voices.find((v) => /^nb/i.test(v.lang)) ||
      voices.find((v) => /^no/i.test(v.lang)) ||
      voices.find((v) => /^nn/i.test(v.lang)) || null;
  }

  if (synthesisSupported()) {
    cachedVoice = pickVoice();
    const updateVoice = () => { cachedVoice = pickVoice(); };
    if (window.speechSynthesis.addEventListener) {
      window.speechSynthesis.addEventListener("voiceschanged", updateVoice);
    } else {
      window.speechSynthesis.onvoiceschanged = updateVoice;
    }
  }

  function normalize(text) {
    return String(text == null ? "" : text).trim().toLowerCase();
  }

  /** Accept explicit review metadata, not a bare URL or an unreviewed asset. */
  function recordingFor(key) {
    if (typeof window === "undefined") return null;
    const registry = window.NORWEGIAN_RECORDINGS || {};
    const entry = Object.prototype.hasOwnProperty.call(registry, key) ? registry[key] : null;
    if (!entry || entry.reviewStatus !== "educator-reviewed" ||
        entry.locale !== "nb-NO" ||
        !["src", "reviewedBy", "dialect"].every(
          (field) => typeof entry[field] === "string" && entry[field].trim()
        ) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(entry.reviewedAt || "")) return null;
    const date = new Date(`${entry.reviewedAt}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) ||
        date.toISOString().slice(0, 10) !== entry.reviewedAt) return null;
    try {
      const url = new URL(entry.src, window.location.href);
      if (!/^https?:$/.test(url.protocol) || url.origin !== window.location.origin ||
          url.username || url.password) return null;
      return { ...entry, src: url.href };
    } catch (_) {
      return null;
    }
  }

  function isSupported() {
    return synthesisSupported() || (typeof window !== "undefined" &&
      typeof window.Audio === "function" &&
      Object.keys(window.NORWEGIAN_RECORDINGS || {}).some((key) => recordingFor(key)));
  }

  /** Plain spelling cues only: synthesis may still produce a letter name. */
  function letterSound(letter) {
    const raw = normalize(letter);
    if (!raw) return "";
    const entry = (window.NORWEGIAN_LETTERS || []).find(
      (item) => normalize(item.letter) === raw
    );
    const cue = normalize((entry && entry.spokenSound) || raw);
    const repeated = cue.match(/^(.)\1{2,}$/u);
    return repeated ? repeated[1] : cue;
  }

  /**
   * Curated spelling groups; an unknown word/phrase remains one whole unit.
   * `value` is a context token for SoundButton's "sound-unit" kind.
   */
  function soundUnits(word) {
    const text = normalize(word);
    if (!text) return [];
    const table = window.NORWEGIAN_WORD_SOUND_UNITS || {};
    const curated = Object.prototype.hasOwnProperty.call(table, text) ? table[text] : null;
    const units = Array.isArray(curated) && curated.length &&
      curated.every((unit) => typeof unit === "string" && unit) &&
      curated.join("") === text ? curated : [text];
    return units.map((unit, index) => ({
      text: unit, value: `${text}:${index}`, word: text, index
    }));
  }

  function resolveUnit(value) {
    const token = typeof value === "object" && value ? value.value : value;
    const match = String(token || "").match(/^(.+):(\d+)$/u);
    if (!match) return null;
    return soundUnits(match[1])[Number(match[2])] || null;
  }

  function canSoundOut(word) {
    const units = soundUnits(word);
    return typeof window.Audio === "function" && units.length > 0 &&
      units.every((unit) => !!recordingFor(`unit:${unit.value}`));
  }

  function later(callback, delay) {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
    return timer;
  }

  function clearTimer(timer) {
    window.clearTimeout(timer);
    timers.delete(timer);
  }

  function stopSynthesis() {
    if (synthesisSupported()) {
      try { window.speechSynthesis.cancel(); } catch (_) { /* Browser shutdown. */ }
    }
  }

  /** Cancellation never calls a superseded request's completion callback. */
  function cancel() {
    speakRequest += 1;
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
    if (stopActive) stopActive();
    stopActive = null;
    stopSynthesis();
  }

  function defaultRate() {
    return (window.NorwegianSettings && window.NorwegianSettings.getAudioRate()) || 1;
  }

  function playbackRate(value) {
    const rate = Number(value);
    return Number.isFinite(rate) && rate > 0 ? Math.min(2, Math.max(0.3, rate)) : 1;
  }

  function watchdogMs(text, rate) {
    return Math.round((1800 + String(text).length * 250) / Math.max(rate, 0.3));
  }

  function describePart(part) {
    if (part.soundUnit) {
      const unit = resolveUnit(part.soundUnit);
      return unit ? { text: unit.word, key: `unit:${unit.value}`, isSound: true } : null;
    }
    if (part.letter) {
      return { text: letterSound(part.letter), key: `letter:${normalize(part.letter)}`, isSound: true };
    }
    const text = String(part.text || "").trim();
    return text ? { text, key: `word:${normalize(text)}`, isSound: false } : null;
  }

  function playPart(parts, index, requestId, options) {
    if (requestId !== speakRequest) return;
    if (index >= parts.length) {
      if (typeof options.onDone === "function") options.onDone();
      return;
    }
    const part = parts[index];
    const description = describePart(part);
    const next = () => {
      if (requestId !== speakRequest) return;
      const gap = Number.isFinite(options.gapMs) ? Math.max(0, options.gapMs) : DEFAULT_GAP_MS;
      later(() => playPart(parts, index + 1, requestId, options),
        index + 1 < parts.length ? gap : 0);
    };
    if (!description || !description.text) {
      next();
      return;
    }
    const { text, key, isSound } = description;
    let rate = playbackRate(part.rate || options.rate || defaultRate());
    if (isSound) rate = Math.min(rate, LETTER_SOUND_MAX_RATE);

    const reportError = (error) => {
      if (requestId === speakRequest && typeof options.onError === "function") options.onError(error);
    };
    const synthesize = () => {
      if (requestId !== speakRequest) return;
      if (!synthesisSupported()) {
        next();
        reportError(new Error("No speech fallback is available."));
        return;
      }
      let utterance;
      let watchdog;
      let finished = false;
      const cleanup = () => {
        clearTimer(watchdog);
        if (utterance) utterance.onend = utterance.onerror = null;
      };
      const finish = (error, timedOut = false) => {
        if (finished || requestId !== speakRequest) return;
        finished = true;
        cleanup();
        stopActive = null;
        if (timedOut) stopSynthesis();
        next();
        if (error) reportError(error);
      };
      stopActive = () => { finished = true; cleanup(); };
      try {
        utterance = new window.SpeechSynthesisUtterance(text);
        utterance.lang = "nb-NO";
        utterance.rate = rate;
        if (cachedVoice) utterance.voice = cachedVoice;
        utterance.onend = () => finish();
        utterance.onerror = () => finish(new Error("Speech playback failed."));
        watchdog = later(() => finish(new Error("Speech playback timed out."), true), watchdogMs(text, rate));
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        finish(error, true);
      }
    };

    const recording = recordingFor(key) ||
      (part.soundUnit ? recordingFor(`word:${normalize(text)}`) : null);
    if (!recording || typeof window.Audio !== "function") {
      synthesize();
      return;
    }
    let audio;
    let watchdog;
    let settled = false;
    const cleanup = () => {
      clearTimer(watchdog);
      if (!audio) return;
      audio.onended = audio.onerror = null;
      try {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      } catch (_) { /* Already unloaded by the browser. */ }
    };
    const finishRecording = (failed) => {
      if (settled || requestId !== speakRequest) return;
      settled = true;
      cleanup();
      stopActive = null;
      if (failed) synthesize();
      else next();
    };
    stopActive = () => { settled = true; cleanup(); };
    try {
      audio = new window.Audio();
      audio.preload = "auto";
      audio.playbackRate = rate;
      audio.onended = () => finishRecording(false);
      audio.onerror = () => finishRecording(true);
      // Bound both a hung load and a missing ended event; no overlap on timeout.
      watchdog = later(() => finishRecording(true), Math.max(12000, watchdogMs(text, rate)));
      audio.src = recording.src;
      const playing = audio.play();
      if (playing && typeof playing.catch === "function") playing.catch(() => finishRecording(true));
    } catch (_) {
      finishRecording(true);
    }
  }

  /**
   * Existing letter/text parts remain supported; soundUnit adds context tokens.
   * onDone runs once after completion (including errors), never after cancel.
   * onError reports an unavailable/failed speech fallback; failed recordings
   * automatically try synthesis without advancing twice.
   */
  function speakSequence(parts, options = {}) {
    const list = Array.isArray(parts) ? parts.filter(Boolean) : [];
    if (!list.length || !isSupported()) return false;
    cancel();
    const requestId = speakRequest;
    later(() => playPart(list, 0, requestId, options), 0);
    return true;
  }

  function speak(text, options = {}) {
    if (!text) return false;
    return speakSequence([{ text }], options);
  }

  function speakLetter(letter, options = {}) {
    if (!letterSound(letter)) return false;
    return speakSequence([{ letter }], options);
  }

  function speakSoundUnit(value, options = {}) {
    if (!resolveUnit(value)) return false;
    return speakSequence([{ soundUnit: value }], options);
  }

  function soundOutWord(word, options = {}) {
    const text = String(word || "").trim();
    const units = soundUnits(text);
    if (!units.length) return false;
    // Do not repeat a synthesized whole word for every missing unit recording.
    const parts = canSoundOut(text) ? units.map((unit) => ({ soundUnit: unit.value })) : [];
    parts.push({ text, rate: Math.min(playbackRate(options.rate || defaultRate()), LETTER_SOUND_MAX_RATE) });
    return speakSequence(parts, { ...options, gapMs: options.gapMs == null ? 320 : options.gapMs });
  }

  return {
    speak, speakLetter, speakSoundUnit, speakSequence, soundOutWord, soundUnits, canSoundOut,
    letterSound, cancel, isSupported, voicesReady: () => voicesReady
  };
})();

if (typeof window !== "undefined") {
  window.NorwegianAudio = NorwegianAudio;
}
