import {
  AudioLines,
  BookOpen,
  CalendarCheck,
  CircleHelp,
  Compass,
  Flag,
  Footprints,
  GraduationCap,
  Library,
  ListChecks,
  Map as MapIcon,
  MessageCircle,
  MessagesSquare,
  Mic,
  Mountain,
  Plane,
  Sunrise,
  TrendingUp,
  Trophy,
  UserRound,
  Award,
  type LucideIcon,
} from 'lucide-react'

// Icons a badge_definitions.icon may name. A new badge with a new icon adds it here; an
// unknown name falls back to Award.
export const BADGE_ICONS: Record<string, LucideIcon> = {
  AudioLines,
  Award,
  BookOpen,
  CalendarCheck,
  Compass,
  Flag,
  Footprints,
  GraduationCap,
  Library,
  ListChecks,
  Map: MapIcon,
  MessageCircle,
  MessagesSquare,
  Mic,
  Mountain,
  Plane,
  Sunrise,
  TrendingUp,
  Trophy,
  UserRound,
}

export function badgeIcon(name: string | null): LucideIcon {
  if (name === null) return CircleHelp
  return BADGE_ICONS[name] ?? Award
}
