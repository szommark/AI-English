import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../lib/i18n'
import { WORDLIST_PRACTICE_CHECK_ID } from '../../lib/pronunciationConfig'
import { fetchWordlist, fetchWordlists } from '../../lib/vocabPracticeApi'
import type { WordlistDetail, WordlistSummary } from '../../lib/vocab'
import { useListTitle } from '../Vocabulary/wordlistLabels'
import ShadowingRunner, { type ShadowItem } from './ShadowingRunner'

type Source = 'words' | 'examples'

const keyOf = (list: Pick<WordlistSummary, 'kind' | 'id'>) => `${list.kind}:${list.id ?? ''}`

/** The Wordlist practice tab of /pronunciation: one of the learner's wordlists, item by item. */
export default function WordlistPracticeTab() {
  const { t, lang } = useLanguage()
  const listTitle = useListTitle()
  const [lists, setLists] = useState<WordlistSummary[] | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [selectedKey, setSelectedKey] = useState('')
  const [detail, setDetail] = useState<WordlistDetail | null>(null)
  const [detailFailed, setDetailFailed] = useState(false)
  const [source, setSource] = useState<Source>('words')

  useEffect(() => {
    fetchWordlists()
      .then((res) => setLists(res.lists.filter((l) => l.wordCount > 0)))
      .catch(() => setLoadFailed(true))
  }, [])

  useEffect(() => {
    setDetail(null)
    setDetailFailed(false)
    const list = lists?.find((l) => keyOf(l) === selectedKey)
    if (!list) return
    let cancelled = false
    fetchWordlist({ kind: list.kind, id: list.id })
      .then((d) => !cancelled && setDetail(d))
      .catch(() => !cancelled && setDetailFailed(true))
    return () => {
      cancelled = true
    }
  }, [selectedKey, lists])

  if (loadFailed) return <p className="text-sm text-red-600">{t('vcLoadFailed')}</p>
  if (lists === null) return <p className="text-sm text-muted-foreground">{t('loading')}</p>
  if (lists.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link to="/vocabulary" className="text-primary hover:underline">
          {t('pronNoWordlists')}
        </Link>
      </p>
    )
  }

  const items: ShadowItem[] = (detail?.words ?? []).flatMap((w) => {
    const gloss = lang === 'hu' ? w.meaningHu : null
    if (source === 'words') return [{ text: w.term, gloss }]
    return w.exampleEn ? [{ text: w.exampleEn, gloss: w.term }] : []
  })

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          aria-label={t('pronPickWordlist')}
          className="min-w-0 max-w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
        >
          <option value="">{t('pronPickWordlist')}</option>
          {lists.map((l) => (
            <option key={keyOf(l)} value={keyOf(l)}>
              {listTitle(l)} ({l.wordCount})
            </option>
          ))}
        </select>

        <div className="inline-flex rounded-lg bg-secondary p-0.5" role="group">
          {(['words', 'examples'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSource(value)}
              aria-pressed={source === value}
              className={`rounded-md px-3 py-1.5 text-sm ${
                source === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(value === 'words' ? 'pronPracticeWords' : 'pronPracticeExamples')}
            </button>
          ))}
        </div>
      </div>

      {detailFailed && <p className="text-sm text-red-600">{t('vcLoadFailed')}</p>}
      {selectedKey && !detail && !detailFailed && <p className="text-sm text-muted-foreground">{t('loading')}</p>}
      {detail &&
        (items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('pronNothingToPractise')}</p>
        ) : (
          <ShadowingRunner key={`${selectedKey}/${source}`} items={items} checkId={WORDLIST_PRACTICE_CHECK_ID} />
        ))}
    </div>
  )
}
