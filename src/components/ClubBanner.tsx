import { Link } from 'react-router-dom'
import Wordmark from './Wordmark'
import { DecoFan, DecoFrame } from './club/Deco'
import { clubCopy } from '../data/clubCopy'
import { useLanguage } from '../lib/i18n'

/** Above the signed-out home page's panels: the club in its Art Deco dress, linking to /club. */
export default function ClubBanner() {
  const { lang } = useLanguage()
  const copy = clubCopy[lang]

  return (
    <DecoFrame innerClassName="px-5 py-5 sm:px-8" cornerSize={20}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <DecoFan className="hidden w-16 shrink-0 sm:block" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="leading-none">
                <Wordmark className="!text-[#f6ecd2] text-3xl" />
                <span className="ml-2 font-brand text-2xl font-semibold text-[#f6ecd2]">English club</span>
              </p>
              <span className="border border-[#c9a227] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e9d28a]">
                {copy.firstBadge}
              </span>
            </div>
            <p className="mt-1 font-brand text-xl italic text-[#e9d28a]">{copy.subtitle}</p>
            <p className="mt-1 text-[15px] text-[rgba(246,236,210,0.85)]">
              {copy.when} · {copy.where}
            </p>
          </div>
        </div>
        <Link
          to="/club"
          className="shrink-0 self-start bg-[#c9a227] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#0f2a24] hover:bg-[#e9d28a] sm:self-center"
        >
          {copy.banner.cta}
        </Link>
      </div>
    </DecoFrame>
  )
}
