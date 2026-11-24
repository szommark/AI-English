import { Link } from 'react-router-dom'
import PlaceholderTileArt from './PlaceholderTileArt'

export default function CategoryTile({ title, photo, to }: { title: string; photo?: string; to: string }) {
  return (
    <Link
      to={to}
      className="group block border border-[var(--club-gold)] bg-[var(--club-paper)] p-1 transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--club-cream)] hover:shadow-[0_14px_30px_-14px_rgba(15,42,36,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--club-gold)] focus-visible:ring-offset-2"
    >
      {/* The club tile frame (FeatureTile.tsx): cream paper, a gold double border. */}
      <div className="h-full border border-[rgba(201,162,39,0.55)]">
        <div className="aspect-square overflow-hidden">
          {photo ? (
            <img src={photo} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <PlaceholderTileArt seed={title} />
          )}
        </div>
        <div className="px-2 py-3 text-center font-brand text-base font-semibold text-[var(--club-green)]">{title}</div>
      </div>
    </Link>
  )
}
