/**
 * A reading text (or, after submission, a listening script): paragraphs split on blank lines.
 * A short first line without a full stop is the text's title.
 */
export default function TestText({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
  const [first, ...rest] = paragraphs
  const firstLine = first?.split('\n')[0] ?? ''
  const titled = !!first && first.split('\n').length === 1 && firstLine.split(/\s+/).length <= 12 && !/[.!?:]$/.test(firstLine)

  return (
    <article lang="en" className="space-y-3 rounded-2xl border border-border bg-card p-4 text-base leading-relaxed text-foreground sm:p-6 sm:text-[1.0625rem]">
      {titled && <h2 className="text-lg font-semibold">{first}</h2>}
      {(titled ? rest : paragraphs).map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p}
        </p>
      ))}
    </article>
  )
}
