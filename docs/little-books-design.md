# Little Books — Design One-Pager

> **Revision note:** This draft was rubber-ducked by a reading-teacher review
> before implementation. Section numbers below have been rewritten to fold
> in that critique directly (not appended as a separate list), because the
> original v1 had real pedagogical holes: it called things "decodable"
> without a defined Norwegian sound scope, let a child "win" by audio +
> guessing without ever reading print, treated audio-fading-by-level as the
> support model (wrong — support should be child-controlled, not
> level-scheduled), and claimed "mastery" from tap data that can't support
> that claim. Fixes are folded in below.


## The problem with today's version
"Little Books" currently reads like a comprehension quiz bolted onto a
handful of unrelated sentences. It doesn't teach a skill, it doesn't build on
itself, and a 5-year-old can't tell what they're supposed to *do* with a
book beyond tapping an answer. Before writing more code, we need to agree on
what this activity is actually for.

## 1. Goal
Give a 5-year-old who already knows most letter-sounds their **first
experience of independent reading**: looking at print, sounding it out, and
realizing "I can read that myself" — without a parent decoding it for them.

This is the bridge between the letter/phonics activities (Letter Journey,
Write Letters, Write Words) and *actual reading*. It is not a
comprehension-testing activity; comprehension checks are a secondary,
lightweight confirmation that decoding produced meaning, not the main event.

## 2. Who it's for / entry requirement
A child who can already:
- Say the sound for most single letters (via Letter Journey / Write Letters).
- Blend 2–3 sounds together with help ("s-o-l → sol").

This is a soft readiness expectation, not a hard gate: many 5-year-olds are
still developing phonological awareness, and Norwegian kindergarten guidance
deliberately keeps early literacy playful rather than assuming school-entry
decoding. So Little Books must stay usable, without failure/shame, for a
child who isn't quite ready yet:
- The first book-level ("first-words") doubles as an **oral blending
  warm-up** before any print pressure: hear a word said sound-by-sound
  ("s...o...l"), then whole ("sol"), then see it, with no scored response
  required to just listen and repeat.
- A child can freely replay or drop back to an earlier book at any time —
  there is no "you failed, go back" lockout, only "want to try an easier
  one?" framed positively.

It is **not** for a child who has never heard letter-sounds at all — that's
Letter Journey's job. Little Books teaches **blending known sounds into
words**, then **words into short text**.

## 3. What the child will actually learn
In order, across the levelled books:
1. **Blending** — combining known sounds into a whole word (sol → /s/-/o/-/l/).
2. **One-to-one word tracking** — pointing at/hearing one word at a time,
   not treating a sentence as one blob.
3. **Sight recognition of a small, *cumulative* word set** — seeing *sol*,
   *katt*, *bil* etc. enough times, across a book *and across later books*
   (spaced, not just massed within one book), that they start being read
   instantly. Repetition alone doesn't create this — it only works because
   the child is also given the taught grapheme–phoneme knowledge and the
   word's meaning; the design must supply both, not just repeat a word.
4. **Reading connected text** — the same known words recombined into short
   sentences, then a short "story," **plus a few brand-new but fully
   decodable "transfer" words** near the end of a level, so we can tell
   apart "recognizes this exact word from memory" and "can actually decode
   new words built from the same taught code." Word-set repetition without
   any transfer check risks teaching a small memorized picture-set instead
   of real decoding.
5. **Confirming meaning**, lightly — one simple, text-grounded check per
   book (e.g., put 2 events in order, or "what happened?") — framed as
   "let's check what happened," not a pass/fail quiz, and never requiring
   vocabulary or world knowledge beyond the book itself.

## 4. How it should work (mechanics)
- **A defined Norwegian sound scope, versioned per level — not just "words
  built from taught letters."** Norwegian decodability is not just
  single-letter coverage: double consonants (*katt*) signal vowel length,
  and multigraphs (*kj*, *skj*, *gj*, *rs→sj*) are their own taught units,
  not "small sight words" to smuggle in. Each book must declare: which
  grapheme–phoneme correspondences are assumed secure, the *one* new
  pattern (if any) this book introduces, and any explicitly pre-taught
  irregular words. A content-review pass must check **every** page,
  prompt, feedback string, and answer choice against this scope — not just
  the story sentences — since a wrong answer choice or feedback phrase can
  just as easily contain untaught vocabulary.
