import { useState } from 'react'
import type { GrammarPracticeLine } from '../../lib/types'
import { useLanguage } from '../../lib/i18n'
import PracticeSentence from '../PracticeSentence'

/** Speaking practice: say the lesson's practice sentences one at a time. */
export default function PracticeCheck({ practice }: { practice: GrammarPracticeLine[] }) {
  const { lang, t } = useLanguage()
  const [index, setIndex] = useState(0)
  const current = practice[index % practice.length]

  return (
    <div className="mx-auto max-w-md">
      <PracticeSentence key={index} en={current.en} gloss={lang === 'de' ? current.de : lang === 'hu' ? current.hu : undefined} voiceGender="female" />

      {practice.length > 1 && (
        <button
          onClick={() => setIndex((i) => (i + 1) % practice.length)}
          className="mt-3 text-sm text-indigo-600 hover:underline"
        >
          {t('tryAnother')}
        </button>
      )}
    </div>
  )
}
