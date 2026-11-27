import logo from '../assets/logo.webp'
import pizza from '../assets/pizza.webp'
import burger from '../assets/burger.webp'
import { eur } from '../lib/cena'
import { nastavenia, obce } from '../lib/data'
import { kedyPrijimame, stavOtvorenia } from '../lib/otvaracie'
import { Paticka } from '../components/Paticka'

const tel = (c: string) => `tel:${c.replace(/\s/g, '')}`

/** Obce zoskupené podľa ceny dopravy (z obce.json). */
function skupinyDopravy() {
  const m = new Map<number, string[]>()
  for (const o of obce.obce) m.set(o.doprava, [...(m.get(o.doprava) ?? []), o.nazov])
  return [...m.entries()].sort((a, b) => a[0] - b[0])
}

function Sipka({ className, d }: { className?: string; d: string }) {
  return (
    <svg viewBox="0 0 60 40" className={className} fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  )
}

export function Akcie() {
  return (
    <div className="relative mx-auto max-w-md overflow-hidden rounded-xl border border-zlata/70 bg-gradient-to-b from-bordo to-bordo-tm pr-10 text-white shadow-[0_10px_24px_rgba(0,0,0,0.5)]">
      <div className="px-4 py-3">
        <p className="text-lg font-black uppercase leading-tight">3 + 1 pizza grátis!</p>
        <p className="mt-1 text-[0.8rem] leading-snug text-white/85">
          Objednaj si 4 pizze a najlacnejšiu máš zadarmo. Platí na malé aj veľké pizze. Balné sa účtuje za všetky pizze.
        </p>
      </div>
      <div className="mx-4 border-t-2 border-dashed border-zlata/80" />
      <div className="px-4 py-3">
        <p className="text-lg font-black uppercase leading-tight">2× pizza + nápoj grátis!</p>
        <p className="mt-1 text-[0.8rem] leading-snug text-white/85">K dvom alebo trom pizzam nápoj podľa ponuky zadarmo.</p>
      </div>
      <div className="absolute inset-y-0 right-0 grid w-9 place-items-center bg-gradient-to-b from-[#f3dc8f] via-[#d4af37] to-[#b8862e]">
        <span className="rotate-[-90deg] whitespace-nowrap text-sm font-black tracking-[0.2em] text-bordo-tm">AKCIE</span>
      </div>
      <p className="bg-black/25 px-4 py-1.5 text-center text-[0.7rem] text-white/75">Akcie nie je možné kombinovať.</p>
    </div>
  )
}

