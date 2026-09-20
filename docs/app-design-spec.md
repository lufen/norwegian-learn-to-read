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

## 9. Open review
Reviewed by parallel teacher + student rubber-duck passes; see §8 above
for what was fixed vs. deferred. Re-review recommended once the
curriculum map and Letter Journey distractor logic are tackled.
