/**
 * Norwegian Learn to Read/Write — content dataset.
 * Exposes NORWEGIAN_LETTERS and WORD_LEVELS on window for use by other scripts.
 */

const NORWEGIAN_LETTERS = [
  { letter: "A", sound: "a", phoneme: "ɑ", spokenSound: "a", examples: ["and (duck)", "app (monkey)", "arm (arm)"] },
  { letter: "B", sound: "b", phoneme: "b", spokenSound: "bø", examples: ["bil (car)", "bok (book)", "ball (ball)"] },
  { letter: "C", sound: "c", phoneme: "k", spokenSound: "kø", examples: ["camping (camping)", "cowboy (cowboy)"] },
  { letter: "D", sound: "d", phoneme: "d", spokenSound: "dø", examples: ["dag (day)", "due (pigeon)", "dukke (doll)"] },
  { letter: "E", sound: "e", phoneme: "e", spokenSound: "e", examples: ["esel (donkey)", "eple (apple)", "elg (moose)"] },
  { letter: "F", sound: "f", phoneme: "f", spokenSound: "fff", examples: ["fisk (fish)", "far (father)", "fugl (bird)"] },
  { letter: "G", sound: "g", phoneme: "g", spokenSound: "gø", examples: ["gris (pig)", "gul (yellow)", "geit (goat)"] },
  { letter: "H", sound: "h", phoneme: "h", spokenSound: "hø", examples: ["hund (dog)", "hus (house)", "hest (horse)"] },
  { letter: "I", sound: "i", phoneme: "i", spokenSound: "i", examples: ["is (ice cream)", "igle (leech)"] },
  { letter: "J", sound: "j", phoneme: "j", spokenSound: "jø", examples: ["jul (christmas)", "jente (girl)"] },
  { letter: "K", sound: "k", phoneme: "k", spokenSound: "kø", examples: ["katt (cat)", "ku (cow)", "kake (cake)"] },
  { letter: "L", sound: "l", phoneme: "l", spokenSound: "lll", examples: ["løve (lion)", "lys (light)"] },
  { letter: "M", sound: "m", phoneme: "m", spokenSound: "mmm", examples: ["mor (mother)", "mus (mouse)", "melk (milk)"] },
  { letter: "N", sound: "n", phoneme: "n", spokenSound: "nnn", examples: ["natt (night)", "null (zero)"] },
  { letter: "O", sound: "o", phoneme: "u", spokenSound: "o", examples: ["ost (cheese)", "okse (ox)"] },
  { letter: "P", sound: "p", phoneme: "p", spokenSound: "pø", examples: ["pike (girl)", "penn (pen)"] },
  { letter: "Q", sound: "q", phoneme: "k", spokenSound: "kø", examples: ["quiz (quiz)"] },
  { letter: "R", sound: "r", phoneme: "r", spokenSound: "rrr", examples: ["rev (fox)", "regn (rain)"] },
  { letter: "S", sound: "s", phoneme: "s", spokenSound: "sss", examples: ["sol (sun)", "sko (shoe)"] },
  { letter: "T", sound: "t", phoneme: "t", spokenSound: "tø", examples: ["tog (train)", "tre (tree)"] },
  { letter: "U", sound: "u", phoneme: "ʉ", spokenSound: "u", examples: ["ugle (owl)", "ull (wool)"] },
  { letter: "V", sound: "v", phoneme: "v", spokenSound: "vvv", examples: ["vann (water)", "vinter (winter)"] },
  { letter: "W", sound: "w", phoneme: "v", spokenSound: "vvv", examples: ["wc (toilet, loanword)"] },
  { letter: "X", sound: "x", phoneme: "ks", spokenSound: "ks", examples: ["xylofon (xylophone)"] },
  { letter: "Y", sound: "y", phoneme: "y", spokenSound: "y", examples: ["ymse (miscellaneous)"] },
  { letter: "Z", sound: "z", phoneme: "s", spokenSound: "sss", examples: ["zoo (zoo)"] },
  { letter: "Æ", sound: "æ", phoneme: "æ", spokenSound: "æ", examples: ["ære (honor)", "være (to be)"] },
  { letter: "Ø", sound: "ø", phoneme: "ø", spokenSound: "ø", examples: ["øy (island)", "ørn (eagle)"] },
  { letter: "Å", sound: "å", phoneme: "oː", spokenSound: "å", examples: ["år (year)", "ål (eel)"] }
];

