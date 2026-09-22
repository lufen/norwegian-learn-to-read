# Norwegian Learn-to-Read — Full App Design Spec

> Companion to `docs/little-books-design.md` (which covers the Little Books
> activity in depth). This doc covers the whole app: what it's for, how its
> parts fit together, and the research basis for each activity. Written to
> be challenged — see "Open review" at the bottom once reviewed.

## 1. Goal
Help a Norwegian-speaking 5-year-old go from "knows the alphabet exists" to
"can sound out and write simple, familiar words" — entirely through short,
self-directed play sessions, usable without an adult operating the device,
though adult co-reading/co-writing is explicitly invited, not replaced.

## 2. Target user
A 5-year-old, pre-reader or very-beginning reader, who:
- Speaks Norwegian at home/kindergarten (oral language is assumed largely
  in place; this is not a language-learning app).
- Can operate a touchscreen/mouse (tap, click) but not necessarily a
  keyboard fluently.
- Has a short attention span (single-digit minutes per sitting) and needs
  frequent, genuine encouragement rather than score pressure.

## 3. The learning journey (how activities connect)
The app is not one game; it's a small suite of activities meant to be used
in roughly this order, though a child can jump around freely (no forced
onboarding gate):

1. **Letters & Sounds** (`alphabet.js`) — a browsable reference: tap any
   letter, hear its *sound* (not its name), see example words. No
   scoring — this is "look things up," not a game.
2. **Letter Journey** (`journey.js`) — the actual letter-sound learning
   game: starts with 2 random letters, hear a sound, tap the matching
   letter from up to 4 options; 3 correct answers "masters" a letter, and
   mastering all currently-unlocked letters unlocks 2 more. This is
   spaced-repetition-style retrieval practice for letter–sound mapping.
3. **Write Letters** (`handwriting.js`) — once a letter's sound is known,
   this shows an *animated stroke-order demo* (not on-screen tracing) so
   the child copies the letter onto real paper with a real pencil — matching
   how handwriting motor skill is actually built.
4. **Little Books** (`reading.js`) — the bridge into real reading: blend
   known letter-sounds into small, closed word banks, read short
   sentences/stories built only from those words, get audio support
   on request (not forced), and a transfer-word check near the end to
   verify real decoding. Full design/rationale: `docs/little-books-design.md`.
5. **Spell Words** (`spelling.js`) — an assisted phoneme-blending tool:
   pick a word, hear each letter/chunk's sound individually, then hear the
   whole word blended. Self-paced, not scored — reinforces blending using
   longer/harder words than Little Books' tightly-controlled word banks.
6. **Write Words** (`writing.js`) — dictation: hear a word, type it,
   get letter-by-letter comparison feedback. This is the app's only
   keyboard-typing activity.
7. **My Progress** (`progress-page.js`) — a simple dashboard: letters and
   words "mastered" counts, with a reset button.

## 4. Research basis (summary; full citations in Little Books doc)
- **Simple View of Reading** (Gough & Tunmer): decoding × language
  comprehension. The app's core effort (Letter Journey → Little Books) is
  decoding practice, since oral Norwegian is assumed largely in place.
- **Decodable-text principles**: Little Books enforces closed, per-book
  word banks so nothing appears that hasn't been "taught" within that book.
- **Orthographic mapping / self-teaching hypothesis** (Ehri; Share):
  repeated *successful decoding* — not passive repetition — builds
  automatic word recognition; Little Books' transfer-word check exists
  specifically to verify decoding happened, not memorization.
- **Retrieval practice / spaced repetition**: Letter Journey's
  unlock-by-mastery mechanic is a simplified spaced-repetition loop for
  letter–sound pairs.
- **Handwriting instruction**: motor learning for letter formation is best
  done with a real pencil on paper; screen-based tracing has weaker
  transfer than watching correct stroke order, then producing it on paper —
  hence Write Letters is a demo, not a touchscreen tracing pad.

## 5. Known tensions / things this spec does **not** yet resolve
Being honest about likely problems before an outside review, rather than
presenting the app as finished:

