import type { ReactNode } from 'react'
import type { ExamItem, ExamTask, PassageBlock } from '../../data/exams/types'
import type { AnswerValue } from '../../lib/examScoring'
import ChoiceItem from './ChoiceItem'
import McqItem from './McqItem'
import ShortTextItem from './ShortTextItem'

const GAP = /\{\{([^}]+)\}\}/g

interface Props {
  task: ExamTask
  blocks: PassageBlock[]
  valueOf: (itemId: string) => AnswerValue | undefined
  onChange: (itemId: string, value: AnswerValue) => void
}

/** Passage text with `{{id}}` gaps turned into inline selects/inputs and item stems followed by their control. */
export default function Passage({ task, blocks, valueOf, onChange }: Props) {
  const find = (id: string): { item: ExamItem; example: boolean } | undefined => {
    const example = task.examples?.find((e) => e.id === id)
    if (example) return { item: example, example: true }
    const item = task.items.find((i) => i.id === id)
    return item && { item, example: false }
  }

  function control(id: string, inline: boolean): ReactNode {
    const found = find(id)
    if (!found) return null
    const props = { task, value: valueOf(id), onChange: (v: AnswerValue) => onChange(id, v), example: found.example }
    if (found.item.type === 'choice') return <ChoiceItem {...props} item={found.item} />
    if (found.item.type === 'mcq') return <McqItem {...props} item={found.item} inline />
    if (found.item.type === 'short-text') return <ShortTextItem {...props} item={found.item} inline={inline} />
    return null
  }

  function withGaps(text: string): ReactNode[] {
    const parts: ReactNode[] = []
    let last = 0
    for (const m of text.matchAll(GAP)) {
      if (m.index! > last) parts.push(text.slice(last, m.index))
      parts.push(
        <span key={`gap-${m[1]}`} className="mx-0.5 inline-flex items-center gap-1 py-0.5 align-middle">
          <span className="text-sm font-semibold text-muted-foreground">({m[1]})</span>
          {control(m[1], true)}
        </span>,
      )
      last = m.index! + m[0].length
    }
    if (last < text.length) parts.push(text.slice(last))
    return parts
  }

  return (
    <div className="space-y-3 text-base leading-loose text-foreground sm:text-[1.0625rem]">
      {blocks.map((block, i) => {
        if (block.itemId !== undefined) {
          return (
            <div key={i} className="rounded-lg border border-border bg-background p-3">
              <p className="leading-relaxed">
                <span className="mr-2 font-semibold text-muted-foreground">{block.itemId}.</span>
                {withGaps(block.text)}
              </p>
              <div className="mt-2">{control(block.itemId, false)}</div>
            </div>
          )
        }
        switch (block.style) {
          case 'title':
            return (
              <h3 key={i} className="text-center text-lg font-semibold leading-snug">
                {withGaps(block.text)}
              </h3>
            )
          case 'heading':
            return (
              <p key={i} className="pt-1 font-semibold">
                {withGaps(block.text)}
              </p>
            )
          case 'note':
            return (
              <p key={i} className="text-sm italic text-muted-foreground">
                {block.text}
              </p>
            )
          case 'bullet': {
            const sub = block.text.startsWith('– ')
            return (
              <p key={i} className={`flex gap-2 ${sub ? 'pl-8' : 'pl-2'}`}>
                <span aria-hidden className="text-muted-foreground">
                  {sub ? '–' : '•'}
                </span>
                <span>{withGaps(sub ? block.text.slice(2) : block.text)}</span>
              </p>
            )
          }
          default:
            return <p key={i}>{withGaps(block.text)}</p>
        }
      })}
    </div>
  )
}
