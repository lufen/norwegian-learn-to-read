/**
 * Content filter — a small safeguard for the one free-text input in the app
 * (Write Words dictation). If a child types something inappropriate instead
 * of the target word, we avoid echoing it back on screen and show a gentle
 * neutral message instead.
 *
 * This is intentionally a simple word-list match, not a general profanity
 * detector: the goal is only to catch obvious inappropriate words typed into
 * a children's spelling box, not to moderate open-ended text.
 */

const NorwegianContentFilter = (() => {
  // Lowercase, no diacritics needed here since comparison also strips accents.
  const BLOCKED_WORDS = [
    // Norwegian
    "faen", "helvete", "jævla", "jævlig", "driten", "drit", "pokker",
    "fitte", "kuk", "pikk", "ludder", "hore", "megge", "rasshøl",
    "idiot", "krøpling", "mongo", "neger",
    // English (common exposure via media/keyboards)
    "fuck", "shit", "bitch", "asshole", "bastard", "dick", "pussy",
    "cunt", "nigger", "retard", "whore", "slut"
  ];

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // strip accents so "jævla"/"jaevla" both match
  }

  function containsBlockedWord(text) {
    const normalized = normalize(text);
    return BLOCKED_WORDS.some((word) => normalized.includes(normalize(word)));
  }

  return { containsBlockedWord };
})();

if (typeof window !== "undefined") {
  window.NorwegianContentFilter = NorwegianContentFilter;
}