- **Write Words requires keyboard typing.** Every other activity in the app
  is deliberately tap/click-only or paper-based (per the handwriting
  redesign), but Write Words asks a 5-year-old to type full words —
  and at "Level 4" even full sentences with spaces and punctuation — on a
  physical keyboard. This is a real inconsistency in the app's own stated
  philosophy and is very likely too hard for the target age without heavy
  adult help, contradicting "usable without an adult."
- **WORD_LEVELS is not leveled by real difficulty.** "Level 2: short
  words" already includes consonant clusters (*fisk*, *hund*) and doubled
  consonants (*ball*, *hus*→no, *katt*); "Level 3" includes multi-syllable
  words (*sykkel*, *blomst*) with clusters not taught anywhere; "Level 4"
  jumps straight to full sentences. There's no declared sound-scope
  progression here the way Little Books now has — Spell Words and Write
  Words could easily present a word using letter combinations the child
  has never encountered.
- **No audio/spoken labels on the Home screen menu.** The core "no adult
  required" principle established for Little Books isn't consistently
  applied app-wide — home-tile buttons show icon + bilingual text but don't
  speak their name aloud when focused/tapped, so a non-reading child relies
  on icon recognition alone (or a parent) to navigate between activities.
- **Spell Words and Write Words don't share Little Books' safeguards.**
  They aren't gated by any prerequisite, aren't decodability-checked against
  a defined letter scope, and Spell Words has no correctness check at all
  (it's exploratory only) while Write Words is a hard pass/fail typing test
  — a large difficulty/format gap between the two "word" activities that
  sit next to each other in the nav.
- **"Mastered" is used inconsistently.** Letters and words are marked
  "mastered" from a single correct tap/typed match (Alphabet, Journey,
  Spelling, Writing), while Little Books deliberately avoids the word
  "mastered" after the redesign. The rest of the app still overclaims in
  the same way Little Books used to.

## 6. Non-goals
- Not a full Norwegian curriculum or school replacement.
- Not attempting speech recognition / pronunciation scoring.
- Not a vocabulary or general-knowledge trainer beyond words needed for
  each activity's own content.

## 7. What "done" looks like for the app as a whole
A 5-year-old can open the app cold, without a parent reading anything to
them, move between Letters & Sounds → Letter Journey → Write Letters →
Little Books in a session, and each activity's difficulty is honestly
matched to what's already been taught elsewhere in the app — no activity
silently assumes vocabulary, letter combinations, or motor/typing skills
the child hasn't been given a fair chance to build first.

## 8. Review findings & response

This spec was challenged with two independent rubber-duck reviews before
any code changed: a **teacher review** (pedagogy/learning-science lens)
and a **student review** (literal 5-year-old, moment-to-moment usability
lens, screen by screen). Both reviews converged, independently, on the
same top issue: Write Words' keyboard-typing requirement is both
pedagogically wrong (tests typing, not spelling knowledge) and literally
inoperable by the target user (a 5-year-old can't reliably type, doesn't
know what "Check" means, and can't read color-coded text diffs).

### Fixed in this pass
- **Write Words rewritten** from free-text keyboard dictation to
  tap-to-build letter tiles: the child hears the word, then taps letters
  in order into empty slots from a shuffled bank (target letters + a
  couple of distractors); a wrong tap is rejected immediately instead of
  being typed and shown wrong afterward. No keyboard needed anywhere in
  the app.
- **Content filter removed** (`js/content-filter.js` deleted): it existed
  solely to guard the one free-text input surface, which no longer exists.
- **Home tiles and top nav now speak the destination name** before
  navigating, so a non-reading child isn't purely icon-guessing.
- **Destructive resets** (Letter Journey "start over", My Progress
  "reset") now use a shared child-safe confirmation overlay
  (`js/child-confirm.js`) — large icon-led Yes/No buttons with a spoken
  prompt — instead of a browser `confirm()` dialog, which a non-reader
  can't judge and could tap through by accident.

### Explicitly deferred (flagged by both reviews, needs dedicated work)
- A shared curriculum / scope-and-sequence map tying Letter Journey,
  Little Books, Spell Words, and Write Words together so each activity's
  difficulty is provably matched to what's already been taught.
- Letter Journey's "3 correct = mastered" threshold doesn't demonstrate
  durable learning (no spaced/delayed retrieval) and its distractor
  design at 3+ unlocked letters can let a child pattern-match/guess
  rather than actually know letter sounds.
- Rebalancing `WORD_LEVELS`' actual difficulty progression (Level 2
  already has consonant clusters, Level 3 has untaught clusters, Level 4
  jumps straight to multi-word sentences).
- Consistent "mastered" language across Alphabet/Journey/Spelling/Writing
  (Little Books already avoids this after its redesign; the rest of the
  app still overclaims).
- A defined error-response/re-teaching model for wrong answers, applied
  app-wide (not just Write Words' immediate-reject).
- Broader spoken-instruction coverage per screen (this pass only fixed
  Home/nav labels and reset dialogs, not every in-activity instruction).
- Per-child profiles, and session/fatigue-aware pacing.

## 9. Deferred items — built in a follow-up pass

All seven items deferred in §8 have since been implemented:

- **Curriculum map** (`js/curriculum.js`): every word/book is tagged with
  the distinct letters it uses (already existed for books, now added for
  `WORD_LEVELS` too). Spell Words and Write Words show a small "🆕" badge
  when a word uses letters not yet unlocked in Letter Journey. This is
  advisory, not a hard lock — free exploration is preserved — but the
  mismatch is now visible instead of silent.
- **Letter Journey mastery rigor**: a wrong answer on an already-mastered
  letter now demotes its score by one instead of leaving "mastered"
  permanent from a single earlier streak, and missed letters go into a
  short-lived retry queue so they're retested soon rather than possibly
  not again all session — a real (if still simple) spaced-recall check
  instead of one streak proving durable knowledge forever.
- **`WORD_LEVELS` rebalanced**: split into 6 honest steps — Letters →
  Level 2 Simple words (no clusters/doubles) → Level 3 Tricky letters
  (clusters/doubled consonants) → Level 4 Longer words (2-3 syllables) →
  Level 5 Two-word phrases (new bridge step) → Level 6 Sentences.
  Previously Level 2 already contained clusters and Level 4 jumped
  straight from single words to full sentences.
- **Consistent mastery language**: Alphabet's and Spell Words' self-report
  buttons no longer say "mastered" (now "I know this letter" / "I can read
  this word"), reserving "mastered" for Letter Journey's tested, repeated-
  correct-answer result. My Progress now shows three distinct stats:
  letters mastered *in Letter Journey* (tested), letters/words
  self-reported as known, matching Little Books' existing honest framing.
- **App-wide error/re-teaching model**: Write Words now speaks the needed
  letter's sound as a hint after two wrong taps on the same slot instead
  of just repeating "wrong"; Little Books' question prompt is now spoken
  automatically when a new question appears (previously only on manual
  replay), on top of its existing sound-it-out-on-a-miss behavior.
- **Spoken instructions per screen**: Alphabet, Letter Journey, Spell
  Words, Write Letters, Write Words, and My Progress each speak a short
  one-time instruction the first time they're opened in a session.
- **Per-child profiles + session pacing**: `js/profiles.js` adds a
  profile switcher (🦁 button, top right) so siblings sharing a device
  don't mix up progress; the first/default profile transparently reuses
  the original storage key so existing progress isn't lost. A gentle,
  dismissible "time for a break?" reminder appears after 15 minutes of
  continuous play (not a hard stop, since a good session length varies a
  lot per child).

## 10. Open review
Reviewed by parallel teacher + student rubber-duck passes; all identified
fixes and deferred items are now implemented (see §8-9). Re-review
recommended once real usage data exists, particularly on whether Letter
Journey's revised mastery/retry logic and the new phrase level actually
land well with a 5-year-old in practice.

## 11. IA/design review round 3 — teacher + student + adversarial (not yet fixed)
Ran three independent rubber-duck passes against the app's *current* state
(post §8-9 fixes): a **teacher** persona (curriculum/IA/assessment rigor),
a **student** persona (literal 5-year-old operating it alone), and an
**adversarial** persona (actively trying to break it via misuse, timing,
multi-profile, and IA contradictions). Nothing below has been implemented
yet — this is findings only, pending a decision to build them.

### Blocking (undermines a core claim of the app)
1. **Cross-profile data bleed.** `js/reading.js`'s post-correct-answer
   `setTimeout` (~1.1s) is not cancelled on navigation. If a profile is
   switched or progress reset while it's pending, it fires afterward and
   writes the old profile's reading state into the new/reset profile's
   storage, then force-navigates there. Breaks profile isolation.
2. **"Independent reading" isn't measurable.** `js/reading.js` auto-speaks
   `spokenPrompt`, which itself often contains or implies the answer
   (e.g. "Find the word X" / "Point to the picture of X"), yet a correct
   tap with no help button pressed is still logged as independent/unaided
   reading. A child can succeed by listening alone, never decoding print.
3. **Letter unlock order is effectively random.** `js/journey.js` defines
   `LETTER_ORDER` but never uses it — `loadJourney()`/`unlockIfReady()`
   both draw from the full locked pool at random. Breaks the assumption
   (baked into books/word levels) that letters are introduced in a
   defined sequence.
4. **Little Books word banks aren't actually closed/cumulative.** Several
   books' declared `wordBank` in `js/data.js` omits words their own pages
   use (e.g. `Se`, `er`, `ser` appear in pages but not in the bank for
   `tiny-sentences`, `sol`, `katt`, `bil`). The "known word" premise the
   activity is built on doesn't hold for the shipped content.
5. **Book unlocking has no real decoding checkpoint.** Only one book
   (`mus`) defines a `transferWord`, it's shown only 50% of the time via
   `createQuestion()`, and `summary-continue` unlocks the next book
   unconditionally — with no record that any transfer word was even
   attempted. Progression measures button-pressing, not decoding.
6. **Profile creation is impossible for the target user.**
   `js/profiles.js`'s `create()` is triggered via a plain `window.prompt()`
   — an English, keyboard-required native dialog a non-reading 5-year-old
   cannot use alone.
7. **Little Books has two functional bugs**: `.reading-choice` buttons
   aren't disabled immediately on a correct tap (only after a ~1100ms
   delay), so rapid tapping can skip a page; and the `#summary-home`
   "take a break" button sets `location.hash = ""` with no
   `hashchange` listener anywhere, making it a dead no-op control.
8. **Destructive-action dialogs speak English.** `ChildConfirm.show()`
   calls in `js/journey.js`/`js/progress-page.js` (reset confirmations)
   pass English `spokenMessage` text, unlike the rest of the app's
   Norwegian-first spoken instructions.

### Non-blocking (design debt, worth fixing but not urgent)
- Home tile order, top-nav order, and the spec's own recommended learning
  order (§3) all disagree with each other; Little Books is the most
  visually "primary" route on Home despite having zero letter-readiness
  gating (no `Curriculum` check at all in `js/reading.js`).
- The "Journey-mastered" vs "self-reported" letter stats on the Progress
  page read from the same underlying `state.letters` field
  (`js/progress.js`), so they can show contradictory numbers (e.g. more
  self-reported than journey-mastered when demotion has occurred) instead
  of being two genuinely separate measures.
- `js/curriculum.js`'s "🆕 new letter" badge only diffs distinct capital
  letters — no concept of digraphs (`kj`, `sk`) or word difficulty — and
  has no audio, only an English `title` tooltip, so it's meaningless to a
  non-reader anyway.
- Session-pacing timer/`breakReminderShown` in `js/app.js` isn't reset on
  `NorwegianProfiles.switchTo()`, so a sibling can inherit a stale
  break-reminder countdown.
- Persisted activity indices (`pageIndex`, `wordIndex`, etc.) are only
  clamped upward (`Math.min`); a stray negative/stale value blanks the
  activity instead of resetting to a safe default.
- A malformed active profile ID (`activeId` not present in `profiles`)
  silently displays a fallback profile in the UI while still reading and
  writing to the invalid profile's storage key.
- Minor UX polish: nav speaks the destination only after tap, not before;
  Write Letters/Write Words share an ambiguous ✍️ icon; level pickers and
  the curriculum badge have no spoken labels; `ChildConfirm`'s backdrop
  tap silently dismisses without recording either choice.

**Convergent findings** (flagged independently by 2+ of the 3 reviews, a
strong signal for priority): #2 (independent-reading validity), #4/#5
(book bank/unlock rigor), the Journey/self-report stat entanglement, and
the curriculum badge's shallowness/inaudibility.

### Response — built in this pass
All 8 blocking issues and most non-blocking issues above are now fixed:
- **Cross-profile bleed**: `NorwegianProgress` now exposes an `epoch`,
  bumped on `reloadState()`/`reset()`. `js/reading.js`'s deferred
  `setTimeout` callbacks capture the epoch when scheduled and abort (no
  save, no navigate) if it's changed by the time they fire.
- **Independent-reading validity**: questions are now tagged
  `type: "word" | "picture"`; only `"word"` matches (which require reading
  print, not just recognizing a picture from a spoken word) count toward
  "read without help" — picture-matches are tracked separately and shown
  as "recognized the picture" in the book summary, not conflated with
  reading.
- **Letter unlock order**: left intentionally random, per an explicit
  earlier product decision in this session ("start with two random
  letters, unlock more at random") — this was *not* reverted. `LETTER_ORDER`
  remains only as a display-order/fallback hint; the curriculum badge
  already handles alignment generically regardless of unlock order.
- **Little Books word banks**: fixed to be genuinely closed — every word
  actually used in each book's pages (including small function words like
  "se"/"er") is now in that book's `wordBank`.
- **Book unlock checkpoint**: every book with a `transferWord` now always
  tests it on the last page (was 50%), and the existing wrong-answer
  retry/re-teach loop means a book can't be finished without eventually
  answering it correctly. Added `transferWord`s to the "sol", "katt", and
  "bil" books (previously only "mus" had one), each spellable purely from
  letters already met in that book.
- **Profile creation**: `window.prompt()` replaced with a tap-only avatar
  picker (no typing/reading required at all) in `js/app.js`;
  `js/profiles.js`'s `create()` now accepts an avatar directly.
- **Little Books bugs**: choice buttons are now disabled the instant a tap
  lands (not after the ~1.1s pause), preventing rapid-tap page skips; the
  "🏠 Take a break" button now actually navigates home via `window.App`.
- **Norwegian-first dialogs**: `ChildConfirm` reset confirmations in
  `js/journey.js`/`js/progress-page.js` now speak Norwegian.
- **Journey/self-report entanglement**: `js/journey.js` no longer calls
  `markLetterMastered()` on tested mastery — that would double-write into
  the same `state.letters` bucket used by the self-report "I know this
  letter" button in `js/alphabet.js`. The two stats are now genuinely
  independent.
- **Curriculum badge**: now also flags common Norwegian sound patterns
  (`kj`, `sk`, `skj`, `sj`, `gj`, `ng`), not just distinct letters, and is
  a tappable button that speaks its explanation in Norwegian (it's a
  `SoundButton`, so no per-module wiring), shown in Spell Words, Write
  Words, and Little Books.
- **Session pacing on profile switch**: `resetSessionPacing()` now runs
  whenever the active profile changes, so a sibling starts a fresh
  15-minute clock instead of inheriting one.
- **Malformed profile ID**: `js/profiles.js`'s `load()` now falls back to
  the first profile if a stored `activeId` doesn't match any profile.
- **Persisted index lower-bound**: `spelling.js`/`writing.js`/`reading.js`
  now clamp indices with `Math.max(0, ...)`, not just `Math.min`.
- **IA alignment**: Home tile order, top-nav order, and §3's recommended
  order now all agree (Alphabet → Journey → Write Letters → Little Books →
  Spell Words → Write Words → Progress); Write Words' icon changed from
  ✍️ to 📝 to disambiguate from Write Letters.
- **Dead-control class fix**: added a `hashchange` listener in `js/app.js`
  so any control that sets `location.hash` directly (not just explicit nav
  clicks) actually navigates — this was the root cause of the dead
  "take a break" button and could have affected browser back/forward too.

Not yet actioned (left as-is, lower priority): nav speaking the
destination only after tap rather than before; level pickers not having
individual spoken labels; `ChildConfirm`'s backdrop-tap still silently
dismissing without recording a choice.

Verified via `node --check` on all changed files, targeted Playwright
scripts covering the profile-switch race condition, the transfer-word
checkpoint, the immediate-disable fix, and the avatar-only profile
creation flow, plus a re-run of the existing regression smoke test — all
passed with zero console/page errors.
