import { useState } from 'react'
import type { PracticeLine } from '../../lib/types'
import PracticeSentence from '../PracticeSentence'

export default function PracticeCheck({ practice }: { practice: PracticeLine[] }) {
  const [index, setIndex] = useState(0)
  const current = practice[index % practice.length]

  return (
    <div className="relative mx-auto max-w-md pt-3">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-16 rotate-[-3deg] bg-amber-100/80 border border-amber-200/70 shadow-sm" />
      <div className="rounded-lg border border-slate-200 bg-[#fffdf3] shadow-md p-5">
        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3">Your turn — most te jössz</p>

        <PracticeSentence key={index} en={current.en} hu={current.hu} voiceGender="female" />

        {practice.length > 1 && (
          <button
            onClick={() => setIndex((i) => (i + 1) % practice.length)}
            className="mt-3 text-sm text-indigo-600 hover:underline"
          >
            Try another →
          </button>
        )}
      </div>
    </div>
  )
}
