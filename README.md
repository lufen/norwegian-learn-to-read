# norwegian-learn-to-read
Interactive web application for learning to read and write Norwegian with letter sounds and word spelling

## About

A frontend-only, static web app that helps beginners learn to read and write Norwegian:

- **Letters & Sounds** — a grid of all 29 Norwegian letters (A–Å). Clicking a letter plays its sound (via the Web Speech API) and shows example words.
- **Letter Journey** — a progression game: you start with a couple of random letters, each letter must be answered correctly a few times to be mastered, and new random letters unlock once every letter in play is mastered. A wrong answer on an already-mastered letter demotes it (it needs to be recalled correctly again), and missed letters are retested again soon rather than possibly not again all session.
- **Spell Words** — words are broken into phonemes/syllables that can be played individually and then blended into the full word. Shows a "🆕" badge when a word uses letters not yet unlocked in Letter Journey.
- **Write Words** — dictation exercise: listen to a word, then tap letter tiles in order to build it (no keyboard needed). Wrong tiles are rejected immediately so the child self-corrects instead of typing and seeing a diff afterward; two wrong taps in a row on the same slot speaks the needed sound as a hint.
- **Little Books** — a sequenced, gradually unlocking path from first-word matching to tiny sentences and short decodable stories. Each book uses its own small, closed word bank so every comprehension check stays fully decodable. The child sees the print first and must attempt it before any audio plays — "Hear it" and "Sound it out with me" are available on request at any time, not faded by level. A wrong answer re-teaches the word by sounding it out instead of just saying "try again." Finishing a book shows an honest summary of what was read independently vs. with help (never "mastered"), with a calm stop point and an optional invite to re-read with a grown-up. See `docs/little-books-design.md` for the full design rationale and the reading-research it's based on.
- **Write Letters** — animated stroke-order demo for each letter; the child writes on real paper while watching how to form it.
- **My Progress** — three distinct stats: letters *mastered in Letter Journey* (tested via repeated correct answers), letters/words self-reported as known elsewhere in the app — kept separate so "mastered" isn't overclaimed from a single self-tap.
- **Player profiles** — a 🦁 button switches between child profiles so siblings sharing a device don't mix up progress; each has its own saved letters/words/journey state.

See `docs/app-design-spec.md` for the full-app goal, research basis, and the teacher/student rubber-duck review this app has been through.

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
js/data.js            Norwegian letters & word dataset (levels 1-6)
js/audio.js           Speech synthesis wrapper — shared letter-sound cue, blending sequences, cancel
js/sound-button.js    Shared tap-to-hear button component used by every module
js/settings.js        Text size, dyslexia-friendly font, audio speed (persisted)
js/profiles.js         Per-child profile switching (localStorage)
js/progress.js         Mastered letters/words tracking, profile-scoped (localStorage)
js/curriculum.js       Tags words/books with required letters; "new letters" badge helper
js/alphabet.js         Letters & Sounds module
js/journey.js          Letter Journey progression game
js/reading.js          Decodable mini-books and comprehension
js/handwriting.js      Animated stroke-order demo (letter formation guide)
js/letter-strokes.js   Stroke path data used to animate each letter
js/spelling.js         Spell Words module
js/writing.js          Write Words (tap-to-build letter tiles) module
js/child-confirm.js    Child-safe confirmation/reminder overlay (replaces browser confirm())
js/progress-page.js    My Progress summary page
js/settings-menu.js    Settings panel UI
js/app.js              Navigation/router, profile switcher, session-break reminder, app bootstrap
```

## Notes

- No backend or account is required; progress and settings are stored in the browser's `localStorage`.
- Audio uses the browser's built-in Web Speech API with a Norwegian (`nb-NO`) voice when available, so no audio files need to be bundled.
