import { useEffect } from 'react'
import { legalDocFor, type LegalBlock, type LegalDocId } from '../data/legal'
import { useLanguage } from '../lib/i18n'

/** "Label: value" → bold label, plain value (splits at the first colon). */
function LabelledItem({ text }: { text: string }) {
  const at = text.indexOf(': ')
  if (at < 0) return <>{text}</>
  return (
    <>
      <span className="font-semibold text-foreground">{text.slice(0, at)}:</span> {text.slice(at + 2)}
    </>
  )
}

function Block({ block }: { block: LegalBlock }) {
  if (block.type === 'p') return <p>{block.text}</p>
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {block.items.map((item, i) => (
        <li key={i}>{block.labelled ? <LabelledItem text={item} /> : item}</li>
      ))}
    </ul>
  )
}

/** One legal page (/privacy, /impressum) in the UI language; texts live in src/data/legal.ts. */
export default function LegalDocument({ id }: { id: LegalDocId }) {
  const { lang } = useLanguage()
  const doc = legalDocFor(id, lang)

  useEffect(() => {
    const previous = document.title
    document.title = `${doc.tabTitle} — AVaLoN`
    return () => {
      document.title = previous
    }
  }, [doc.tabTitle])

  return (
    <article lang={lang === 'hu' ? 'hu' : 'en'} className="mx-auto max-w-3xl py-4 sm:py-6">
      <h1 className="font-brand text-3xl font-semibold text-[var(--brand-navy)] sm:text-4xl">{doc.title}</h1>
      <div className="mt-4 h-0.5 w-20 bg-[var(--brand-gold)]" aria-hidden="true" />

      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
        {doc.intro.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>

      {doc.sections.map((section) => (
        <section key={section.heading} className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">{section.heading}</h2>
          <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        </section>
      ))}

      {doc.footnote && <p className="mt-10 text-sm font-medium text-foreground">{doc.footnote}</p>}
    </article>
  )
}
