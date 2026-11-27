import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { vetaOdhadu } from '../lib/cas'
import { eur, najdiObec, spocitaj } from '../lib/cena'
import { menu, nastavenia, obce } from '../lib/data'
import { popisRiadku } from '../lib/text'
import type { Riadok } from '../lib/typy'
import { nacitajObjednavku } from '../store/kosik'
import { Hlavicka } from '../components/Hlavicka'
import { Paticka } from '../components/Paticka'
import { Sucet } from './Kosik'

const Mapa = lazy(() => import('../components/Mapa'))

const STAVY = {
  ROZVOZ: ['Prijatá', 'Pripravuje sa', 'Na ceste', 'Doručená'],
  ODBER: ['Prijatá', 'Pripravuje sa', 'Pripravená na odber', 'Vyzdvihnutá'],
}

export function Potvrdenie({ cislo }: { cislo: string }) {
  const u = useMemo(() => nacitajObjednavku(cislo), [cislo])
  const [stav, setStav] = useState(0)
  const [mapa, setMapa] = useState(false)

  // V ukážke sa stav posúva sám.
  useEffect(() => {
    if (stav >= 3) return
    const t = setTimeout(() => setStav((s) => s + 1), stav === 0 ? 4000 : 9000)
    return () => clearTimeout(t)
  }, [stav])

  if (!u)
    return (
      <div>
        <Hlavicka nadpis="Objednávka" />
        <p className="px-6 py-20 text-center text-neutral-200">
          Objednávku č. {cislo} sme v tomto zariadení nenašli.
          <a href="#/menu" className="zlate-tlacidlo mx-auto mt-6 block w-fit rounded-full px-8 py-3 font-black">
            Späť do menu
          </a>
        </p>
      </div>
    )

  const o = u.objednavka
  const riadky = o.polozky.map((p, i) => ({ ...p, uid: String(i) }) as Riadok)
  const v = spocitaj(menu, obce, riadky, { sposob: o.sposob, obec: o.obec })
  const stavy = STAVY[o.sposob]
  const veta = vetaOdhadu(nastavenia, o.sposob, najdiObec(obce, o.obec), o.na_cas)

  return (
    <div>
      <Hlavicka nadpis="Ďakujeme" />
      <main className="mx-auto max-w-xl px-3 pt-2">
        <section className="text-center">
          <svg viewBox="0 0 80 80" className="mx-auto h-24 w-24" aria-hidden>
            <motion.circle cx="40" cy="40" r="34" fill="none" stroke="#d4af37" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
            <motion.path d="M24 41l11 11 21-23" fill="none" stroke="#f3dc8f" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.5 }} />
          </svg>
          <h2 className="mt-2 text-xl font-black uppercase text-white">Objednávka prijatá</h2>
          <p className="text-sm text-neutral-300">
            Číslo objednávky <strong className="text-lg text-jedlo">{cislo}</strong>
          </p>
          <p className="mt-3 text-lg font-bold leading-snug text-zlata-sv">{veta}.</p>
          {nastavenia.demo && <p className="mx-auto mt-3 w-fit rounded-full border border-white/20 px-3 py-1 text-xs text-neutral-300">Ukážka – objednávka sa nikam neodoslala</p>}
        </section>

        <section className="karta mt-6 rounded-2xl p-4" aria-label="Stav objednávky">
          <ol>
            {stavy.map((s, i) => (
              <li key={s} className="relative flex gap-3 pb-5 last:pb-0" aria-current={i === stav ? 'step' : undefined}>
                {i < stavy.length - 1 && (
                  <span className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-0.5 bg-white/15">
                    <motion.span className="block w-full bg-zlata" initial={false} animate={{ height: i < stav ? '100%' : '0%' }} transition={{ duration: 0.6 }} />
                  </span>
                )}
                <motion.span
                  className={`relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black ${i <= stav ? 'zlate-tlacidlo' : 'bg-neutral-700 text-neutral-400'}`}
                  animate={i === stav && stav < 3 ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                  transition={{ duration: 1.4, repeat: i === stav && stav < 3 ? Infinity : 0 }}
                >
                  {i < stav || stav === 3 ? '✓' : i + 1}
                </motion.span>
                <span className={`pt-0.5 text-sm font-bold ${i <= stav ? 'text-white' : 'text-neutral-400'}`}>{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-neutral-400">Ukážka – stav sa tu posúva sám.</p>
        </section>

        {o.sposob === 'ROZVOZ' && (
          <section className="mt-4">
            {!mapa ? (
              <button type="button" onClick={() => setMapa(true)} className="w-full rounded-full border border-zlata/70 bg-black/30 py-3.5 text-base font-bold text-zlata-sv">
                Sledovať vodiča
              </button>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-zlata/40">
                <p className="bg-bordo px-3 py-1.5 text-center text-xs font-bold text-white">Ukážka – pripravujeme. Trasa a poloha vodiča sú len ilustračné.</p>
                <Suspense fallback={<div className="grid h-72 place-items-center text-sm text-neutral-300">Načítavam mapu…</div>}>
                  <Mapa />
                </Suspense>
              </div>
            )}
          </section>
        )}

        <section className="karta mt-4 rounded-2xl p-3.5">
          <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-jedlo">Súhrn</h3>
          <ul className="mb-3 space-y-1.5 text-sm">
            {v.riadky.map((x) => {
              const { nazov, upravy } = popisRiadku(menu, x.riadok)
              return (
                <li key={x.riadok.uid} className="flex justify-between gap-3">
                  <span>
                    <span className="font-bold text-white">
                      {x.riadok.pocet}× {nazov}
                    </span>
                    {upravy.length > 0 && <span className="block text-xs text-neutral-400">{upravy.join(' · ')}</span>}
                  </span>
                  <span className="shrink-0 font-bold text-white">{eur(x.spolu)}</span>
                </li>
              )
            })}
          </ul>
          <div className="border-t border-white/10 pt-3">
            <Sucet v={v} sposob={o.sposob} obecVybrana />
          </div>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-white/10 pt-3 text-sm">
            <dt className="text-neutral-400">{o.sposob === 'ODBER' ? 'Odber' : 'Adresa'}</dt>
            <dd className="text-white">{o.sposob === 'ODBER' ? nastavenia.adresa : o.adresa}</dd>
            <dt className="text-neutral-400">Platba</dt>
            <dd className="text-white">{u.kontakt.platba} – pri prevzatí</dd>
          </dl>
        </section>

        <a href="#/menu" className="mt-5 block rounded-full border border-white/15 py-3 text-center text-sm font-bold text-neutral-200">
          Späť do menu
        </a>
      </main>
      <Paticka />
    </div>
  )
}
