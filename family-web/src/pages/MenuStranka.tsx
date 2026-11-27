import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { menu } from '../lib/data'
import type { KatId, Polozka } from '../lib/typy'
import { Hlavicka } from '../components/Hlavicka'
import { KartaJedla } from '../components/KartaJedla'
import { Paticka } from '../components/Paticka'

const bezDiakritiky = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Nadpisy sekcií ako na lístku: zlaté „PIZZA" + ručne písané „menu". */
const ZLATE: Partial<Record<KatId, [string, string]>> = { pizza: ['Pizza', 'menu'], burgre: ['Burger', 'menu'] }

export function MenuStranka({ onOtvor }: { onOtvor: (p: Polozka, el: HTMLElement | null) => void }) {
  const [hladaj, setHladaj] = useState('')
  const [aktivna, setAktivna] = useState<KatId>(menu.kategorie[0].id)
  const zalozky = useRef<HTMLDivElement>(null)
  const klik = useRef(0)

  const q = bezDiakritiky(hladaj.trim())
  const sekcie = useMemo(
    () =>
      menu.kategorie
        .map((k) => ({
          k,
          polozky: menu.polozky.filter(
            (p) =>
              p.kat === k.id &&
              (!q || bezDiakritiky(p.nazov).includes(q) || (p.zlozenie ?? []).some((z) => bezDiakritiky(z).includes(q))),
          ),
        }))
        .filter((s) => s.polozky.length > 0),
    [q],
  )

  // Aktívna záložka podľa toho, ktorá sekcia je práve hore na obrazovke.
  useEffect(() => {
    const os = () => {
      if (Date.now() - klik.current < 900) return
      let naj: KatId | null = null
      for (const s of document.querySelectorAll<HTMLElement>('[data-sekcia]')) {
        if (s.getBoundingClientRect().top < 190) naj = s.dataset.sekcia as KatId
      }
      if (naj) setAktivna(naj)
    }
    window.addEventListener('scroll', os, { passive: true })
    return () => window.removeEventListener('scroll', os)
  }, [])

  useEffect(() => {
    zalozky.current?.querySelector(`[data-zalozka="${aktivna}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [aktivna])

  const skoc = (id: KatId) => {
    klik.current = Date.now()
    setAktivna(id)
    const el = document.querySelector<HTMLElement>(`[data-sekcia="${id}"]`)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 118, behavior: 'smooth' })
  }

  return (
    <div>
      <Hlavicka nadpis="Menu" pismo="vyber si" />
      <div className="sticky top-0 z-30 -mt-3 border-b border-zlata/25 bg-[#1c1c1c]/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-3 pt-3">
          <label className="relative block">
            <span className="sr-only">Hľadať jedlo alebo surovinu</span>
            <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={hladaj}
              onChange={(e) => setHladaj(e.target.value)}
              placeholder="Hľadať jedlo alebo surovinu…"
              className="h-11 w-full rounded-full border border-white/15 bg-black/40 pl-10 pr-4 text-base text-white placeholder:text-neutral-500 focus:border-zlata focus:outline-none"
            />
          </label>
        </div>
        <div ref={zalozky} role="tablist" aria-label="Kategórie" className="bez-listy mx-auto flex max-w-3xl gap-1 overflow-x-auto px-2">
          {menu.kategorie.map((k) => (
            <button
              key={k.id}
              role="tab"
              aria-selected={aktivna === k.id}
              data-zalozka={k.id}
              onClick={() => skoc(k.id)}
              className={`relative shrink-0 whitespace-nowrap px-3 py-3 text-sm font-bold transition-colors ${aktivna === k.id ? 'text-zlata-sv' : 'text-neutral-400'}`}
            >
              {k.nazov}
              {aktivna === k.id && <motion.span layoutId="podciarknutie" className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-zlata" />}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-3 pt-5">
        {sekcie.length === 0 && <p className="py-16 text-center text-neutral-300">Pre „{hladaj}" sme nič nenašli. Skúste iný názov alebo surovinu.</p>}
        {sekcie.map(({ k, polozky }) => (
          <section key={k.id} data-sekcia={k.id} className="mb-9">
            <div className="mb-1 flex items-end gap-3 px-1">
              <h2 className="flex shrink-0 items-baseline gap-2">
                {ZLATE[k.id] ? (
                  <>
                    <span className="zlato text-[2rem] font-black uppercase leading-none">{ZLATE[k.id]![0]}</span>
                    <span className="font-script text-[2.1rem] leading-none text-white">{ZLATE[k.id]![1]}</span>
                  </>
                ) : (
                  <span className="font-script text-[2.3rem] leading-none text-white">{k.nazov}</span>
                )}
              </h2>
              <div className="ciara-zlata mb-2 flex-1" />
            </div>
            {k.popis && <p className="mb-3 px-1 text-xs font-medium text-neutral-300">{k.popis}</p>}
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {polozky.map((p, i) => (
                <KartaJedla key={p.id} p={p} index={i} onOtvor={onOtvor} />
              ))}
            </div>
          </section>
        ))}
      </main>
      <Paticka />
    </div>
  )
}
