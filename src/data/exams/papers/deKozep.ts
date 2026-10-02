// Shared pieces of the érettségi német középszint papers (the booklets print the same
// covers, listening announcement and writing rubric every sitting).
import type { BooleanItem } from '../types'

export { choices, cloze, gapMcqs, opts, words } from './enKozep.ts'

export const DE_NOTICES_HU = [
  'Az Olvasott szöveg értése, a Nyelvhelyesség és a Hallott szöveg értése feladatlapokhoz semmilyen segédeszköz nem használható. Az Íráskészség részhez bármilyen nyomtatott szótár használható.',
  'Egy füzeten belül a feladatok megoldási sorrendje tetszőleges.',
  'Az egyes feladatokra nem kaphat többet a feltüntetett pontszámnál.',
]

export const DE_LISTENING_INTRO = [
  'Guten Tag! Jetzt beginnt die Prüfung zum Hörverstehen.',
  'Die Prüfung besteht aus drei Aufgaben. Sie werden drei Hörtexte hören. Die Aufgaben dazu sind in diesem Heft.',
  '• Jede Aufgabe beginnt und endet mit Musik. Dann hören Sie die Aufgabenstellung.',
  '• Später haben Sie eine Minute Zeit, die Aufgabe zu lesen.',
  '• Danach hören Sie den Text das erste Mal, ohne Pausen.',
  '• Dann haben Sie circa eine Minute Zeit.',
  '• Sie hören dann den Text das zweite Mal, in kürzeren Abschnitten.',
  '• Zuletzt haben Sie noch einmal Zeit, Ihre Lösung zu kontrollieren.',
  'Die Prüfung dauert 30 Minuten. Viel Glück!',
]

export const DE_WRITING_INTRO = [
  'Ehhez a feladatlaphoz bármilyen egynyelvű vagy kétnyelvű nyomtatott szótár használható.',
  'A két feladat megoldási sorrendje tetszőleges.',
]

export const DE_CRITERIA_1 = [
  { labelHu: 'Tartalom', points: 4 },
  { labelHu: 'Szövegalkotás, hangnem, az olvasóban keltett benyomás', points: 4 },
  { labelHu: 'Szókincs, kifejezésmód', points: 4 },
  { labelHu: 'Nyelvtan, helyesírás', points: 4 },
]

export const DE_CRITERIA_2 = [
  { labelHu: 'Tartalom', points: 5 },
  { labelHu: 'Szövegalkotás, hangnem, az olvasóban keltett benyomás', points: 4 },
  { labelHu: 'Szókincs, kifejezésmód', points: 4 },
  { labelHu: 'Nyelvtan, helyesírás', points: 4 },
]

/** `rf(10, [...statements], 'F R F')`: richtig/falsch items (`R` = true). */
export function rf(first: number, statements: string[], keys: string): BooleanItem[] {
  return keys.split(' ').map((k, i) => ({ id: String(first + i), type: 'boolean', statement: statements[i], answer: k === 'R' }))
}