- **Progress by decoding complexity, not by page count.** "Single word →
  sentence → story" is not itself a valid difficulty ladder — a 1-word item
  can be harder than a 4-word sentence depending on its sound pattern. The
  real ladder is the sound scope (point above); book length is a
  presentation choice, not the progression variable.
- **The child must attempt the print before hearing the answer.** The
  current build auto-speaks the page text and the question prompt
  immediately — meaning a child can select a correct picture/word purely
  from having heard it, without ever decoding anything. Redesigned flow:
  show the printed word/sentence first; the child can *ask* for help via an
  always-available "🔊 Hear it" / "🧩 Sound it out with me" control, but nothing
  is spoken automatically before their first attempt. This makes the
  activity actually measure decoding instead of listening/guessing.
- **Support is child-controlled, not "faded by level."** The original plan
  ("auto-read early books, fewer hints in later books") punishes exactly
  the children who still need help once material gets harder — need for
  support depends on the child and the day, not the book number. Instead:
  every page always offers the same three optional supports ("hear it",
  "sound it out with me" letter-by-letter, "show me the picture") on
  request, never forced or withheld by level. We log *how much support was
  used*, and use that (not level number) to talk about progress.
- **Wrong answers re-teach, they don't just say "try again."** A miss
  triggers the "sound it out with me" flow for that specific word
  (letter-by-letter audio + highlight), then a fresh attempt — turning an
  error into another decoding rep instead of a dead end.
- **Small, closed, cumulative vocabulary.** Each book still has its own
  short word bank (4–6 words) reused across its pages for repetition, and
  a book's key words are folded into *later* books' banks too, so exposure
  is spaced across sessions, not just massed in one sitting.
- **Sequenced unlocking**, like Letter Journey — books present in a fixed
  order and unlock as the previous one is completed (with familiar *and* at
  least one transfer word attempted with reducing support), not an
  unordered picker of six equal buttons.
- **Honest, non-inflated progress language.** We cannot tell decoding apart
  from memorization or lucky guessing from tap data alone. So instead of
  "you can read *sol* now!", report only what was actually observed: "You
  read *sol* without needing help" / "You practiced *sol* 3 times." Never
  claim "mastery."
- **A visible, optional "read together" invite** — not a requirement, but a
  small "👪 Read this one with a grown-up" note on story-level books, since
  shared reading adds vocabulary/conversation the app can't. The app must
  stay fully operable alone (icons, spoken instructions, no login), but
  "no adult needed" is a *capability*, not a design goal to route around
  adult involvement.
- **Short, endable sessions.** A finished book ends with a clear, calm stop
  point (celebration + "keep going or take a break?") rather than looping
  straight into more questions — a 5-year-old's attention span doesn't
  support an open-ended quiz loop.

## 5. What the research says (and how the design maps to it) — and where v1 over-claimed it
- **Simple View of Reading** (Gough & Tunmer, 1986): reading comprehension =
  decoding × language comprehension. This justifies prioritizing decoding
  *practice time*, but **not** the v1 claim that "a 5-year-old's spoken
  Norwegian is already fine" — oral vocabulary, syntax, and Norwegian
  exposure vary a lot, especially for multilingual children. Fix: keep
  decoding as the primary target, but every book must use vocabulary/oral
  language the child plausibly already knows, and a brief meaning check
  stays in scope (see §4) rather than being waved away as irrelevant.
- **Decodable text principles** (structured-literacy guidance, e.g. Reading
  Rockets-style sources): texts should be built from already-taught
  grapheme–phoneme correspondences, progress systematically one pattern at
  a time, and keep explicit sight words few. This only works if "taught" is
  actually defined per book (§4) — a percentage claim like "90% decodable"
  is meaningless without declaring the code and auditing every string
  against it, including question prompts and wrong-answer choices, not
  just story sentences.
