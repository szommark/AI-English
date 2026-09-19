# Grammar Coach curriculum (123 points)

Source of truth: [`src/data/grammarCurriculum.ts`](../src/data/grammarCurriculum.ts). Integrity is checked by `npm run check:grammar` ([`scripts/check-grammar-points.ts`](../scripts/check-grammar-points.ts)). This page records the decisions behind the list, not the list itself.

## Level scheme

One CEFR level per point: A1 16, A2 21, B1 26, B2 31, C1 19, C2 10. Row order within a level is a suggested teaching order (`order`), not the source chart's order.

- The source chart's bands were split. A1–A2 items became A1 or A2. Of the A2–B1 items, past continuous, defining relative clauses, something/anything/nothing, will, have to/must, should and possessive pronouns sit at A2, and the rest at B1. The chart's own B1 and B2 bands are kept.
- Roadmap C1–C2 content was first placed at C1. The points from `cleft-advanced` onward were then moved to C2 (ids renamed `c2-*`): advanced clefts, advanced question forms, reason and concession clauses, linking devices, emphasis/inversion, emphasising advice, heads and tails, subjunctive, verbless clauses.

## Categories (20)

The first ten mirror the parent-brand Grammar Test taxonomy (tense_aspect, conditionals, modals, articles, prepositions, passive_voice, relative_clauses, comparatives, question_formation, reported_speech); the other ten are basic_structures, pronouns_determiners, nouns_quantifiers, verb_patterns, adverbs_adjectives, phrasal_verbs, linking_cohesion, emphasis_structures, auxiliary_verbs, word_formation.

`mistake_log.category` is a separate 8-value DB enum (`past_tense`, `present_tense`, `prepositions`, `articles`, `word_order`, `vocabulary`, `pronunciation`, `other`). A future mapping onto `GrammarCategory`: past_tense/present_tense → `tense_aspect`, prepositions → `prepositions`, articles → `articles`, word_order → `question_formation` / `adverbs_adjectives` / `emphasis_structures`. `vocabulary`, `pronunciation` and `other` have no grammar equivalent. `getGrammarPointsByCategory` exists for that later work.

## Source legend (`source`, maintainers only — never shown or sent to the LLM)

`chart` = Mark's grammar chart · `roadmap` = Roadmap contents pages · `chart+roadmap` = both · `added` = added to fill a gap.

## Merges and ladders

- Merged: chart verb patterns I/II (`a2-verb-ing-to`), chart #33 + #34 (`b1-verb-infinitive-gerund`), and chart B2 items with the matching Roadmap B2 lesson (question formation, auxiliaries, double comparatives, narrative tenses, adverb position, wish, relative clauses, past modals). Same-scope topics that recur in the C1–C2 book (narrative tenses, future in the past) appear once, at B2.
- Ladders, not merges: topics that recur with a different scope are separate points (articles, relative clauses, conditionals, passive, linking, comparatives, modals, participle clauses).

## Deliberate level calls (the chart wins)

Third conditional at B1 (mixed conditionals at B2); passive in all tenses at B1; modals of deduction at B1 (past modals at B2); defining relative clauses at A2.

## Exclusions

Function lessons (negotiating, presentations, suggestions, socialising…), vocabulary-only and pronunciation-only lessons, and exaggeration / translation and collocation / puns.

## Added points

`a1-demonstratives`, `a1-have-got`, `a2-present-simple-vs-continuous`, `b1-quantifiers`, `b1-linking-basic` — gaps in the chart.

## Open decisions (defaults implemented)

1. C2 tier: kept (it already existed in the app); it holds the last 10 former-C1 points.
2. The five added points: kept.
3. Chart practice links: not carried over.
4. `titleHu` and `hint` are drafts pending review.

## Caveats

- Roadmap-derived points are inferred from contents-page lesson titles only. Least certain: `b2-prepositional-phrases`, `b2-word-patterns`, `c2-question-forms`, `c1-comparative-structures`, `c1-determiners`, `c2-emphasis-inversion`.
- Old point ids (`present-simple`, `first-conditional`…) are gone. Their rows in `grammar_lessons` are orphaned but harmless; new ids generate on first use.
