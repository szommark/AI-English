import { Fragment } from 'react'

/** Paragraphs split on blank lines, single line breaks kept, **bold** rendered. */
export default function RichText({ text, className = '' }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  return (
    <div className={`space-y-3 ${className}`}>
      {paragraphs.map((p, i) => (
        <p key={i}>
          {p.split('\n').map((line, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {line.split(/(\*\*[^*]+\*\*)/).map((part, k) =>
                part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
                  <strong key={k} className="font-semibold text-foreground">
                    {part.slice(2, -2)}
                  </strong>
                ) : (
                  <Fragment key={k}>{part}</Fragment>
                ),
              )}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  )
}
