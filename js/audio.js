/**
 * Audio helper — wraps the Web Speech API SpeechSynthesis so the whole app
 * can "speak" Norwegian letters/words without needing pre-recorded audio files.
 * Falls back gracefully if speech synthesis is unavailable.
 */

const NorwegianAudio = (() => {
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

  /**
   * Speak the given text aloud.
   * Speech is queued on the next macrotask so cancel() can settle; if another
   * speak() call arrives first, this request is dropped.
   * @param {string} text
   * @param {{rate?: number}} [options]
   * @returns {boolean} whether the request was accepted; it may still be superseded
   */
  function speak(text, options = {}) {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return false;
    }
    const requestId = ++speakRequest;
    window.speechSynthesis.cancel();
    window.setTimeout(() => {
      if (requestId !== speakRequest) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "nb-NO";
      utterance.rate = options.rate || NorwegianSettings.getAudioRate();
      if (cachedVoice) {
        utterance.voice = cachedVoice;
      }
      window.speechSynthesis.speak(utterance);
    }, 0);
    return true;
  }

  function isSupported() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  return { speak, isSupported, voicesReady: () => voicesReady };
})();

if (typeof window !== "undefined") {
  window.NorwegianAudio = NorwegianAudio;
}
