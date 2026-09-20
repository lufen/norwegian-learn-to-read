# norwegian-learn-to-read
Interactive web application for learning to read and write Norwegian with letter sounds and word spelling

## About

A frontend-only, static web app that helps beginners learn to read and write Norwegian:

- **Letters & Sounds** — a grid of all 29 Norwegian letters (A–Å). Clicking a letter plays its sound (via the Web Speech API) and shows example words.
- **Letter Journey** — a progression game: you start with just two letters, each letter must be answered correctly a few times to be mastered, and a new letter unlocks once every letter in play is mastered.
- **Spell Words** — words are broken into phonemes/syllables that can be played individually and then blended into the full word.
- **Write Words** — dictation exercise: listen to a word and type it; the app checks your spelling and highlights matches/mismatches. A simple content filter prevents inappropriate typed words from being echoed back on screen.
- **Little Books** — a gradual path from first-word matching to tiny sentences and short decodable stories. Every book uses only its own small word bank, so all comprehension questions stay fully decodable; the sentence and the question are both spoken aloud automatically so a child can play through independently, without a parent needing to read anything out loud.
- **Write Letters** — animated stroke-order demo for each letter; the child writes on real paper while watching how to form it.
- **My Progress** — tracks mastered letters and words locally (no login required).

## Running locally

This is a static site with no build step. Serve the folder with any static file server, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a modern browser (Chrome/Edge recommended for the best Norwegian speech-synthesis voice support).

## GitHub Pages

The site deploys automatically to [GitHub Pages](https://lufen.github.io/norwegian-learn-to-read/) when changes are pushed to `main`. In the repository's **Settings → Pages**, select **GitHub Actions** as the deployment source.

## Project structure

```
index.html          Main page / app shell
css/style.css        Norwegian flag-themed, responsive, accessible styling
js/data.js            Norwegian letters & word dataset (levels 1-4)
js/audio.js           Speech synthesis wrapper (letter/word pronunciation)
js/settings.js        Text size, dyslexia-friendly font, audio speed (persisted)
js/progress.js         Mastered letters/words tracking (localStorage)
js/alphabet.js         Letters & Sounds module
js/journey.js          Letter Journey progression game
js/reading.js          Decodable mini-books and comprehension
js/handwriting.js      Animated stroke-order demo (letter formation guide)
js/letter-strokes.js   Stroke path data used to animate each letter
js/spelling.js         Spell Words module
js/writing.js          Write Words (dictation) module
js/content-filter.js   Blocked-word list for the dictation free-text input
js/progress-page.js    My Progress summary page
js/settings-menu.js    Settings panel UI
js/app.js              Navigation/router and app bootstrap
```

## Notes

- No backend or account is required; progress and settings are stored in the browser's `localStorage`.
- Audio uses the browser's built-in Web Speech API with a Norwegian (`nb-NO`) voice when available, so no audio files need to be bundled.
