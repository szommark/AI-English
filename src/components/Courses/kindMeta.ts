import { BookOpenText, ClipboardCheck, Headphones, Languages, MessagesSquare, Mic, PenLine, Puzzle, type LucideIcon } from 'lucide-react'
import type { ModuleKind } from '../../lib/courses'

export const KIND_ICONS: Record<ModuleKind, LucideIcon> = {
  vocabulary: Languages,
  reading: BookOpenText,
  listening: Headphones,
  grammar: Puzzle,
  pronunciation: Mic,
  speaking: MessagesSquare,
  writing: PenLine,
  unit_check: ClipboardCheck,
}
