import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { eur, spocitaj } from '../lib/cena'
import type { Vypocet } from '../lib/cena'
import { menu, obce } from '../lib/data'
import { popisRiadku } from '../lib/text'
import type { Riadok } from '../lib/typy'
import { useKosik } from '../store/kosik'
import { Hlavicka } from '../components/Hlavicka'
import { Obrazok } from '../components/Obrazok'
import { Pocitadlo } from '../components/Prvky'
import { INA_OBEC, VyberDorucenia } from '../components/VyberDorucenia'

export function useVypocet(): Vypocet {
  const riadky = useKosik((s) => s.riadky)
  const k = useKosik((s) => s.kontakt)
  return useMemo(() => spocitaj(menu, obce, riadky, { sposob: k.sposob, obec: k.obec }), [riadky, k.sposob, k.obec])
}

const ISKRY = Array.from({ length: 14 }, (_, i) => ({ x: (i * 53) % 100, d: (i % 5) * 0.12, v: 6 + (i % 4) * 3 }))

/** Ukazovateľ akcie tri plus jedna + ponuky. */
function Akcia31({ pizz }: { pizz: number }) {
  if (pizz === 0) return null
  const vKole = pizz % 4
  const splnena = pizz >= 4 && vKole === 0
  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl border border-zlata/60 bg-gradient-to-b from-bordo to-bordo-tm p-3.5 text-white">
      {splnena &&
        ISKRY.map((s, i) => (
          <motion.span
            key={`${pizz}-${i}`}
            aria-hidden
            className="absolute top-1/2 rounded-full bg-[#f3dc8f] shadow-[0_0_8px_#f3dc8f]"
            style={{ left: `${s.x}%`, width: s.v, height: s.v }}
            initial={{ opacity: 0, y: 10, scale: 0 }}
            animate={{ opacity: [0, 1, 0], y: [10, -34 - s.v * 2], scale: [0, 1, 0.3] }}
            transition={{ duration: 1.3, delay: s.d, repeat: 2 }}
          />
        ))}
      <p className="text-sm font-extrabold leading-snug" aria-live="polite">
        {splnena
          ? 'Akcia tri plus jedna – najlacnejšia pizza zadarmo'
          : pizz > 4
            ? `Akcia tri plus jedna platí. Do ďalšej pizze zadarmo: už ${vKole} z 4`
            : pizz === 3
              ? 'Už 3 z 4 pizz – štvrtá je zadarmo'
              : `Už ${pizz} z 4 pizz – pri štyroch je najlacnejšia zadarmo`}
      </p>
      <div className="mt-2 flex gap-1.5" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-2.5 flex-1 rounded-full"
            animate={{ backgroundColor: splnena || i < vKole ? '#e9c765' : 'rgba(0,0,0,0.35)' }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
          />
        ))}
      </div>
      {pizz === 1 && <Ponuka text="Pridaj druhú pizzu a nápoj máš zadarmo" />}
      {pizz === 3 && <Ponuka text="Pridaj štvrtú – akcia tri plus jedna, najlacnejšia je zadarmo" />}
    </div>
  )
}

function Ponuka({ text }: { text: string }) {
  return (
    <a href="#/menu" className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-black/30 px-3 py-2.5 text-sm font-bold text-zlata-sv">
      {text}
      <span aria-hidden className="zlate-tlacidlo grid h-8 w-8 shrink-0 place-items-center rounded-full text-lg font-black">
        +
      </span>
    </a>
  )
}

