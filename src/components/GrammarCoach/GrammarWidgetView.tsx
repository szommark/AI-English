import { ChevronRight } from 'lucide-react'
import type { GrammarWidget } from '../../lib/types'
import type { BoardThemeClasses } from './boardTheme'

function RuleBox({ widget, theme }: { widget: Extract<GrammarWidget, { type: 'rule-box' }>; theme: BoardThemeClasses }) {
  return (
    <div className={`rounded-lg border ${theme.ruleBorder} ${theme.ruleBg} px-6 py-5 max-w-xl`}>
      <h3 className={`font-hand text-3xl ${theme.accent} mb-2`}>{widget.title}</h3>
      <p className={`font-hand text-2xl leading-snug ${theme.chalk}`}>{widget.text}</p>
    </div>
  )
}

function ExampleSentence({ widget, theme }: { widget: Extract<GrammarWidget, { type: 'example-sentence' }>; theme: BoardThemeClasses }) {
  return (
    <p className="font-hand text-3xl leading-relaxed max-w-2xl text-center">
      {widget.tokens.map((token, i) => (
        <span
          key={i}
          className={token.highlighted ? `${theme.accent} underline decoration-2 underline-offset-4` : theme.chalk}
        >
          {token.text}
          {i < widget.tokens.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  )
}

function ComparisonTable({ widget, theme }: { widget: Extract<GrammarWidget, { type: 'comparison-table' }>; theme: BoardThemeClasses }) {
  return (
    <table className="font-hand text-2xl border-collapse">
      <thead>
        <tr>
          {widget.headers.map((h, i) => (
            <th key={i} className={`border-b-2 ${theme.ruleBorder} ${theme.accent} px-4 py-2 text-left`}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {widget.rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td key={ci} className={`border-b ${theme.divider} px-4 py-2 ${theme.chalk}`}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function SentenceStructureDiagram({
  widget,
  theme,
}: {
  widget: Extract<GrammarWidget, { type: 'sentence-structure-diagram' }>
  theme: BoardThemeClasses
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {widget.blocks.map((block, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`rounded-md border ${theme.ruleBorder} ${theme.ruleBg} px-4 py-3 text-center`}>
            <p className={`font-hand text-sm uppercase tracking-wide ${theme.accent}`}>{block.label}</p>
            <p className={`font-hand text-2xl ${theme.chalk}`}>{block.text}</p>
          </div>
          {i < widget.blocks.length - 1 && <ChevronRight className={`h-5 w-5 shrink-0 ${theme.chalkDim}`} />}
        </div>
      ))}
    </div>
  )
}

function BulletList({ widget, theme }: { widget: Extract<GrammarWidget, { type: 'bullet-list' }>; theme: BoardThemeClasses }) {
  return (
    <div className="max-w-xl">
      {widget.title && <h3 className={`font-hand text-3xl ${theme.accent} mb-3`}>{widget.title}</h3>}
      <ul className="space-y-2">
        {widget.items.map((item, i) => (
          <li key={i} className={`font-hand text-2xl ${theme.chalk} flex gap-3`}>
            <span className={theme.accent}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function GrammarWidgetView({ widget, theme }: { widget: GrammarWidget; theme: BoardThemeClasses }) {
  switch (widget.type) {
    case 'rule-box':
      return <RuleBox widget={widget} theme={theme} />
    case 'example-sentence':
      return <ExampleSentence widget={widget} theme={theme} />
    case 'comparison-table':
      return <ComparisonTable widget={widget} theme={theme} />
    case 'sentence-structure-diagram':
      return <SentenceStructureDiagram widget={widget} theme={theme} />
    case 'bullet-list':
      return <BulletList widget={widget} theme={theme} />
    default:
      return null
  }
}
