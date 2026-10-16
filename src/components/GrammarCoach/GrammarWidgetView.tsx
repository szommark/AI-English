import { ChevronRight } from 'lucide-react'
import type { GrammarWidget } from '../../lib/types'
import type { BoardThemeClasses } from './boardTheme'

type WidgetProps<T extends GrammarWidget['type']> = { widget: Extract<GrammarWidget, { type: T }>; theme: BoardThemeClasses }

// Text sizes step down on phones so a full rule or table fits without being cut off.
const HEADING = 'text-2xl sm:text-3xl font-semibold leading-tight'
const BODY = 'text-lg sm:text-2xl leading-relaxed'
const SMALL = 'text-base sm:text-lg leading-relaxed'

function RuleBox({ widget, theme }: WidgetProps<'rule-box'>) {
  return (
    <div className={`rounded-xl border ${theme.ruleBorder} ${theme.ruleBg} px-5 py-5 sm:px-7 sm:py-6 w-full max-w-2xl`}>
      <h3 className={`${HEADING} ${theme.accent} mb-3`}>{widget.title}</h3>
      <p className={`${BODY} ${theme.chalk}`}>{widget.text}</p>
    </div>
  )
}

function ExampleSentence({ widget, theme }: WidgetProps<'example-sentence'>) {
  return (
    <p lang="en" className={`w-full max-w-3xl text-center text-2xl sm:text-4xl leading-relaxed ${theme.chalk}`}>
      {widget.tokens.map((token, i) => (
        <span key={i}>
          {i > 0 && !/^[.,!?;:]/.test(token.text) ? ' ' : ''}
          <span className={token.highlighted ? `${theme.accent} font-semibold underline decoration-2 underline-offset-[6px]` : undefined}>
            {token.text}
          </span>
        </span>
      ))}
    </p>
  )
}

function ComparisonTable({ widget, theme }: WidgetProps<'comparison-table'>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`mx-auto ${SMALL} sm:text-xl border-collapse`}>
        <thead>
          <tr>
            {widget.headers.map((h, i) => (
              <th key={i} className={`border-b-2 ${theme.ruleBorder} ${theme.accent} font-semibold px-3 sm:px-5 py-2 text-left align-bottom`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {widget.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} className={`border-b ${theme.divider} px-3 sm:px-5 py-2.5 align-top ${ci === 0 ? theme.chalk : theme.chalkDim}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SentenceStructureDiagram({ widget, theme }: WidgetProps<'sentence-structure-diagram'>) {
  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {widget.blocks.map((block, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`rounded-lg border ${theme.ruleBorder} ${theme.ruleBg} px-4 py-3 text-center`}>
              <p className={`text-xs sm:text-sm font-semibold uppercase tracking-wider ${theme.accent}`}>{block.label}</p>
              <p className={`text-xl sm:text-2xl ${theme.chalk}`}>{block.text}</p>
            </div>
            {i < widget.blocks.length - 1 && <ChevronRight className={`h-5 w-5 shrink-0 ${theme.chalkDim}`} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function BulletList({ widget, theme }: WidgetProps<'bullet-list'>) {
  return (
    <div className="w-full max-w-2xl">
      {widget.title && <h3 className={`${HEADING} ${theme.accent} mb-4`}>{widget.title}</h3>}
      <ul className="space-y-2.5">
        {widget.items.map((item, i) => (
          <li key={i} className={`${BODY} ${theme.chalk} flex gap-3`}>
            <span className={`${theme.accent} shrink-0`}>•</span>
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
