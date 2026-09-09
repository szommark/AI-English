import { Link } from 'react-router-dom'
import PlaceholderTileArt from './PlaceholderTileArt'

export default function CategoryTile({ title, photo, to }: { title: string; photo?: string; to: string }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card)] hover:-translate-y-1"
    >
      <div className="aspect-square overflow-hidden">
        {photo ? (
          <img src={photo} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <PlaceholderTileArt seed={title} />
        )}
      </div>
      <div className="px-2 py-3 text-center text-sm font-semibold text-foreground">{title}</div>
    </Link>
  )
}
