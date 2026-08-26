export type BoardTheme = 'black' | 'green'

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
    chalk: 'text-[#f4f1ea]',
    chalkDim: 'text-[#bdb6a6]',
    accent: 'text-[#f2c14e]',
    ruleBg: 'bg-white/[0.04]',
    ruleBorder: 'border-white/15',
    divider: 'border-white/10',
  },
  green: {
    board: 'bg-[#1f3d2e] bg-[radial-gradient(ellipse_at_top,_#2c4f3d,_#163023)]',
    chalk: 'text-[#f4f1ea]',
    chalkDim: 'text-[#cfe0d6]',
    accent: 'text-[#f2c14e]',
    ruleBg: 'bg-white/[0.04]',
    ruleBorder: 'border-white/15',
    divider: 'border-white/10',
  },
}
