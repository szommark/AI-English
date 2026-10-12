# Tense Explorer — Design

Grammar Coach mode for exploring the English tenses with any verb or phrase. Static, rule-based and offline: no LLM, no API routes, no Supabase, no XP. Built in three phases (PRs #90 engine, #91 content + timeline, then the UI); see also the "Tense Explorer" section of [`grammar-coach-brief.md`](grammar-coach-brief.md).

> Written from the implementation brief and the shipped code; the original design note lives in the project docs (`claude/tense-explorer-design.md`).

## Decisions (confirmed by Mark)

- **13 boxes:** the 12 tenses (present / past / future × simple / continuous / perfect / perfect continuous) plus *be going to*.
- **Compare** = pin two boxes: side by side, same verb, same subject, plus a one-line contrast note.
- **Subjects vary by default:** each box gets a different subject in rotation (I, you, he, she, we, they), with a "Shuffle subjects" button and a selector to fix one subject for every box.
- **British spelling** (travelled, cancelled, got).
- Hungarian learner content (uses, pitfalls, contrast notes) as approved in the brief.

## Screen

- **Mode switch:** `Lessons | Tense explorer` segmented control under the page heading, state in `?mode=explorer`. Explorer mode replaces the rail, board, voice bar and practice panel.
- **Top bar card:** phrase input + **Put in all boxes** (Enter works) + **Random verb**; subject select (Varied | I | you | he | she | we | they) + **Shuffle subjects** (only while Varied); **Time cue** switch; **Explanation language** toggle (English | Magyar); preset chips (All, Present, Past, Future, Simple, Continuous, Perfect, Perfect continuous; *be going to* counts as Future only); **Boxes** popover with a checkbox per tense (Escape closes it, at least one box stays visible).
- **Compare card** above the grid when two boxes are pinned; a one-line hint while only one is pinned. The second pinned box takes the first one's verb; both use the first one's subject. The contrast note comes from `COMPARE_PAIRS` (either order; none shown when the pair has no note).
- **Grid:** on `lg` three stacks, Present | Past | Future, rows in the order simple → continuous → perfect → perfect continuous, *be going to* last under Future; hidden boxes leave no gap. Below `lg` one column in grid order (CSS `display: contents` + `order`, no JS media query).
- **Tense box:** English name (Hungarian name below when the explanation language is Hungarian), subject chip, pin and hide buttons; its own input + dice button; three sentences (Positive / Question / Negative) with listen buttons; stative / *be* continuous notes; timeline; collapsible **When do we use it?** (form, uses, typical time words, *For Hungarian speakers* when a pitfall exists); **Open the lesson** link (`/grammar-coach?lesson=<id>`). An empty box shows a gentle prompt; a parse error shows a friendly message under that box's input only.
- **Look:** existing app vocabulary — white `rounded-2xl` cards, `border-slate-200`, `shadow-sm`, slate text, amber accent; no chalkboard styling.

## Language rules

- UI chrome follows the UI language (hu / en / de) via `i18n.tsx` keys prefixed `tense`.
- Explanation content (names, uses, pitfalls, contrast notes, timeline labels and aria-labels) is English or Hungarian, chosen by the explanation-language toggle (default: Hungarian when the UI is Hungarian, else English).
- Labels inside the explanation (Positive / Question / Negative, Form, Timeline…) follow the explanation language; with English explanations a German UI keeps them in German.

## Sentence engine (`src/lib/tenseEngine/`)

- `parsePhrase`: trim, collapse spaces, drop a leading "to"; errors `empty`, `too-long` (> 40 characters), `not-english` (anything outside `A–Z a–z ' -`). First word = verb (lower-cased), the rest kept as typed.
- `inflect`: third person -s/-es/-ies; regular past -ed/-d/-ied; -ing with silent-e drop, ie → ying, CVC doubling plus a list of stressed multi-syllable verbs and British -l doubling; 141 irregular verbs.
- `buildSentence(tense, polarity, phrase, subject, { timeCue })`: full forms only; *be* as a main verb without do-support; my/your/… and myself/yourself/… adapted to the subject; one time cue per tense appended before the final punctuation.
- `assignSubjects(seed)`: box *i* in grid order → `SUBJECTS[(i + seed) % 6]`; deterministic, all six subjects appear, neighbours never share one, every seed step changes every box.
- `verbWarnings`: stative verbs in a continuous / perfect-continuous box; *be* in a continuous box (informational).
- `RANDOM_PHRASES` (66: single verbs, phrases with objects, phrasal verbs, phrases with *my*, stative verbs); `randomPhrase(exclude)` never repeats the excluded phrase.

## Timeline (`TenseTimeline.tsx`)

Inline SVG driven by frame + aspect: time runs left → right, dashed **now / most** marker, **past / múlt** and **future / jövő** axis labels, **R / ref.** on past/future reference points. Simple = one dot (present: three habit dots); continuous = bar with faded open ends around the reference; perfect = earlier dot with an arrow to the reference; perfect continuous = bar ending at the reference; *be going to* = dashed plan arrow from now to a future dot. `role="img"` with a description in the chosen language.

## State and persistence

Boxes (`Record<TenseId, { input }>`), visible set, subject mode, shuffle seed, time cue, explanation language, pinned (max 2). Visible boxes, subject mode, time cue and explanation language persist in `localStorage` under `ai-english:tense-explorer` (every access in try/catch; the page works with storage blocked). Verbs and the shuffle seed are not persisted.

## Out of scope

Scoring, XP, saving progress, LLM-generated examples, contractions, plural *you* reflexives, irregular/regular variants (learnt/learned).