const DECODABLE_BOOKS = [
  {
    id: "first-words",
    title: "First words",
    icon: "🔤",
    level: "Start here",
    wordBank: { sol: "☀️", katt: "🐱", bil: "🚗", is: "🍦" },
    pages: [
      { text: "sol", keyword: "sol", picture: "☀️" },
      { text: "katt", keyword: "katt", picture: "🐱" },
      { text: "bil", keyword: "bil", picture: "🚗" },
      { text: "is", keyword: "is", picture: "🍦" }
    ]
  },
  {
    id: "tiny-sentences",
    title: "Tiny sentences",
    icon: "📝",
    level: "Next step",
    // Every word that actually appears in this book's pages must be in its
    // bank — including small function words like "se"/"er" — otherwise a
    // "closed word bank" claim isn't true and the child can hit unbanked
    // print with no distractor/picture support.
    wordBank: { sol: "☀️", katt: "🐱", bil: "🚗", gul: "🟡", se: "👀", er: "🟰" },
    pages: [
      { text: "Se sol.", keyword: "sol", picture: "👀☀️" },
      { text: "Se katt.", keyword: "katt", picture: "👀🐱" },
      { text: "Se bil.", keyword: "bil", picture: "👀🚗" },
      { text: "Sol er gul.", keyword: "gul", picture: "☀️🟡" }
    ]
  },
  {
    id: "sol",
    title: "Sol",
    icon: "☀️",
    level: "Story practice",
    wordBank: { sol: "☀️", gul: "🟡", lyser: "✨", er: "🟰", se: "👀" },
    // Spellable purely from letters already in this book's own bank
    // (s, u, r), never shown as print or a choice elsewhere.
    transferWord: { word: "sur", emoji: "🍋" },
    pages: [
      { text: "Sol.", keyword: "sol", picture: "☀️" },
      { text: "Sol er gul.", keyword: "gul", picture: "🟡" },
      { text: "Sol lyser.", keyword: "lyser", picture: "✨" },
      { text: "Se sol.", keyword: "sol", picture: "👀☀️" }
    ]
  },
  {
    id: "katt",
    title: "Katt",
    icon: "🐱",
    level: "Story practice",
    wordBank: { katt: "🐱", sover: "💤", sol: "☀️", løper: "💨", ser: "👀" },
    // Spellable from letters already met (r, a) plus this book's own katt/
    // sover/sol/løper letters.
    transferWord: { word: "rar", emoji: "🤪" },
    pages: [
      { text: "Katt.", keyword: "katt", picture: "🐱" },
      { text: "Katt sover.", keyword: "sover", picture: "🐱💤" },
      { text: "Katt ser sol.", keyword: "sol", picture: "🐱👀☀️" },
      { text: "Katt løper.", keyword: "løper", picture: "🐱💨" }
    ]
  },
  {
    id: "bil",
    title: "Bil",
    icon: "🚗",
    level: "Story practice",
    wordBank: { bil: "🚗", blå: "🔵", kjører: "💨", er: "🟰", se: "👀" },
    // Spellable from letters already met (l, å, s) — a lock, not shown
    // anywhere else in the app.
    transferWord: { word: "lås", emoji: "🔒" },
    pages: [
      { text: "Bil.", keyword: "bil", picture: "🚗" },
      { text: "Bil er blå.", keyword: "blå", picture: "🔵" },
      { text: "Bil kjører.", keyword: "kjører", picture: "🚗💨" },
      { text: "Se bil.", keyword: "bil", picture: "👀🚗" }
    ]
  },
  {
    id: "mus",
    title: "Mus",
    icon: "🐭",
    level: "Story practice",
    wordBank: { mus: "🐭", sol: "☀️", løper: "💨", liten: "🤏", ser: "👀", er: "🟰" },
    // A brand-new word never shown as text or as a choice anywhere else in
    // the app, but fully spellable from letters/sounds the child has
    // already met across earlier books (m, i, l). Used once, on the final
    // page, to check real decoding of an unseen word rather than
    // recognition of a memorized picture/word shape.
    transferWord: { word: "mil", emoji: "🛣️" },
    pages: [
      { text: "Mus.", keyword: "mus", picture: "🐭" },
      { text: "Mus ser sol.", keyword: "sol", picture: "🐭👀☀️" },
      { text: "Mus løper.", keyword: "løper", picture: "🐭💨" },
      { text: "Mus er liten.", keyword: "liten", picture: "🐭🤏" }
    ]
  }
];

// Derive each book's letters directly from the words it actually contains,
// instead of hand-maintaining a separate (and easily inaccurate) list.
DECODABLE_BOOKS.forEach((book) => {
  const letters = new Set();
  book.pages.forEach((page) => {
    page.text.toUpperCase().replace(/[^A-ZÆØÅ]/g, "").split("").forEach((ch) => letters.add(ch));
  });
  book.requiredLetters = Array.from(letters).sort();
});

