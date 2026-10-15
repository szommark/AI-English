/**
 * The brand name as "AVaLoN": the four capitals of the "AVLN" skeleton in navy, and the
 * lowercase a and o that complete it in gold, as in the intro.
 */
export default function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-brand font-semibold tracking-[0.04em] text-[var(--brand-navy)] ${className}`}>
      AV<span className="text-[var(--brand-gold)]">a</span>L<span className="text-[var(--brand-gold)]">o</span>N
    </span>
  )
}
