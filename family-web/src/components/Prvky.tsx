import type { ReactNode } from 'react'

export function Sekcia({ nadpis, pozn, children }: { nadpis: string; pozn?: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-jedlo">{nadpis}</h3>
        {pozn && <span className="text-xs text-neutral-400">{pozn}</span>}
      </div>
      {children}
    </section>
  )
}

/** Prepínač z dvoch a viac možností (veľkosť, samostatne/menu, rozvoz/odber). */
export function Prepinac<T extends string | number>({
  moznosti,
  hodnota,
  onZmena,
  popis,
}: {
  moznosti: { hodnota: T; nazov: string; pod?: string }[]
  hodnota: T
  onZmena: (h: T) => void
  popis: string
}) {
  return (
    <div role="radiogroup" aria-label={popis} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${moznosti.length}, minmax(0, 1fr))` }}>
      {moznosti.map((m) => {
        const akt = m.hodnota === hodnota
        return (
          <button
            key={String(m.hodnota)}
            type="button"
            role="radio"
            aria-checked={akt}
            onClick={() => onZmena(m.hodnota)}
            className={`min-h-12 rounded-xl border px-2 py-2 text-center transition-colors ${akt ? 'border-zlata bg-zlata/15 text-white' : 'border-white/15 bg-black/30 text-neutral-300'}`}
          >
            <span className="block text-sm font-bold leading-tight">{m.nazov}</span>
            {m.pod && <span className={`block truncate text-xs font-bold ${akt ? 'text-jedlo' : 'text-neutral-400'}`}>{m.pod}</span>}
          </button>
        )
      })}
    </div>
  )
}

export function Cip({ zap, onClick, children, skrt }: { zap: boolean; onClick: () => void; children: ReactNode; skrt?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={zap}
      onClick={onClick}
      className={`min-h-10 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        zap ? (skrt ? 'border-red-400/70 bg-red-900/40 text-red-100 line-through' : 'border-zlata bg-zlata/15 text-white') : 'border-white/15 bg-black/30 text-neutral-200'
      }`}
    >
      {children}
    </button>
  )
}

export function Pocitadlo({ pocet, onMinus, onPlus, male }: { pocet: number; onMinus: () => void; onPlus: () => void; male?: boolean }) {
  const t = `grid place-items-center rounded-full border border-zlata/60 text-xl font-bold text-zlata-sv ${male ? 'h-9 w-9' : 'h-11 w-11'}`
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={onMinus} aria-label="Menej" className={t}>
        −
      </button>
      <span className="w-6 text-center text-base font-extrabold text-white" aria-live="polite">
        {pocet}
      </span>
      <button type="button" onClick={onPlus} aria-label="Viac" className={t}>
        +
      </button>
    </div>
  )
}

export const poleTrieda =
  'h-12 w-full rounded-xl border border-white/15 bg-black/40 px-3.5 text-base text-white placeholder:text-neutral-500 focus:border-zlata focus:outline-none'

export function Pole({ popis, chyba, children, pozn }: { popis: string; chyba?: string | null; pozn?: string; children: ReactNode }) {
  return (
    <label className="mt-3 block">
      <span className="mb-1 flex items-baseline justify-between gap-2 text-sm font-bold text-neutral-200">
        {popis}
        {pozn && <span className="text-xs font-normal text-neutral-400">{pozn}</span>}
      </span>
      {children}
      {chyba && (
        <span role="alert" className="mt-1 block text-sm font-medium text-red-300">
          {chyba}
        </span>
      )}
    </label>
  )
}