const WORD_LEVELS = [
  {
    id: 1,
    name: "Level 1: Letters",
    description: "Get to know each Norwegian letter and its sound.",
    words: NORWEGIAN_LETTERS.map((l) => ({
      text: l.letter.toLowerCase(),
      translation: l.examples[0] || "",
      phonemes: [l.phoneme],
      syllables: [l.letter.toLowerCase()],
      emoji: "🔤"
    }))
  },
  {
    id: 2,
    name: "Level 2: Simple words",
    description: "One sound per letter, nothing doubled or joined together.",
    // Deliberately excludes consonant clusters (hund, fisk) and doubled
    // letters (katt, ball) — those are a harder decoding skill and belong
    // in Level 3, so this level is a real, honest step below it.
    words: [
      { text: "sol", translation: "sun", phonemes: ["s", "u", "l"], syllables: ["s", "o", "l"], emoji: "☀️" },
      { text: "bil", translation: "car", phonemes: ["b", "i", "l"], syllables: ["b", "i", "l"], emoji: "🚗" },
      { text: "hus", translation: "house", syllables: ["h", "u", "s"], emoji: "🏠" },
      { text: "mor", translation: "mother", syllables: ["m", "o", "r"], emoji: "👩" },
      { text: "far", translation: "father", syllables: ["f", "a", "r"], emoji: "👨" },
      { text: "is", translation: "ice cream", syllables: ["i", "s"], emoji: "🍦" },
      { text: "gul", translation: "yellow", syllables: ["g", "u", "l"], emoji: "🟡" },
      { text: "bok", translation: "book", syllables: ["b", "o", "k"], emoji: "📖" }
    ]
  },
  {
    id: 3,
    name: "Level 3: Tricky letters",
    description: "Words with doubled letters or two consonants sitting together.",
    words: [
      { text: "katt", translation: "cat", phonemes: ["k", "ɑ", "t", "t"], syllables: ["k", "a", "tt"], emoji: "🐱" },
      { text: "hund", translation: "dog", phonemes: ["h", "ʉ", "n", "d"], syllables: ["h", "u", "nd"], emoji: "🐶" },
      { text: "ball", translation: "ball", syllables: ["b", "a", "ll"], emoji: "⚽" },
      { text: "fisk", translation: "fish", syllables: ["f", "i", "sk"], emoji: "🐟" },
      { text: "vann", translation: "water", syllables: ["v", "a", "nn"], emoji: "💧" },
      { text: "brød", translation: "bread", syllables: ["br", "ø", "d"], emoji: "🍞" },
      { text: "sky", translation: "cloud", syllables: ["sk", "y"], emoji: "☁️" }
    ]
  },
  {
    id: 4,
    name: "Level 4: Longer words",
    description: "Words with two or three syllables.",
    words: [
      { text: "skole", translation: "school", syllables: ["sko", "le"], emoji: "🏫" },
      { text: "epler", translation: "apples", syllables: ["ep", "ler"], emoji: "🍎" },
      { text: "blomst", translation: "flower", syllables: ["bl", "o", "mst"], emoji: "🌸" },
      { text: "sykkel", translation: "bicycle", syllables: ["syk", "kel"], emoji: "🚲" },
      { text: "vinter", translation: "winter", syllables: ["vin", "ter"], emoji: "❄️" },
      { text: "sommer", translation: "summer", syllables: ["som", "mer"], emoji: "🌞" }
    ]
  },
  {
    id: 5,
    name: "Level 5: Two words together",
    description: "Short phrases — a bridge between single words and full sentences.",
    words: [
      { text: "gul sol", translation: "yellow sun", syllables: ["gul", "sol"], emoji: "🟡☀️" },
      { text: "liten katt", translation: "small cat", syllables: ["li", "ten", "katt"], emoji: "🤏🐱" },
      { text: "stor bil", translation: "big car", syllables: ["stor", "bil"], emoji: "📏🚗" },
      { text: "kald vinter", translation: "cold winter", syllables: ["kald", "vin", "ter"], emoji: "🥶❄️" },
      { text: "søt hund", translation: "sweet dog", syllables: ["søt", "hund"], emoji: "🥰🐶" }
    ]
  },
  {
    id: 6,
    name: "Level 6: Sentences",
    description: "Put words together into simple sentences.",
    words: [
      { text: "katten sover", translation: "the cat is sleeping", syllables: ["katten", "sover"], emoji: "🐱💤" },
      { text: "jeg liker bøker", translation: "I like books", syllables: ["jeg", "liker", "bøker"], emoji: "📚" },
      { text: "solen skinner", translation: "the sun is shining", syllables: ["solen", "skinner"], emoji: "☀️" },
      { text: "hunden løper fort", translation: "the dog runs fast", syllables: ["hunden", "løper", "fort"], emoji: "🐶💨" }
    ]
  }
];

// Tag every word with the distinct letters it's made of (same approach as
// the decodable books above) so other modules can flag "this uses letters
// you haven't unlocked in Letter Journey yet" without duplicating logic.
WORD_LEVELS.forEach((level) => {
  level.words.forEach((word) => {
    const letters = new Set();
    word.text.toUpperCase().replace(/[^A-ZÆØÅ]/g, "").split("").forEach((ch) => letters.add(ch));
    word.requiredLetters = Array.from(letters).sort();
  });
});


if (typeof window !== "undefined") {
  window.NORWEGIAN_LETTERS = NORWEGIAN_LETTERS;
  window.WORD_LEVELS = WORD_LEVELS;
  window.DECODABLE_BOOKS = DECODABLE_BOOKS;
}