/** Riadky súčtu – rovnaké v košíku, pokladni aj na potvrdení. */
export function Sucet({ v, sposob, obecVybrana }: { v: Vypocet; sposob: 'ROZVOZ' | 'ODBER'; obecVybrana: boolean }) {
  const [rozpis, setRozpis] = useState(false)
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt>Jedlá</dt>
        <dd className="font-bold text-white">{eur(v.medzisucet)}</dd>
      </div>
      {v.akcie.map((a, i) => (
        <div key={i} className="flex justify-between gap-3 font-bold text-zlata-sv">
          <dt>{a.text}</dt>
          <dd className="shrink-0">{a.suma < 0 ? `− ${eur(-a.suma)}` : eur(0)}</dd>
        </div>
      ))}
      <div>
        <div className="flex justify-between">
          <dt>
            <button type="button" onClick={() => setRozpis(!rozpis)} aria-expanded={rozpis} className="-my-2 py-2 underline decoration-dotted underline-offset-4">
              Balné {rozpis ? '▴' : '▾'}
            </button>
          </dt>
          <dd className="font-bold text-white">{eur(v.balne)}</dd>
        </div>
        <AnimatePresence>
          {rozpis && (
            <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden text-xs text-neutral-400">
              {v.balne_rozpis.map((b) => (
                <li key={b.nazov} className="flex justify-between pt-1.5">
                  <span>
                    {b.pocet}× {b.nazov.toLowerCase()} ({eur(b.cena)})
                  </span>
                  <span>{eur(b.spolu)}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      <div className="flex justify-between">
        <dt>{sposob === 'ODBER' ? 'Osobný odber' : 'Doprava'}</dt>
        <dd className="font-bold text-white">{sposob === 'ODBER' ? eur(0) : obecVybrana ? eur(v.doprava) : 'podľa obce'}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-zlata/30 pt-3">
        <dt className="text-base font-extrabold uppercase text-white">Spolu</dt>
        <dd className="text-2xl font-black text-jedlo">{eur(v.suma)}</dd>
      </div>
    </dl>
  )
}

export function Kosik({ onUprav }: { onUprav: (r: Riadok) => void }) {
  const zmenPocet = useKosik((s) => s.zmenPocet)
  const odstran = useKosik((s) => s.odstran)
  const k = useKosik((s) => s.kontakt)
  const v = useVypocet()
  const obecVybrana = !!k.obec && k.obec !== INA_OBEC

  if (v.pocet_kusov === 0)
    return (
      <div>
        <Hlavicka nadpis="Košík" spat="/menu" />
        <div className="px-6 py-20 text-center">
          <p className="font-script text-5xl text-white">Zatiaľ prázdno</p>
          <p className="mt-3 text-sm text-neutral-300">Vyberte si z poctivej pizze a smash burgrov.</p>
          <a href="#/menu" className="zlate-tlacidlo mt-6 inline-block rounded-full px-8 py-3.5 font-black uppercase">
            Pozrieť menu
          </a>
        </div>
      </div>
    )

  return (
    <div>
      <Hlavicka nadpis="Košík" pismo={`${v.pocet_kusov} ks`} spat="/menu" />
      <main className="mx-auto max-w-xl px-3 pb-36 pt-3">
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {v.riadky.map((x) => {
              const { nazov, upravy } = popisRiadku(menu, x.riadok)
              return (
                <motion.li key={x.riadok.uid} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -60 }} className="karta rounded-2xl p-3">
                  <div className="flex gap-3">
                    <Obrazok p={x.polozka} velkost={56} />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <h3 className="text-sm font-bold uppercase leading-tight text-jedlo">{nazov}</h3>
                        <span className="shrink-0 text-base font-extrabold text-white">{eur(x.spolu)}</span>
                      </div>
                      {upravy.length > 0 && <p className="mt-1 text-xs leading-snug text-neutral-300">{upravy.join(' · ')}</p>}
                      {x.riadok.pocet > 1 && <p className="mt-0.5 text-xs text-neutral-400">{eur(x.cena_ks)} / ks</p>}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => onUprav(x.riadok)} className="min-h-10 rounded-full px-3 text-sm font-bold text-zlata-sv underline decoration-zlata/50 underline-offset-4">
                        Upraviť
                      </button>
                      <button type="button" onClick={() => odstran(x.riadok.uid)} className="min-h-10 rounded-full px-3 text-sm font-bold text-neutral-300 underline decoration-white/30 underline-offset-4">
                        Odstrániť
                      </button>
                    </div>
                    <Pocitadlo male pocet={x.riadok.pocet} onMinus={() => zmenPocet(x.riadok.uid, -1)} onPlus={() => zmenPocet(x.riadok.uid, 1)} />
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
        <a href="#/menu" className="mt-3 block rounded-full border border-white/15 py-3 text-center text-sm font-bold text-neutral-200">
          + Pridať ďalšie jedlo
        </a>

        <Akcia31 pizz={v.pocet_pizz} />

        <section className="karta mt-4 rounded-2xl p-3.5">
          <h2 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-jedlo">Kam to bude?</h2>
          <VyberDorucenia />
        </section>

        <section className="karta mt-4 rounded-2xl p-3.5">
          <Sucet v={v} sposob={k.sposob} obecVybrana={obecVybrana} />
          {k.sposob === 'ROZVOZ' && v.minimum != null && v.chyba_do_minima > 0 && (
            <p role="alert" className="mt-3 rounded-xl border border-red-400/50 bg-red-950/40 p-3 text-sm font-medium text-white">
              Minimálna objednávka pre obec {k.obec} je {eur(v.minimum)} (bez dopravy). Chýba ešte <strong>{eur(v.chyba_do_minima)}</strong>.
            </p>
          )}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zlata/30 bg-[#161616]/95 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur">
        <a href="#/pokladna" className="zlate-tlacidlo mx-auto block max-w-md rounded-full py-3.5 text-center text-[1.05rem] font-black uppercase tracking-wide">
          Do pokladne · {eur(v.suma)}
        </a>
      </div>
    </div>
  )
}