- **Orthographic mapping / self-teaching hypothesis** (Ehri; Share, 1995):
  repeated *successful decoding* of a word — not repeated *exposure* alone —
  is what builds instant recognition, and it depends on the child already
  having secure grapheme–phoneme knowledge and the word's meaning. v1
  implied "show the same 4–6 words enough times and sight-reading follows";
  that overclaims it. Fix: repetition must be paired with an actual
  decoding attempt (§4's "attempt before audio") and cumulative/spaced
  re-exposure across later books, plus novel transfer-word checks to verify
  real decoding happened instead of visual memorization of a tiny set.
- **Norwegian orthography** is comparatively transparent at the single-letter
  level, but has real complexity beyond that: double consonants marking
  vowel length, multigraphs (*kj*, *skj*, *gj*), and dialect variation in
  how words are actually pronounced versus written Bokmål. A single
  `spokenSound`/TTS voice cannot represent "how Norwegian sounds" — it
  represents one standard pronunciation, and children must never be marked
  wrong for a dialectal pronunciation difference the app can't perceive
  anyway (since input is tap-based, not speech-recognized, this is a
  labeling risk rather than a scoring risk today, but the wording in
  feedback must stay dialect-neutral).

## 6. Non-goals (to avoid scope creep) — narrowed from v1
- Not a vocabulary-building activity beyond words needed for the story
  itself (no "learn what *lyser* means" side content).
- Not a spelling test (that's Write Words).
- Not teaching formal comprehension strategies (inference, prediction as a
  taught skill) — **but** basic literal meaning-checking (what happened,
  in what order) stays in scope; v1's "not a comprehension activity at all"
  went too far — meaning-making is part of reading even for beginners, it
  just isn't scored as a decoding test.
- Not a speech-recognition or pronunciation-scoring product — all input
  stays tap-based; we do not attempt to judge how a child says a word.

## 7. What "done" looks like
A 5-year-old opens Little Books, sees the next book in sequence (unlocked,
icon-driven), attempts to read a page's print themselves with supports
available on request (not forced on them), gets re-teaching (not just
"wrong") when they miss, and after finishing a book sees an honest summary
of what they practiced and how much help they used — with a calm stopping
point and an optional invite to read it again with a grown-up. No adult
needs to operate the app, but the app doesn't pretend adult involvement is
undesirable.

## 8. Implementation plan (scoped for this pass)
Given the size of a full curriculum overhaul, this pass implements the
mechanics that fix the most serious flaws now, and defers the rest:

**Building now:**
1. Remove auto-speak-before-attempt; add on-request "🔊 Hear it" and
   "🧩 Sound it out with me" (letter-by-letter) controls instead.
2. Wrong answers trigger the sound-it-out flow for the missed word, then a
   fresh attempt, instead of a flat "try again."
3. Sequenced/locked book unlocking (mirrors Letter Journey's pattern),
   replacing the unordered picker.
4. Replace "mastery" language with honest support-aware progress text
   ("read without help" / "practiced with help").
5. Add a calm end-of-book summary screen with a "keep going / take a break"
   choice, and an optional "👪 read this together" note on story-level books.
6. Fold each book's key words into the next book's word bank for spaced
   repetition, and add 1 novel-but-decodable transfer word near the end of
   the sequence to distinguish real decoding from memorized recognition.

**Explicitly deferred (needs a real curriculum pass, not a code change):**
- A fully versioned Norwegian grapheme–phoneme scope-and-sequence document
  (double consonants, multigraphs, irregular-word list) — today's book text
  is a best-effort approximation, not yet formally audited against a
  declared scope.
- Dialect/Nynorsk policy for TTS.
- Piloting with real 5-year-olds to validate support-usage assumptions.
- Full accessibility pass (captions, reduced motion, larger targets) beyond
  what's already true today (text is always shown alongside audio, nothing
  is time-limited).
