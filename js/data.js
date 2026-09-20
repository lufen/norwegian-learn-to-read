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
    level: "Start here",
    requiredLetters: ["S", "O", "L", "M", "I", "B", "K", "A", "T"],
    pages: [
      {
        text: "sol",
        picture: "☀️",
        questions: [
          { prompt: "Finn ordet sol.", choices: ["sol", "bil", "katt"], answer: "sol" },
          { prompt: "Finn solen.", choices: ["☀️", "🚗", "🐱"], answer: "☀️" }
        ]
      },
      {
        text: "katt",
        picture: "🐱",
        questions: [
          { prompt: "Finn ordet katt.", choices: ["sol", "katt", "mus"], answer: "katt" },
          { prompt: "Finn katten.", choices: ["☀️", "🐱", "🚗"], answer: "🐱" }
        ]
      },
      {
        text: "bil",
        picture: "🚗",
        questions: [
          { prompt: "Finn ordet bil.", choices: ["bil", "is", "sol"], answer: "bil" },
          { prompt: "Finn bilen.", choices: ["🐱", "🚗", "☀️"], answer: "🚗" }
        ]
      },
      {
        text: "is",
        picture: "🍦",
        questions: [
          { prompt: "Finn ordet is.", choices: ["is", "mus", "bil"], answer: "is" },
          { prompt: "Finn isen.", choices: ["🍦", "🐭", "☀️"], answer: "🍦" }
        ]
      }
    ]
  },
  {
    id: "tiny-sentences",
    title: "Tiny sentences",
    level: "Next step",
    requiredLetters: ["S", "O", "L", "M", "I", "B", "K", "A", "T", "E", "R"],
    pages: [
      {
        text: "Se sol.",
        picture: "👀☀️",
        questions: [
          { prompt: "Finn ordet sol.", choices: ["se", "sol", "bil"], answer: "sol" },
          { prompt: "Hva ser du?", choices: ["sol", "katt", "is"], answer: "sol" }
        ]
      },
      {
        text: "Se katt.",
        picture: "👀🐱",
        questions: [
          { prompt: "Finn ordet katt.", choices: ["sol", "katt", "bil"], answer: "katt" },
          { prompt: "Hva ser du?", choices: ["bil", "is", "katt"], answer: "katt" }
        ]
      },
      {
        text: "Se bil.",
        picture: "👀🚗",
        questions: [
          { prompt: "Finn ordet bil.", choices: ["bil", "sol", "katt"], answer: "bil" },
          { prompt: "Hva ser du?", choices: ["is", "bil", "mus"], answer: "bil" }
        ]
      },
      {
        text: "Sol er gul.",
        picture: "☀️🟡",
        questions: [
          { prompt: "Finn fargen gul.", choices: ["gul", "blå", "rød"], answer: "gul" },
          { prompt: "Hva er gul?", choices: ["sol", "bil", "katt"], answer: "sol" }
        ]
      }
    ]
  },
  {
    id: "sol",
    title: "Sol",
    level: "Story practice",
    requiredLetters: ["S", "O", "L"],
    pages: [
      {
        text: "Sol.",
        picture: "☀️",
        questions: [
          { prompt: "Finn solen.", choices: ["☀️", "🐱", "🚗"], answer: "☀️" },
          { prompt: "Hva ser du?", choices: ["sol", "katt", "bil"], answer: "sol" }
        ]
      },
      {
        text: "Sol er gul.",
        picture: "🟡",
        questions: [
          { prompt: "Hvilken farge er sol?", choices: ["blå", "gul", "rød"], answer: "gul" },
          { prompt: "Hvilket ord betyr yellow?", choices: ["gul", "sol", "bil"], answer: "gul" }
        ]
      },
      {
        text: "Sol lyser.",
        picture: "☀️✨",
        questions: [
          { prompt: "Hva gjør solen?", choices: ["lyser", "sover", "løper"], answer: "lyser" },
          { prompt: "Finn lyset.", choices: ["✨", "💧", "🌙"], answer: "✨" }
        ]
      },
      {
        text: "Se sol.",
        picture: "👀☀️",
        questions: [
          { prompt: "Hva skal du se?", choices: ["sol", "katt", "hus"], answer: "sol" },
          { prompt: "Hvilket ord starter med s?", choices: ["sol", "bil", "og"], answer: "sol" }
        ]
      }
    ]
  },
  {
    id: "katt",
    title: "Katt",
    level: "Story practice",
    requiredLetters: ["K", "A", "T", "S", "O"],
    pages: [
      {
        text: "Katt.",
        picture: "🐱",
        questions: [
          { prompt: "Finn katten.", choices: ["🐶", "🐱", "🐟"], answer: "🐱" },
          { prompt: "Hva ser du?", choices: ["katt", "sol", "bil"], answer: "katt" }
        ]
      },
      {
        text: "Katt sover.",
        picture: "🐱💤",
        questions: [
          { prompt: "Hva gjør katten?", choices: ["sover", "løper", "spiser"], answer: "sover" },
          { prompt: "Finn det som viser søvn.", choices: ["💤", "☀️", "🚗"], answer: "💤" }
        ]
      },
      {
        text: "Katt ser sol.",
        picture: "🐱👀☀️",
        questions: [
          { prompt: "Hva ser katten?", choices: ["sol", "mus", "hus"], answer: "sol" },
          { prompt: "Hvem ser?", choices: ["katt", "sol", "bil"], answer: "katt" }
        ]
      },
      {
        text: "Katt løper.",
        picture: "🐱💨",
        questions: [
          { prompt: "Hva gjør katten nå?", choices: ["løper", "sover", "sitter"], answer: "løper" },
          { prompt: "Finn fart.", choices: ["💨", "💤", "💧"], answer: "💨" }
        ]
      }
    ]
  },
  {
    id: "bil",
    title: "Bil",
    level: "Story practice",
    requiredLetters: ["B", "I", "L", "S", "O"],
    pages: [
      {
        text: "Bil.",
        picture: "🚗",
        questions: [
          { prompt: "Finn bilen.", choices: ["🚗", "🐱", "☀️"], answer: "🚗" },
          { prompt: "Hva ser du?", choices: ["bil", "sol", "katt"], answer: "bil" }
        ]
      },
      {
        text: "Bil er blå.",
        picture: "🚙🔵",
        questions: [
          { prompt: "Hvilken farge er bilen?", choices: ["blå", "gul", "rød"], answer: "blå" },
          { prompt: "Hvilket ord betyr blue?", choices: ["blå", "bil", "sol"], answer: "blå" }
        ]
      },
      {
        text: "Bil kjører.",
        picture: "🚗💨",
        questions: [
          { prompt: "Hva gjør bilen?", choices: ["kjører", "sover", "spiser"], answer: "kjører" },
          { prompt: "Finn bilen som kjører.", choices: ["🚗💨", "🐱💤", "☀️"], answer: "🚗💨" }
        ]
      },
      {
        text: "Se bil.",
        picture: "👀🚗",
        questions: [
          { prompt: "Hva skal du se?", choices: ["bil", "katt", "sol"], answer: "bil" },
          { prompt: "Hvilket ord starter med b?", choices: ["bil", "sol", "is"], answer: "bil" }
        ]
      }
    ]
  },
  {
    id: "mus",
    title: "Mus",
    level: "Story practice",
    requiredLetters: ["M", "U", "S", "O", "L"],
    pages: [
      {
        text: "Mus.",
        picture: "🐭",
        questions: [
          { prompt: "Finn musen.", choices: ["🐭", "🐶", "🐟"], answer: "🐭" },
          { prompt: "Hva ser du?", choices: ["mus", "sol", "bil"], answer: "mus" }
        ]
      },
      {
        text: "Mus ser sol.",
        picture: "🐭👀☀️",
        questions: [
          { prompt: "Hva ser musen?", choices: ["sol", "katt", "hus"], answer: "sol" },
          { prompt: "Hvem ser?", choices: ["mus", "sol", "bil"], answer: "mus" }
        ]
      },
      {
        text: "Mus løper.",
        picture: "🐭💨",
        questions: [
          { prompt: "Hva gjør musen?", choices: ["løper", "sover", "sitter"], answer: "løper" },
          { prompt: "Finn fart.", choices: ["💨", "💤", "☀️"], answer: "💨" }
        ]
      },
      {
        text: "Mus er liten.",
        picture: "🐭🤏",
        questions: [
          { prompt: "Hvordan er musen?", choices: ["liten", "stor", "gul"], answer: "liten" },
          { prompt: "Finn musen.", choices: ["🐭", "🐘", "🚗"], answer: "🐭" }
        ]
      }
    ]
  }
];

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
    name: "Level 2: Short words",
    description: "Simple, short Norwegian words made of a few sounds.",
    words: [
      { text: "katt", translation: "cat", phonemes: ["k", "ɑ", "t", "t"], syllables: ["k", "a", "tt"], emoji: "🐱" },
      { text: "hund", translation: "dog", phonemes: ["h", "ʉ", "n", "d"], syllables: ["h", "u", "nd"], emoji: "🐶" },
      { text: "sol", translation: "sun", phonemes: ["s", "u", "l"], syllables: ["s", "o", "l"], emoji: "☀️" },
      { text: "bil", translation: "car", phonemes: ["b", "i", "l"], syllables: ["b", "i", "l"], emoji: "🚗" },
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
  window.DECODABLE_BOOKS = DECODABLE_BOOKS;
}
