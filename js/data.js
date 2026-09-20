/**
 * Norwegian Learn to Read/Write — content dataset.
 * Exposes NORWEGIAN_LETTERS and WORD_LEVELS on window for use by other scripts.
 */

const NORWEGIAN_LETTERS = [
  { letter: "A", sound: "ah", examples: ["and (duck)", "app (monkey)", "arm (arm)"] },
  { letter: "B", sound: "beh", examples: ["bil (car)", "bok (book)", "ball (ball)"] },
  { letter: "C", sound: "seh", examples: ["cirkus (circus)", "citron (lemon, dialect)"] },
  { letter: "D", sound: "deh", examples: ["dag (day)", "due (pigeon)", "dukke (doll)"] },
  { letter: "E", sound: "eh", examples: ["esel (donkey)", "eple (apple)", "elg (moose)"] },
  { letter: "F", sound: "eff", examples: ["fisk (fish)", "far (father)", "fugl (bird)"] },
  { letter: "G", sound: "geh", examples: ["gris (pig)", "gul (yellow)", "geit (goat)"] },
  { letter: "H", sound: "hoh", examples: ["hund (dog)", "hus (house)", "hest (horse)"] },
  { letter: "I", sound: "ee", examples: ["is (ice cream)", "igle (leech)"] },
  { letter: "J", sound: "yeh", examples: ["jul (christmas)", "jente (girl)"] },
  { letter: "K", sound: "koh", examples: ["katt (cat)", "ku (cow)", "kake (cake)"] },
  { letter: "L", sound: "ell", examples: ["løve (lion)", "lys (light)"] },
  { letter: "M", sound: "emm", examples: ["mor (mother)", "mus (mouse)", "melk (milk)"] },
  { letter: "N", sound: "enn", examples: ["natt (night)", "null (zero)"] },
  { letter: "O", sound: "oh", examples: ["ost (cheese)", "okse (ox)"] },
  { letter: "P", sound: "peh", examples: ["pike (girl)", "penn (pen)"] },
  { letter: "Q", sound: "koo", examples: ["quiz (quiz)"] },
  { letter: "R", sound: "err", examples: ["rev (fox)", "regn (rain)"] },
  { letter: "S", sound: "ess", examples: ["sol (sun)", "sko (shoe)"] },
  { letter: "T", sound: "teh", examples: ["tog (train)", "tre (tree)"] },
  { letter: "U", sound: "oo", examples: ["ugle (owl)", "ull (wool)"] },
  { letter: "V", sound: "veh", examples: ["vann (water)", "vinter (winter)"] },
  { letter: "W", sound: "dobbeltveh", examples: ["wc (toilet, loanword)"] },
  { letter: "X", sound: "eks", examples: ["xylofon (xylophone)"] },
  { letter: "Y", sound: "y", examples: ["ymse (miscellaneous)"] },
  { letter: "Z", sound: "sett", examples: ["zoo (zoo)"] },
  { letter: "Æ", sound: "æh", examples: ["ære (honor)", "sæd (seed, dialect)"] },
  { letter: "Ø", sound: "øh", examples: ["øy (island)", "ørn (eagle)"] },
  { letter: "Å", sound: "oh (rounded)", examples: ["år (year)", "ål (eel)"] }
];

const WORD_LEVELS = [
  {
    id: 1,
    name: "Level 1: Letters",
    description: "Get to know each Norwegian letter and its sound.",
    words: NORWEGIAN_LETTERS.map((l) => ({
      text: l.letter.toLowerCase(),
      translation: l.examples[0] || "",
      syllables: [l.letter.toLowerCase()],
      emoji: "🔤"
    }))
  },
  {
    id: 2,
    name: "Level 2: Short words",
    description: "Simple, short Norwegian words made of a few sounds.",
    words: [
      { text: "katt", translation: "cat", syllables: ["k", "a", "tt"], emoji: "🐱" },
      { text: "hund", translation: "dog", syllables: ["h", "u", "nd"], emoji: "🐶" },
      { text: "sol", translation: "sun", syllables: ["s", "o", "l"], emoji: "☀️" },
      { text: "bil", translation: "car", syllables: ["b", "i", "l"], emoji: "🚗" },
      { text: "ball", translation: "ball", syllables: ["b", "a", "ll"], emoji: "⚽" },
      { text: "mor", translation: "mother", syllables: ["m", "o", "r"], emoji: "👩" },
      { text: "far", translation: "father", syllables: ["f", "a", "r"], emoji: "👨" },
      { text: "hus", translation: "house", syllables: ["h", "u", "s"], emoji: "🏠" },
      { text: "fisk", translation: "fish", syllables: ["f", "i", "sk"], emoji: "🐟" },
      { text: "gul", translation: "yellow", syllables: ["g", "u", "l"], emoji: "🟡" }
    ]
  },
  {
    id: 3,
    name: "Level 3: Common words",
    description: "Longer, everyday Norwegian words.",
    words: [
      { text: "skole", translation: "school", syllables: ["sko", "le"], emoji: "🏫" },
      { text: "bok", translation: "book", syllables: ["b", "o", "k"], emoji: "📖" },
      { text: "vann", translation: "water", syllables: ["v", "a", "nn"], emoji: "💧" },
      { text: "epler", translation: "apples", syllables: ["ep", "ler"], emoji: "🍎" },
      { text: "blomst", translation: "flower", syllables: ["bl", "o", "mst"], emoji: "🌸" },
      { text: "sykkel", translation: "bicycle", syllables: ["syk", "kel"], emoji: "🚲" },
      { text: "vinter", translation: "winter", syllables: ["vin", "ter"], emoji: "❄️" },
      { text: "sommer", translation: "summer", syllables: ["som", "mer"], emoji: "🌞" }
    ]
  },
  {
    id: 4,
    name: "Level 4: Sentences",
    description: "Put words together into simple sentences.",
    words: [
      { text: "katten sover", translation: "the cat is sleeping", syllables: ["katten", "sover"], emoji: "🐱💤" },
      { text: "jeg liker bøker", translation: "I like books", syllables: ["jeg", "liker", "bøker"], emoji: "📚" },
      { text: "solen skinner", translation: "the sun is shining", syllables: ["solen", "skinner"], emoji: "☀️" },
      { text: "hunden løper fort", translation: "the dog runs fast", syllables: ["hunden", "løper", "fort"], emoji: "🐶💨" }
    ]
  }
];

if (typeof window !== "undefined") {
  window.NORWEGIAN_LETTERS = NORWEGIAN_LETTERS;
  window.WORD_LEVELS = WORD_LEVELS;
}
