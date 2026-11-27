// Odhad času slovami po štvrťhodinách – rovnako ako telefonický agent.
import type { Nastavenia, Obec, Sposob } from './typy'
import type { Stav } from './otvaracie'
import { naCas } from './otvaracie'

const SLOVA: Record<number, string> = {
  30: 'pol hodiny',
  45: 'trištvrte hodiny',
  60: 'hodinu',
  75: 'hodinu a štvrť',
  90: 'hodinu a pol',
  105: 'hodinu a trištvrte',
  120: 'dve hodiny',
}

/** Najbližší násobok 15 minút, nikdy menej ako pol hodiny, najviac dve hodiny. */
const naStvrt = (min: number) => Math.min(120, Math.max(30, Math.round(min / 15) * 15))

export function odhadMinuty(n: Nastavenia, sposob: Sposob, obec?: Obec | null): [number, number] {
  const o = n.odhad_minuty
  if (sposob === 'ODBER' || !obec) return o.odber
  if (obec.nazov === n.mesto) return o.rozvoz_secovce
  return obec.doprava <= 2.5 ? o.rozvoz_doprava_do_2_50 : o.rozvoz_doprava_od_3_00
}

/** [0,30] → „zhruba do pol hodiny"; [45,60] → „približne o trištvrte hodiny až hodinu" */
export function casSlovami([od, po]: [number, number]): string {
  if (po <= 30) return 'zhruba do pol hodiny'
  const a = naStvrt(od)
  const b = naStvrt(po)
  if (a === b) return `približne o ${SLOVA[a]}`
  return `približne o ${SLOVA[a]} až ${SLOVA[b]}`
}

/** Veta pre zákazníka na potvrdení. */
export function vetaOdhadu(n: Nastavenia, sposob: Sposob, obec: Obec | null | undefined, naCasHHMM: string | null): string {
  if (sposob === 'ODBER') return naCasHHMM ? `Objednávka bude pripravená na ${naCasHHMM}` : 'Objednávka bude pripravená do pol hodiny'
  if (naCasHHMM) return `Doručíme vám ju približne o ${naCasHHMM}`
  return `U vás bude ${casSlovami(odhadMinuty(n, sposob, obec))}`
}

/** Časy „Na čas": dnes, v otváracích hodinách, po 15 minútach, najskôr o dolný odhad (min. pol hodiny). */
export function casyNaDnes(stav: Stav, odhad: [number, number]): string[] {
  if (!stav.dnes) return []
  const [otv, zav] = stav.dnes
  const priprava = Math.max(30, odhad[0])
  const prvy = Math.ceil((Math.max(stav.minuty, otv) + priprava) / 15) * 15
  const von: string[] = []
  for (let m = prvy; m <= zav; m += 15) von.push(naCas(m))
  return von
}
