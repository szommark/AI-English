import { useState } from 'react'
import {
  LYRICS_DISTRACTOR_MAX_LENGTH,
  LYRICS_MAX_DISTRACTORS,
  effectiveDistractors,
  type GapGroup,
} from '../../../lib/lyricsGapFill'
import { useLanguage } from '../../../lib/i18n'
import { cardClass, hintClass, inputClass } from '../ui'

/**
 * Wrong options per multiple-choice gap. An empty field means "automatic": its placeholder
 * shows what the worksheet will print. Parents remount it (key) when options change outside.
 */
export default function ChoiceEditor({
  groups,
  distractors,
  choiceCount,
  seed,
  onChange,
}: {
  groups: GapGroup[]
  distractors: Record<string, string[]>
  choiceCount: number
  seed: number
  onChange: (next: Record<string, string[]>) => void
}) {
  const { t } = useLanguage()
  // Raw text while typing, so a trailing comma isn't trimmed away mid-word.
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  if (groups.length === 0) return null

  function update(key: string, text: string) {
    setDrafts((d) => ({ ...d, [key]: text }))
    const list = text
      .split(',')
      .map((x) => x.trim().slice(0, LYRICS_DISTRACTOR_MAX_LENGTH))
      .filter(Boolean)
      .slice(0, LYRICS_MAX_DISTRACTORS)
    const next = { ...distractors }
    if (list.length) next[key] = list
    else delete next[key]
    onChange(next)
  }

  return (
    <section className={cardClass}>
      <div>
        <h2 className="font-semibold text-foreground">{t('lyChoiceTitle')}</h2>
        <p className={hintClass}>{t('lyChoiceHint')}</p>
      </div>
      <ol className="space-y-2">
        {groups.map((g) => {
          const key = String(g.words[0])
          const automatic = effectiveDistractors(g, groups, {}, choiceCount, seed)
          return (
            <li key={key} className="grid grid-cols-[2rem_minmax(0,8rem)_minmax(0,1fr)] items-center gap-2 text-sm">
              <span className="text-right font-semibold text-muted-foreground">{g.number}.</span>
              <span className="truncate font-medium text-foreground" title={g.answer}>
                {g.answer}
              </span>
              <input
                value={drafts[key] ?? (distractors[key] ?? []).join(', ')}
                onChange={(e) => update(key, e.target.value)}
                placeholder={automatic.join(', ')}
                aria-label={`${g.number}. ${g.answer}`}
                className={inputClass}
              />
            </li>
          )
        })}
      </ol>
    </section>
  )
}