export function Uvod() {
  const stav = stavOtvorenia(nastavenia)
  return (
    <div>
      <header className="mramor-tien relative z-10">
        <div className="mramor px-5 pb-16 pt-5 text-center">
          <img src={logo} alt="Family Restaurant & Caffe" width={104} height={106} className="mx-auto h-[104px] w-[104px] drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)]" />
          <h1 className="mt-2">
            <span className="zlato zlato-mramor zlato-tien block text-[3.6rem] font-black leading-[0.95] tracking-tight">POCTIVÁ</span>
            <span className="mt-1 block text-[1.2rem] font-extrabold tracking-wide text-[#5c1414]">PIZZA &amp; SMASH BURGER</span>
            <span className="-mt-1 block font-script text-[1.9rem] leading-none text-neutral-700">bez kompromisov</span>
          </h1>
        </div>
      </header>

      {/* Pizza a burger ako na jedálnom lístku */}
      <section className="relative mx-auto -mt-12 h-[452px] max-w-[430px] overflow-x-clip" aria-label="Poctivá pizza a smash burger">
        <p className="pise absolute left-3 top-1 z-20 -rotate-[9deg] font-script text-[3.5rem] leading-none text-zlata drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
          Sme späť!
        </p>
        <div className="absolute right-3 top-[58px] z-20 text-right">
          <p className="zlato text-[1.15rem] font-black leading-none">PIZZA A BURGRE</p>
          <p className="font-script text-[1.7rem] leading-none text-white">až k tebe domov</p>
        </div>

        <div className="absolute left-1/2 top-[92px] h-[300px] w-[300px] -translate-x-[58%] rounded-full shadow-[0_18px_30px_rgba(0,0,0,0.6)]">
          <img src={pizza} alt="Pizza z našej pece" width={300} height={300} fetchPriority="high" className="toc h-full w-full" />
        </div>

        <a href="#akcie" className="pulzuje absolute right-0 top-[132px] z-10 flex origin-right items-stretch overflow-hidden rounded-l-lg border border-r-0 border-zlata/80 text-white shadow-[0_8px_18px_rgba(0,0,0,0.55)]">
          <span className="bg-gradient-to-b from-bordo to-bordo-tm px-3 py-1.5 text-right">
            <span className="block text-[0.95rem] font-black leading-tight">3+1 PIZZA GRÁTIS!</span>
            <span className="my-1 block border-t border-dashed border-zlata/80" />
            <span className="block text-[0.72rem] font-extrabold leading-tight">2x PIZZA + NÁPOJ GRÁTIS!</span>
          </span>
          <span className="grid w-6 place-items-center bg-gradient-to-b from-[#f3dc8f] via-[#d4af37] to-[#b8862e]">
            <span className="rotate-[-90deg] text-[0.62rem] font-black tracking-widest text-bordo-tm">AKCIE</span>
          </span>
        </a>

        <div className="plava absolute left-1/2 top-[262px] z-10 w-[250px] -translate-x-[38%]">
          <img src={burger} alt="Royal BBQ smash burger" width={250} height={185} className="w-full drop-shadow-[0_16px_18px_rgba(0,0,0,0.65)]" />
        </div>

        <p className="absolute left-2 top-[352px] z-20 w-[92px] -rotate-3 text-center font-ruka text-[1.05rem] leading-[1.05] text-white">
          100% hovädzie smash mäso + cheddar
        </p>
        <Sipka className="absolute left-[88px] top-[372px] z-20 w-9" d="M4 14c14-8 30-6 46 6M40 10l10 10-13 3" />
        <p className="absolute right-1 top-[226px] z-20 w-[84px] rotate-3 text-center font-ruka text-[1.05rem] leading-[1.05] text-white">
          Domáce briošková žemle
        </p>
        <Sipka className="absolute right-[58px] top-[276px] z-20 w-8" d="M52 6C44 22 30 30 10 30M22 22 9 30l11 8" />
      </section>

      <section className="relative z-10 mx-auto max-w-md px-5 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-1.5 text-sm font-bold text-white">
          <span className={`h-2.5 w-2.5 rounded-full ${stav.otvorene ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-red-500'}`} />
          {stav.text}
        </p>
        {!stav.otvorene && (
          <p className="mt-2 text-xs text-neutral-300">Objednávky prijímame {kedyPrijimame(nastavenia)}. Objednať sa dá aj vopred na čas.</p>
        )}
        <p className="mt-3 text-sm text-neutral-200">Objednávky aj na čísle <a className="font-bold text-white" href={tel(nastavenia.telefon_objednavky)}>{nastavenia.telefon_objednavky}</a></p>
        <p className="mt-1 text-xs text-neutral-400">Platíte až pri prevzatí – {nastavenia.platby.join(', ').toLowerCase()}.</p>
      </section>

      <section id="akcie" className="mt-10 scroll-mt-4 px-5">
        <Nadpis zlaty="Akcie" pismo="pre teba" />
        <Akcie />
      </section>

      <section className="mx-auto mt-10 max-w-md px-5">
        <Nadpis zlaty="Rozvoz" pismo="Sečovce a okolie" />
        <ul className="space-y-2 text-sm">
          {skupinyDopravy().map(([cena, nazvy]) => (
            <li key={cena} className="flex gap-3">
              <span className="w-[4.2rem] shrink-0 font-extrabold text-jedlo">{eur(cena)}</span>
              <span className="leading-snug">{nazvy.join(', ')}</span>
            </li>
          ))}
          {obce.specialne.length > 0 && (
            <li className="flex gap-3">
              <span className="w-[4.2rem] shrink-0 font-extrabold text-jedlo">{eur(obce.specialne[0].doprava)}</span>
              <span className="leading-snug">
                {obce.specialne.map((s) => s.nazov).join(', ')} – {obce.specialne[0].poznamka}
              </span>
            </li>
          )}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-neutral-400">
          Minimálna objednávka:{' '}
          {obce.obce
            .filter((o) => o.min_objednavka != null)
            .map((o) => `${o.nazov} ${o.min_objednavka} €`)
            .join(', ')}
          . Osobný odber: {nastavenia.adresa}.
        </p>
      </section>

      <Paticka />

      {/* Objednať je stále na dosah */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zlata/30 bg-[#161616]/95 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur">
        <div className="mx-auto flex max-w-md gap-2.5">
          <a href="#/menu" className="zlate-tlacidlo flex-1 rounded-full py-3.5 text-center text-[1.05rem] font-black uppercase tracking-wide">
            Objednať online
          </a>
          <a
            href={tel(nastavenia.telefon_objednavky)}
            className="flex items-center gap-2 rounded-full border border-zlata/70 bg-black/40 px-4 text-sm font-bold text-zlata-sv"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
            </svg>
            Zavolať
          </a>
        </div>
      </div>
    </div>
  )
}

export function Nadpis({ zlaty, pismo }: { zlaty: string; pismo?: string }) {
  return (
    <div className="mx-auto mb-4 flex max-w-md items-end gap-3">
      <h2 className="flex shrink-0 items-baseline gap-2">
        <span className="zlato text-[1.7rem] font-black uppercase leading-none">{zlaty}</span>
        {pismo && <span className="font-script text-[1.9rem] leading-none text-white">{pismo}</span>}
      </h2>
      <div className="ciara-zlata mb-1.5 flex-1" />
    </div>
  )
}
