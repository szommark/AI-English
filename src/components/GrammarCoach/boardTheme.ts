export type BoardTheme = 'black' | 'green'

/** "clear" (Lexend) is the default; "chalk" keeps the handwritten Patrick Hand look. */
export type BoardFont = 'clear' | 'chalk'

export const boardFontClass: Record<BoardFont, string> = {
  clear: 'font-board',
  chalk: 'font-hand',
}

export interface BoardThemeClasses {
  board: string
  chalk: string
  chalkDim: string
  accent: string
  ruleBg: string
  ruleBorder: string
  divider: string
}

export const boardThemes: Record<BoardTheme, BoardThemeClasses> = {
  black: {
    board: 'bg-[#171512] bg-[radial-gradient(ellipse_at_top,_#26221c,_#100f0c)]',
    chalk: 'text-[#f7f5f0]',
    chalkDim: 'text-[#d9d3c6]',
    accent: 'text-[#f6c95a]',
    ruleBg: 'bg-white/[0.06]',
    ruleBorder: 'border-white/25',
    divider: 'border-white/15',
  },
  green: {
    board: 'bg-[#1f3d2e] bg-[radial-gradient(ellipse_at_top,_#2c4f3d,_#163023)]',
    chalk: 'text-[#f7f5f0]',
    chalkDim: 'text-[#dbe9e1]',
    accent: 'text-[#f6c95a]',
    ruleBg: 'bg-black/[0.12]',
    ruleBorder: 'border-white/25',
    divider: 'border-white/15',
  },
}
