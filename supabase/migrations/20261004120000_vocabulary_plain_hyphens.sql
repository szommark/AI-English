-- AI-English: Vocabulary Builder — plain hyphens in stored words.
--
-- The enrichment model sometimes wrote a non-breaking hyphen (U+2011) or another
-- hyphen look-alike instead of "-", e.g. "English‑speaking". It looks the same, but a
-- typed "English-speaking" didn't match, and the same word typed with "-" became a
-- second item. The API now folds these characters (normalizeTerm, tidyHyphens in
-- src/lib/vocab.ts); this rewrites the rows already stored.
--
-- Terms and term keys: hyphen look-alikes (U+2010, U+2011, U+2212, U+FE63, U+FF0D) and
-- figure / en dashes (U+2012, U+2013) become "-"; soft hyphens (U+00AD) are dropped.
-- Sentences and meanings: only the look-alikes and soft hyphens — an en dash there is
-- real punctuation. A row whose fixed key would collide with an existing one is left
-- alone (there were none when this was written).

-- Items: global ones (unique on term_normalized + kind) and teacher ones (unique on owner + term_normalized).
update public.vocab_items i
set term = regexp_replace(regexp_replace(i.term, '[‐-–−﹣－]', '-', 'g'), '­', '', 'g'),
    term_normalized = regexp_replace(regexp_replace(i.term_normalized, '[‐-–−﹣－]', '-', 'g'), '­', '', 'g')
where (i.term ~ '[‐-–−﹣－­]' or i.term_normalized ~ '[‐-–−﹣－­]')
  and not exists (
    select 1 from public.vocab_items o
    where o.id <> i.id
      and o.term_normalized = regexp_replace(regexp_replace(i.term_normalized, '[‐-–−﹣－]', '-', 'g'), '­', '', 'g')
      and (
        (i.owner_teacher_id is null and o.owner_teacher_id is null and o.kind = i.kind)
        or (i.owner_teacher_id is not null and o.owner_teacher_id = i.owner_teacher_id)
      )
  );

update public.vocab_items
set meaning_hu = regexp_replace(regexp_replace(meaning_hu, '[‐‑−﹣－]', '-', 'g'), '­', '', 'g'),
    definition_en = regexp_replace(regexp_replace(definition_en, '[‐‑−﹣－]', '-', 'g'), '­', '', 'g'),
    example_en = regexp_replace(regexp_replace(example_en, '[‐‑−﹣－]', '-', 'g'), '­', '', 'g')
where meaning_hu ~ '[‐‑−﹣－­]'
   or definition_en ~ '[‐‑−﹣－­]'
   or example_en ~ '[‐‑−﹣－­]';

-- Cards are matched to items and lists on term_normalized (unique per user).
update public.vocab_cards c
set term_normalized = regexp_replace(regexp_replace(c.term_normalized, '[‐-–−﹣－]', '-', 'g'), '­', '', 'g')
where c.term_normalized ~ '[‐-–−﹣－­]'
  and not exists (
    select 1 from public.vocab_cards o
    where o.user_id = c.user_id
      and o.id <> c.id
      and o.term_normalized = regexp_replace(regexp_replace(c.term_normalized, '[‐-–−﹣－]', '-', 'g'), '­', '', 'g')
  );

update public.vocab_cards
set context_original = regexp_replace(regexp_replace(context_original, '[‐‑−﹣－]', '-', 'g'), '­', '', 'g'),
    context_corrected = regexp_replace(regexp_replace(context_corrected, '[‐‑−﹣－]', '-', 'g'), '­', '', 'g')
where context_original ~ '[‐‑−﹣－­]'
   or context_corrected ~ '[‐‑−﹣－­]';
