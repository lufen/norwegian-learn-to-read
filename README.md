# norwegian-learn-to-read
Interactive web application for learning to read and write Norwegian with letter sounds and word spelling

## About

A frontend-only, static web app that helps beginners learn to read and write Norwegian:

- **Letters & Sounds** — a grid of all 29 Norwegian letters (A–Å). Clicking a letter plays its sound (via the Web Speech API) and shows example words.
- **Letter Journey** — begins with S and O, then introduces letters in a deliberate order. Existing saved letters are preserved. Repeated recognition unlocks more practice; it is not a claim of lasting mastery. Missed sounds receive listening support and another opportunity to practise.
- **Spell Words** — visual spelling groups and whole-word listening. Individual sound-group controls and blending are available only when the word has a complete set of reviewed unit recordings; otherwise the child is explicitly invited to hear the whole word, normally or slowly. Shows a "🆕" badge for unfamiliar letters or patterns.
- **Write Words** — dictation exercise: listen to a word, then tap letter tiles in order to build it (no keyboard needed). Wrong tiles are rejected immediately so the child self-corrects instead of typing and seeing a diff afterward; two wrong taps in a row on the same slot speaks the needed sound as a hint.
- **Little Books** — sequenced word/picture recognition with optional listening support. The spoken question names the target: success is not proof of independent decoding. Pages remain freely explorable, but every page needs a correct response (with help allowed) before completing a pass and unlocking the next book. Earlier unlocks are preserved without inventing page-completion evidence. Summaries distinguish recognition with and without extra help and offer a calm stopping point. Missing unit recordings are labelled as slow whole-word listening.
- **Write Letters** — animated stroke-order demo for each letter; the child writes on real paper while watching how to form it.
- **Grown-up area** — settings and an evidence-based practice overview, separating self-reports, recognition practice, and word building with or without help.
- **Player profiles** — a 🦁 button switches between child profiles so siblings sharing a device don't mix up progress; each has its own saved letters/words/journey state.
- **Listening and picture challenges** — first-sound treasure hunt, rhyme buddies, syllable stepping stones, uppercase/lowercase partners, and tap-to-order picture stories. Harder rounds require four unassisted successes across three items in the latest six attempts, with the latest two unassisted. A mistake or answer-revealing hint affects the next round even if the current round is abandoned. Replays remain free; the child can choose fewer options until choosing adaptive options again. Lifetime achievements are retained separately, and older profiles without recent evidence start gently.
- **Short practice rounds** — up to five distinct tasks, capped by the word level's available content, with matching progress dots and a calm finish-or-continue choice. Changing word levels starts a fresh short round without erasing saved practice. There are no countdowns, streak penalties, or mandatory extra rounds.
- **Simpler home screen** — a profile-specific “Fortsett å leke” button, picture-based alternatives, and optional word/book suggestions using letters already recognised in the journey. Suggestions rotate on home visits, alternating new practice and revisits where available and avoiding the previous suggestion when alternatives exist. Practice history and per-profile suggestion counts guide selection; viewing a suggestion does not mark it completed. Suggestions never unlock books or certify reading readiness.

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
js/audio.js           Shared audio playback, optional reviewed recordings, sound-unit blending, cancel
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
js/practice-session.js Short practice rounds, progress dots, stopping points
js/challenges.js       Five listening, letter, and picture-story challenges
js/app.js              Navigation/router, profile switcher, session-break reminder, app bootstrap
```

## Notes

- No backend or account is required; progress and settings are stored in the browser's `localStorage`.
- **Audio limitation:** educator-reviewed recordings have not been supplied and are not bundled. The app supports reviewed recordings, but currently falls back to the browser's Web Speech API with a Norwegian voice when available. Synthesised consonants may still sound like letter names and pronunciation varies by device; the fallback is not equivalent to reviewed phonics audio. A grown-up should check pronunciation before independent use.
- Sounding out uses explicitly grouped sound units for supported words, rather than assuming every written letter is a separate sound. Norwegian pronunciation depends on the word and dialect; content and recordings still need review by a Norwegian early-literacy educator.
- Challenge results describe performance in the activity, not a diagnosis or a validated assessment of reading ability. Paper handwriting completion is self-reported; the app does not assess pencil strokes.
- There is no package manager, build step, or automated test suite in this repository. For manual checks, serve the site, try each activity through a full round and a retry, switch profiles, and verify that progress stays separate. Also check browser back/forward, replay during feedback, missing audio, narrow screens, keyboard navigation, and the grown-up settings.
- Regression checks: finish the four-sentence level without changing levels; switch word levels mid-round; check whole-word labels with an empty recording registry; try a mistake after harder challenges unlock; choose fewer options and switch profiles; visit a book's last page before answering earlier pages; revisit home after practising a suggested word or book.
- **Human validation remains outstanding:** a Norwegian early-literacy educator should review pronunciation and content. With a caregiver's supervision, observe whether a five-year-old can start, recover from a mistake, recognise a familiar sound in a new context, and find a stopping point. Software checks cannot establish those outcomes.

### Adding reviewed phonics recordings

Register licensed, educator-reviewed audio in `NORWEGIAN_RECORDINGS` in `js/data.js`.
Each entry needs a same-origin HTTP(S) `src`, `reviewStatus: "educator-reviewed"`,
`reviewedBy`, a real `reviewedAt` date (`YYYY-MM-DD`), `locale: "nb-NO"`, and `dialect`.
Keep the files within this static site so GitHub Pages can serve them. Do not mark
synthetic or unchecked audio as reviewed. The metadata records a review; the app
cannot verify the educator's assessment.

Keys identify either a letter (`letter:b`), a whole word (`word:sky`), or a
zero-based, word-specific group (`unit:sky:0`, for the `sk` in `sky`).
Use relative asset paths such as `./audio/filename.ogg` to preserve GitHub Pages
subdirectory hosting.

Review isolated consonants for unwanted added vowels, check word-specific sound
units and dialect consistency, and confirm permission to distribute each file.
When a recording is missing or cannot play, the app uses its labelled synthesis
fallback. Word-specific fragments without recordings use the containing word
rather than inventing a pronunciation for an isolated spelling fragment.
