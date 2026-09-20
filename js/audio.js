/**
 * Audio helper — wraps the Web Speech API SpeechSynthesis so the whole app
 * can "speak" Norwegian letters/words without needing pre-recorded audio files.
 * Falls back gracefully if speech synthesis is unavailable.
 */

const NorwegianAudio = (() => {
  let cachedVoice = null;
  let voicesReady = false;

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
   * @param {string} text
   * @param {{rate?: number}} [options]
   * @returns {boolean} whether speech was attempted
   */
  function speak(text, options = {}) {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return false;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nb-NO";
    utterance.rate = options.rate || NorwegianSettings.getAudioRate();
    if (cachedVoice) {
      utterance.voice = cachedVoice;
    }
    window.speechSynthesis.speak(utterance);
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
