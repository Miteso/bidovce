import type { Den, Nastavenia } from './typy'

const DNI: Den[] = ['ne', 'po', 'ut', 'st', 'stv', 'pi', 'so']
const SKRATKY: Record<Den, string> = { po: 'Po', ut: 'Ut', st: 'St', stv: 'Št', pi: 'Pi', so: 'So', ne: 'Ne' }
const PORADIE: Den[] = ['po', 'ut', 'st', 'stv', 'pi', 'so', 'ne']
const V_DEN: Record<Den, string> = {
  po: 'v pondelok', ut: 'v utorok', st: 'v stredu', stv: 'vo štvrtok', pi: 'v piatok', so: 'v sobotu', ne: 'v nedeľu',
}

export const naMinuty = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
export const naCas = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

/** Deň a minúty v slovenskom čase, nech je telefón nastavený akokoľvek. */
export function slovenskyCas(teraz: Date = new Date()): { den: Den; minuty: number } {
  const casti = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Bratislava', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(teraz)
  const daj = (t: string) => casti.find((c) => c.type === t)?.value ?? ''
  const idx = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(daj('weekday'))
  return { den: DNI[idx], minuty: (Number(daj('hour')) % 24) * 60 + Number(daj('minute')) }
}

export const jeDemoOtvorene = () =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'otvorene'

export interface Stav {
  otvorene: boolean
  /** krátky text do štítku */
  text: string
  /** dnešné otváracie hodiny v minútach (ak je dnes otvorené) */
  dnes: [number, number] | null
  minuty: number
}

export function stavOtvorenia(n: Nastavenia, teraz: Date = new Date(), demo = jeDemoOtvorene()): Stav {
  const { den, minuty } = slovenskyCas(teraz)
  const h = n.otvaracie_hodiny[den]
  const dnes: [number, number] | null = h ? [naMinuty(h[0]), naMinuty(h[1])] : null
  if (demo) {
    const zaver = h ? h[1] : n.otvaracie_hodiny.po![1]
    return { otvorene: true, text: `Otvorené do ${zaver}`, dnes: dnes ?? [0, 24 * 60 - 1], minuty: dnes ? Math.min(Math.max(minuty, dnes[0]), dnes[1] - 60) : minuty }
  }
  if (dnes && minuty >= dnes[0] && minuty < dnes[1]) return { otvorene: true, text: `Otvorené do ${h![1]}`, dnes, minuty }
  if (dnes && minuty < dnes[0]) return { otvorene: false, text: `Zatvorené · otvárame dnes o ${h![0]}`, dnes, minuty }
  const i = DNI.indexOf(den)
  for (let k = 1; k <= 7; k++) {
    const d = DNI[(i + k) % 7]
    const x = n.otvaracie_hodiny[d]
    if (x) return { otvorene: false, text: `Zatvorené · otvárame ${k === 1 ? 'zajtra' : V_DEN[d]} o ${x[0]}`, dnes, minuty }
  }
  return { otvorene: false, text: 'Zatvorené', dnes, minuty }
}

/** Zoskupí dni s rovnakými hodinami: [{dni: 'Po–Pi', od: '15:00', do: '21:30'}, …] */
export function skupinyHodin(n: Nastavenia): { dni: string; od: string | null; do: string | null }[] {
  const von: { dni: Den[]; od: string | null; do: string | null }[] = []
  for (const d of PORADIE) {
    const h = n.otvaracie_hodiny[d]
    const posl = von[von.length - 1]
    if (posl && posl.od === (h?.[0] ?? null) && posl.do === (h?.[1] ?? null)) posl.dni.push(d)
    else von.push({ dni: [d], od: h?.[0] ?? null, do: h?.[1] ?? null })
  }
  return von.map((s) => ({
    dni: s.dni.length > 1 ? `${SKRATKY[s.dni[0]]}–${SKRATKY[s.dni[s.dni.length - 1]]}` : SKRATKY[s.dni[0]],
    od: s.od,
    do: s.do,
  }))
}

/** „Po–Pi od 15:00, So od 12:00" */
export const kedyPrijimame = (n: Nastavenia) =>
  skupinyHodin(n).filter((s) => s.od).map((s) => `${s.dni} od ${s.od}`).join(', ')
