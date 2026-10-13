# Teacher Toolkit — Design

A teacher-only section (`/teacher/tools`, header link "Teacher Toolkit" / "Tanári eszköztár" / "Lehrer-Werkzeuge") for classroom tools. Each tool is a tile on the hub page; the first is the **lyrics gap-fill maker**.

## 1. Access

- Routes sit behind `RoleProtectedRoute role="teacher"` (students and admins are redirected home), and the header link only shows for teachers.
- `api/teacher-tools.ts` rejects every action with 403 unless `profiles.role = 'teacher'`.
- Activities are private to the teacher who made them: every query filters on `teacher_id`, and another teacher's activity returns the same 404 as a missing one.

## 2. Research behind the lyrics tool

| Finding | Source | What the tool does with it |
|---|---|---|
| Random gaps have no teaching aim. Choose gaps for a purpose (grammar words, collocations, vocabulary), keep them guessable, and use about 15–20 per song. | [Teach-This: using song gap-fills](https://teach-this.com/ideas/using-song-gap-fills), [ESL Insider](https://eslinsider.com/how-to-teach-english-videos/teaching-tips-tools/teaching-songs-cloze) | Word-type targets instead of every-nth-word deletion; a default of 15 content-word gaps; must-gap and never-gap lists. |
| Phrase gaps should be three words at most. | Teach-This | Neighbouring gaps join into phrase gaps of up to 3 words (an option). |
| Scaffolding for lower levels: first letter, one dash per letter, a word bank. | Teach-This | Hint styles (plain line, letters, first letter); word bank with extra wrong words; multiple choice. |
| Lesson stages: a gist or mood question before listening, gap-filling while listening, then a discussion of meaning. | [JALT TLT "Motivating magic: songs"](https://jalt-publications.org/tlt/departments/myshare/articles/4288-motivating-magic-songs-efl-classroom) | "Before you listen" and "After you listen" fields on the worksheet. |
| LyricsTraining levels gap a share of the song's words (Beginner about 10%, Intermediate about 25%, up to Expert = every word), in a write mode or a 4-option choice mode. | [TeachersFirst](https://teachersfirst.org/blog/2023/08/tech-tool-of-the-month-lyricstraining-part-2/), [FLTMag](https://fltmag.com/lyricstraining/) | Level presets of 10/25/50/100%; write, word bank and multiple-choice modes. |
| Rational (selective) deletion gives the teacher control over what is tested. Fixed-ratio deletion often leaves items that can't be predicted, and makes a harder test. | [Chapelle and Abraham 1990](https://okt.kmf.uz.ua/atc/oktat-atc/Bakalavr/MELT/Readings_III-5/Chapelle_&_Abraham_1990_cloze_method.pdf); [KKU review](https://clt.kku.edu.sa/the-gaps-that-speak-for-themselves-or-how-to-create-a-cloze-t) | Rule-based selection by word class; minimum distance between gaps; the first line stays complete as a model. |
| EU teaching exception (Directive 2019/790 Art. 5): digital use for illustration in teaching, through a secure environment, with the source and author credited; member states may carve works out. | [Art. 5 text](https://www.legislation.gov.uk/eudr/2019/790/article/5/data.html) | The app never fetches or ships lyrics. Teachers paste their own, activities are private, and every worksheet credits the title and artist. A note in the editor reminds teachers to use lyrics they may use in class. |

## 3. The lyrics gap-fill maker

**Input.** Title, artist, an optional video or audio link, and pasted lyrics. Section labels (`[Chorus]`, `Verse 2:`) are recognised and never gapped.

**Choosing gaps** (`src/lib/lyricsGapFill.ts`, pure and shared with the API):

- **Targets:** any word; content words (4+ letters, not function words); rhyming line ends; past forms (-ed plus irregulars from the tense engine's `IRREGULAR_VERBS`); -ing forms; prepositions; articles and determiners; auxiliaries and modals; pronouns; conjunctions.
- **Amount:** a number of gaps, or a percentage of the song's words with LyricsTraining-style presets.
- **Rules:** first lines left complete, minimum words between gaps, at most one gap per line, and repeated lines (the chorus) gapped every time, only the first time, or never.
- A **seeded** shuffle, so the same settings always give the same gaps and "Shuffle" gives a new variant.
- **Manual edits:** click any word in the preview to add or remove a gap.
- When the lyrics are edited, gaps follow their words (an LCS alignment), so adding a line doesn't lose them.

**AI suggestion** (`api/_lib/lyricsSuggest.ts`): the teacher types a goal ("phrasal verbs", "present perfect") and an optional CEFR level. The model gets the lyrics as numbered words, and returns word indices plus wrong options, so it can only point at words that exist. It replaces the current gaps. It uses the admin's Vocabulary model setting, is logged as `lyrics_gaps` in `groq_usage_log`, and is capped at 30 per teacher per UTC day.

**Worksheet options:** activity type (write, word bank, multiple choice), gap hint style, numbering, phrase gaps, word bank order and extra words, options per multiple-choice gap, instructions (an English default per type), before and after listening prompts, large print, an answer key on its own page, and whether to print the link.

**Multiple choice:** each gap's wrong options are the teacher's or AI's own. Empty fields fall back to automatic ones: same-family words (were → are/is/been, prepositions → other prepositions) or other forms of the same verb (dancing → dance/danced/dances).

**Output:**

- **Print** (`src/lib/lyricsWorksheet.ts`) opens a print-ready page; "Save as PDF" in the print dialog makes the file. Same approach as `vocabPdf.ts`, so no PDF library. Worksheets are in English whatever the UI language.
- **Class mode** is a full-screen projector view. The teacher can reveal the next gap, reveal or hide all, or click a single gap. "Type answers" turns the gaps into inputs with a Check button and a score. Text size is adjustable, and YouTube links play embedded (youtube-nocookie).

## 4. Data and API

`teacher_lyrics_activities` (migration `20261013120000_teacher_lyrics_activities.sql`) has the columns `id`, `teacher_id`, `title`, `artist`, `video_url`, `content jsonb`, `created_at` and `updated_at`. RLS is on with no policies, so only the service role can use it. `content` holds `LyricsActivityContent` (lyrics, gap word indices, distractors, gap-picking and worksheet options), and `sanitizeLyricsActivity` validates it on every write.

`api/teacher-tools.ts`, multiplexed by `?action=`:

| Method | Action | Does |
|---|---|---|
| GET | `lyrics` | Lists the teacher's activities |
| GET / PUT / DELETE | `lyrics&id=` | Reads, replaces or deletes one activity |
| POST | `lyrics` | Creates an activity |
| POST | `lyrics-suggest` | AI gap suggestion |

The route is a new Vercel function (10 of 12 on Hobby). Future toolkit tools add actions to it rather than new files.

## 5. Not in this version

- Assigning activities to connected students to complete online (the chosen scope was print plus class mode).
- Timed lyric sync (LRC timestamps) to pause the video at each gap.
- Other song tasks: line ordering, spot the wrong word.
