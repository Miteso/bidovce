import type { Polozka } from '../lib/typy'
import pizza from '../assets/pizza-mala.webp'
import burger from '../assets/burger-maly.webp'
import batatove from '../assets/batatove.webp'

/** Vlastné fotky jedál: src/assets/jedla/<id>.webp (pripraví ich „npm run fotky"). Majú prednosť pred všetkým ostatným. */
const VLASTNE = Object.fromEntries(
  Object.entries(import.meta.glob('../assets/jedla/*.webp', { eager: true, query: '?url', import: 'default' })).map(([cesta, url]) => [
    cesta.split('/').pop()!.replace('.webp', ''),
    url as string,
  ]),
)

/** Fotky, ktoré máme z jedálneho lístka. Ostatné jedlá dostanú zástupný obrázok v štýle webu. */
const FOTKY: Record<string, string> = { 'royal-bbq': burger, 'batatove-hranolky': batatove }

const IKONY: Record<string, React.ReactNode> = {
  burgre: (
    <>
      <path d="M14 30c0-9 8-15 18-15s18 6 18 15z" />
      <path d="M12 36h40M14 42c4-3 6 3 10 0s6 3 10 0 6 3 10 0 4 1 6 0" />
      <path d="M14 47h36v2a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6z" />
      <path d="M26 22h.01M33 20h.01M39 23h.01" />
    </>
  ),
  snacky: (
    <>
      <path d="M20 52 30 14c6-4 14-2 18 4L34 54c-5 2-10 1-14-2z" />
      <path d="M30 14c2 6 9 9 18 4M27 26c3 3 8 5 14 4M24 38c3 3 7 4 12 4" />
    </>
  ),
  kridelka: (
    <>
      <path d="M40 14c8 2 12 12 6 20-5 7-14 8-19 5l-7 9" />
      <path d="M40 14c-8-2-17 4-18 13-.5 5 2 9 5 12" />
      <path d="M20 48c-3-1-6 1-6 4s3 4 5 3c0 3 3 5 6 3s2-6-1-7" />
    </>
  ),
  palacinky: (
    <>
      <ellipse cx="32" cy="24" rx="19" ry="7" />
      <path d="M13 24v7c0 4 8 7 19 7s19-3 19-7v-7M13 31v7c0 4 8 7 19 7s19-3 19-7v-7" />
      <path d="M26 22c2-3 8-4 11-1 2 2 0 5-4 5-3 0-4-2-2-3" />
    </>
  ),
  prilohy: (
    <>
      <path d="M18 30h28l-4 24H22z" />
      <path d="M22 30 20 14l5 1 1 15M29 30l-1-20h5l1 20M37 30l2-18 5 1-3 17" />
    </>
  ),
  omacky: (
    <>
      <path d="M16 26h32l-4 24a4 4 0 0 1-4 3H24a4 4 0 0 1-4-3z" />
      <ellipse cx="32" cy="26" rx="16" ry="5" />
      <path d="M40 22 50 10" />
    </>
  ),
}

export function Obrazok({ p, index = 0, velkost = 84 }: { p: Polozka; index?: number; velkost?: number }) {
  const styl = { width: velkost, height: velkost }
  const vlastna = VLASTNE[p.id]
  if (vlastna) {
    return (
      <img
        src={vlastna}
        alt=""
        loading="lazy"
        decoding="async"
        width={velkost}
        height={velkost}
        className="shrink-0 rounded-full object-cover ring-1 ring-zlata/40 drop-shadow-[0_6px_8px_rgba(0,0,0,0.55)]"
        style={styl}
      />
    )
  }
  if (p.kat === 'pizza') {
    return (
      <img
        src={pizza}
        alt=""
        loading="lazy"
        decoding="async"
        width={velkost}
        height={velkost}
        className="shrink-0 rounded-full drop-shadow-[0_6px_8px_rgba(0,0,0,0.55)]"
        style={{ ...styl, transform: `rotate(${(index * 47) % 360}deg)` }}
      />
    )
  }
  const foto = FOTKY[p.id]
  if (foto) {
    return (
      <img
        src={foto}
        alt=""
        loading="lazy"
        decoding="async"
        width={velkost}
        height={velkost}
        className={`shrink-0 ${p.kat === 'burgre' ? 'object-contain drop-shadow-[0_6px_8px_rgba(0,0,0,0.55)]' : 'rounded-full object-cover ring-1 ring-zlata/40'}`}
        style={styl}
      />
    )
  }
  return (
    <div
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full ring-1 ring-zlata/45"
      style={{ ...styl, background: 'radial-gradient(circle at 35% 30%, #3a3a3a, #191919 75%)' }}
    >
      <svg viewBox="0 0 64 64" width={velkost * 0.74} height={velkost * 0.74} fill="none" stroke="url(#zl)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id="zl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f3dc8f" />
            <stop offset="1" stopColor="#b8862e" />
          </linearGradient>
        </defs>
        {IKONY[p.kat]}
      </svg>
    </div>
  )
}
