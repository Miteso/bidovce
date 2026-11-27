import { motion } from 'framer-motion'
import { eur } from '../lib/cena'
import type { Polozka } from '../lib/typy'
import { Obrazok } from './Obrazok'

function Ceny({ p }: { p: Polozka }) {
  if (p.kat === 'pizza')
    return (
      <div className="flex gap-4">
        <Cena popis="malá" suma={p.cena_mala!} />
        <Cena popis="veľká" suma={p.cena_velka!} />
      </div>
    )
  if (p.cena_menu != null)
    return (
      <div className="flex gap-4">
        <Cena popis="burger" suma={p.cena!} />
        <Cena popis="menu" suma={p.cena_menu} />
      </div>
    )
  if (p.varianty)
    return (
      <div className="flex gap-4">
        {p.varianty.map((v) => (
          <Cena key={v.gramaz} popis={v.gramaz} suma={v.cena} />
        ))}
      </div>
    )
  return <Cena suma={p.cena!} />
}

function Cena({ popis, suma }: { popis?: string; suma: number }) {
  return (
    <div className="leading-tight">
      {popis && <div className="text-[0.62rem] font-bold uppercase tracking-wider text-neutral-400">{popis}</div>}
      <div className="text-[1.05rem] font-extrabold text-jedlo">{eur(suma)}</div>
    </div>
  )
}

export function KartaJedla({ p, index, onOtvor }: { p: Polozka; index: number; onOtvor: (p: Polozka, el: HTMLElement | null) => void }) {
  const vyp = !!p.vypredane
  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`karta relative flex gap-3 rounded-2xl p-3 ${vyp ? 'opacity-55 grayscale' : ''}`}
    >
      <button
        type="button"
        disabled={vyp}
        onClick={(e) => onOtvor(p, e.currentTarget.querySelector('[data-foto]'))}
        className="absolute inset-0 rounded-2xl"
        aria-label={vyp ? `${p.nazov} – dnes vypredané` : `${p.nazov} – vybrať a pridať do košíka`}
      />
      <div data-foto className="pointer-events-none self-center">
        <Obrazok p={p} index={index} />
      </div>
      <div className="pointer-events-none min-w-0 flex-1">
        {p.odporucame && (
          <span className="mb-1 inline-block rounded-full bg-bordo px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white ring-1 ring-zlata/60">
            ★ Odporúčame
          </span>
        )}
        <h3 className="text-[0.95rem] font-bold uppercase leading-tight text-jedlo">
          {p.nazov}
          {p.gramaz && <span className="ml-2 text-xs font-medium normal-case text-neutral-300">{p.gramaz}</span>}
        </h3>
        {p.zlozenie && <p className="mt-1 text-[0.78rem] leading-snug text-text">{p.zlozenie.join(', ')}</p>}
        {p.alergeny && <p className="mt-1 text-[0.66rem] text-neutral-400">Alergény: {p.alergeny.join(', ')}</p>}
        <div className="mt-2 flex items-end justify-between gap-2">
          {vyp ? <span className="text-sm font-bold uppercase text-neutral-300">Dnes vypredané</span> : <Ceny p={p} />}
          {!vyp && (
            <span aria-hidden className="zlate-tlacidlo grid h-10 w-10 shrink-0 place-items-center rounded-full text-2xl font-bold leading-none">
              +
            </span>
          )}
        </div>
      </div>
    </motion.article>
  )
}
