# norwegian-learn-to-read
Interactive web application for learning to read and write Norwegian with letter sounds and word spelling

## About

A frontend-only, static web app that helps beginners learn to read and write Norwegian:

- **Letters & Sounds** — a grid of all 29 Norwegian letters (A–Å). Clicking a letter plays its sound (via the Web Speech API) and shows example words.
- **Spell Words** — words are broken into phonemes/syllables that can be played individually and then blended into the full word.
- **Write Words** — dictation exercise: listen to a word and type it; the app checks your spelling and highlights matches/mismatches.
- **My Progress** — tracks mastered letters and words locally (no login required).

## Running locally

This is a static site with no build step. Serve the folder with any static file server, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a modern browser (Chrome/Edge recommended for the best Norwegian speech-synthesis voice support).

## Project structure

```
index.html          Main page / app shell
css/style.css        Norwegian flag-themed, responsive, accessible styling
js/data.js            Norwegian letters & word dataset (levels 1-4)
js/audio.js           Speech synthesis wrapper (letter/word pronunciation)
js/settings.js        Text size, dyslexia-friendly font, audio speed (persisted)
js/progress.js         Mastered letters/words tracking (localStorage)
js/alphabet.js         Letters & Sounds module
js/spelling.js         Spell Words module
js/writing.js          Write Words (dictation) module
js/progress-page.js    My Progress summary page
js/settings-menu.js    Settings panel UI
js/app.js              Navigation/router and app bootstrap
```

## Notes

- No backend or account is required; progress and settings are stored in the browser's `localStorage`.
- Audio uses the browser's built-in Web Speech API with a Norwegian (`nb-NO`) voice when available, so no audio files need to be bundled.
