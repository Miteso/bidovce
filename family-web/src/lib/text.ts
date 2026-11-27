// Popis položiek pre zákazníka a text objednávky vo formáte, ktorý dnes tlačí kuchyňa.
import { eur, spocitaj } from './cena'
import type { Dorucenie, Vypocet } from './cena'
import type { Menu, Obce, Polozka, Riadok } from './typy'

export const bezDiakritiky = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Suroviny bez gramáže: „šunka 30 g" → „šunka" */
export const cistaSurovina = (z: string) => z.replace(/\s*\d+\s*(g|ml|ks)$/, '').replace(/^\d+\s*ks\s*/, '')

/** Čo sa nedá „ubrať" (hlavná zložka, alebo sa rieši inou voľbou). */
const NEDA_SA_UBRAT = /hranolky|dresing|^omáčka$|stripsy|tortilla|^palacinky$|krídelká|žemľa|druhy pizze|^olej$|^soľ$|^korenie$|základ/

export function suroviny(p: Polozka, druha?: Polozka | null): string[] {
  const von: string[] = []
  for (const z of [...(p.zlozenie ?? []), ...(druha?.zlozenie ?? [])]) {
    const c = cistaSurovina(z)
    if (!NEDA_SA_UBRAT.test(c) && !von.includes(c)) von.push(c)
  }
  return von
}

/** 2. pád surovín pre „bez …" (ako to píše kuchyňa). Čo tu nie je, ostane v základnom tvare. */
const GENITIV: Record<string, string> = {
  'paradajková omáčka': 'paradajkovej omáčky', syr: 'syra', šunka: 'šunky', kukurica: 'kukurice', saláma: 'salámy',
  '4 druhy syra': '4 druhov syra', paradajky: 'paradajok', ananás: 'ananásu', paradajka: 'paradajky', paprika: 'papriky',
  šampiňóny: 'šampiňónov', 'bolognese zmes': 'bolognese zmesi', olivy: 'olív', 'kuracie mäso': 'kuracieho mäsa',
  brokolica: 'brokolice', feferóny: 'feferónov', slanina: 'slaniny', klobása: 'klobásy', cibuľa: 'cibule',
  bryndza: 'bryndze', 'údený syr': 'údeného syra', 'BBQ omáčka': 'BBQ omáčky', niva: 'nivy',
  '100% hovädzie mäso': 'hovädzieho mäsa', cheddar: 'cheddaru', 'nakladaná cibuľka': 'nakladanej cibuľky',
  'kyslé uhorky': 'kyslých uhoriek', šalát: 'šalátu', 'slaninový džem': 'slaninového džemu',
  'pečená slanina': 'pečenej slaniny', 'brusnicový džem': 'brusnicového džemu',
  'vyprážaný syr v panko strúhanke': 'vyprážaného syra', 'kyslá uhorka': 'kyslej uhorky', zelenina: 'zeleniny',
  'mleté mäso': 'mletého mäsa', fazuľka: 'fazuľky', parmezán: 'parmezánu', slaninka: 'slaninky', krutóny: 'krutónov',
  Nutella: 'Nutelly', šľahačka: 'šľahačky', topping: 'toppingu', 'práškový cukor': 'práškového cukru',
  'pistáciový krém': 'pistáciového krému', 'čokoládový krém': 'čokoládového krému', 'opražené kataifi': 'opraženého kataifi',
  'čokoládová poleva': 'čokoládovej polevy', 'sekané pistácie': 'sekaných pistácií', 'lyofilizované ovocie': 'lyofilizovaného ovocia',
  'vanilkovo-tvarohový krém': 'vanilkovo-tvarohového krému', 'drvené sušienky Lotus': 'drvených sušienok Lotus',
  'Lotus krém': 'Lotus krému', 'ovocný topping': 'ovocného toppingu',
}
export const bezCoho = (s: string) => GENITIV[s] ?? s

/** „cesnaková" → „cesnakový" (dip je mužského rodu) */
const dipTvar = (druh: string) => druh.replace(/á$/, 'ý').replace(/ska$/, 'sky')

const VELKOST = { mala: 'malá', velka: 'veľká' } as const

function najdi(menu: Menu, id: string): Polozka {
  const p = menu.polozky.find((x) => x.id === id)
  if (!p) throw new Error(`Neznáme jedlo: ${id}`)
  return p
}

/** Názov a úpravy riadku pre zákazníka (s diakritikou). */
export function popisRiadku(menu: Menu, r: Riadok): { nazov: string; upravy: string[] } {
  const p = najdi(menu, r.id)
  const upravy: string[] = []
  let nazov = p.nazov
  if (p.kat === 'pizza') {
    if (r.pol_na_pol) nazov = `Pol na pol ${p.nazov} / ${najdi(menu, r.pol_na_pol).nazov}`
    nazov += ` ${VELKOST[r.velkost ?? 'mala']}`
  } else if (p.kat === 'burgre') {
    if (r.menu) {
      nazov += ' – menu'
      if (r.dip) upravy.push(`dip: ${r.dip}`)
      upravy.push(r.zamena_hranoliek ? `hranolky: ${r.zamena_hranoliek.toLowerCase()}` : 'hranolky 150 g')
    }
  } else if (p.kat === 'omacky') {
    if (r.druh) nazov = `Omáčka ${r.druh}`
  } else {
    if (p.varianty) nazov += ` ${p.varianty[r.variant ?? 0].gramaz}`
    if (r.omacka) upravy.push(`omáčka: ${r.omacka}`)
    if (p.ma_hranolky && r.zamena_hranoliek) upravy.push(`hranolky: ${r.zamena_hranoliek.toLowerCase()}`)
    if (r.syr_navyse) upravy.push('+ syr navyše')
  }
  for (const n of r.navyse ?? []) {
    const cast = n.cast === 'polovica1' ? ' (1. polovica)' : n.cast === 'polovica2' ? ' (2. polovica)' : ''
    upravy.push(`+ ${n.nazov.toLowerCase()}${cast}`)
  }
  for (const b of r.bez ?? []) upravy.push(`bez ${bezCoho(b)}`)
  if (r.poznamka) upravy.push(`„${r.poznamka}"`)
  return { nazov, upravy }
}

const sumaText = (x: number) => x.toFixed(2).replace('.', ',') + ' EUR'
const ascii = (s: string) => bezDiakritiky(s)

/**
 * Text objednávky presne vo formáte dnešného systému: bez diakritiky, cena za 1 kus,
 * úpravy a balné odsadené pod položkou.
 */
export function naTextSystemu(menu: Menu, v: Vypocet): string {
  const riadky: string[] = []
  for (const x of v.riadky) {
    const { riadok: r, polozka: p } = x
    const meno = (q: Polozka) => q.alias_system ?? q.nazov
    let nazov = meno(p)
    if (p.kat === 'pizza') {
      if (r.pol_na_pol) nazov = `Pol na pol ${meno(p)} / ${meno(najdi(menu, r.pol_na_pol))}`
      nazov += ` ${r.velkost ?? 'mala'}`
    } else if (p.kat === 'burgre') {
      if (r.menu) nazov += ` menu${r.dip ? ` (dip ${dipTvar(r.dip)})` : ''}`
    } else if (p.kat === 'omacky') {
      if (r.druh) nazov += ` ${r.druh}`
    } else {
      if (p.varianty) nazov += ` ${p.varianty[r.variant ?? 0].gramaz}`
      if (r.omacka) nazov += ` (omacka ${r.omacka})`
    }
    riadky.push(`${r.pocet}x ${ascii(nazov)} - ${sumaText(x.zaklad)}`)
    for (const b of r.bez ?? []) riadky.push(`  - bez ${ascii(bezCoho(b))}`)
    for (const q of x.priplatky) riadky.push(`  + ${ascii(q.nazov).toLowerCase()} - ${sumaText(q.cena)}`)
    if (r.poznamka) riadky.push(`  * ${ascii(r.poznamka)}`)
    riadky.push(`  + ${ascii(x.balne_nazov).toLowerCase()} - ${sumaText(x.balne_ks)}`)
  }
  for (const a of v.akcie) {
    if (a.typ === '2+napoj') riadky.push('1x Napoj podla ponuky ZDARMA (akcia 2 pizze + napoj) - 0,00 EUR')
    else riadky.push(`Akcia 3+1: najlacnejsia pizza ZDARMA - ${sumaText(a.suma)}`)
  }
  return riadky.join('\n')
}

export interface Kontakt {
  sposob: 'ROZVOZ' | 'ODBER'
  obec: string | null
  ulica: string
  cislo: string
  poznamka: string
  meno: string
  telefon: string
  /** „HH:MM" alebo null = čo najskôr */
  na_cas: string | null
  platba: string
}

/** 0901 234 567 / +421 901 234 567 → 0901234567; neplatné číslo → null */
export function normalizujTelefon(t: string): string | null {
  const c = t.replace(/[\s\-/().]/g, '').replace(/^(\+421|00421)/, '0')
  return /^09\d{8}$/.test(c) ? c : null
}

/** Číslo domu: 5, 12A, 821/41 */
export const platneCisloDomu = (c: string) => /^\d{1,5}[a-zA-Z]?(\/\d{1,5}[a-zA-Z]?)?$/.test(c.trim())

/** „Karta pri prevzatí" → „KARTA", „Stravné lístky" → „STRAVNE LISTKY" */
export function platbaSystem(p: string): string {
  const s = bezDiakritiky(p).toUpperCase()
  return s.startsWith('KARTA') ? 'KARTA' : s
}

export function adresaText(k: Kontakt): string {
  if (k.sposob === 'ODBER') return 'Osobný odber'
  const zvysok = [k.ulica.trim(), k.cislo.trim()].filter(Boolean).join(' ')
  return [k.obec, zvysok].filter(Boolean).join(', ')
}

/** Objednávka v tvare, ktorý sa neskôr pošle na server (časť 7 zadania). */
export function zostavObjednavku(menu: Menu, obce: Obce, kosik: Riadok[], k: Kontakt) {
  const dorucenie: Dorucenie = { sposob: k.sposob, obec: k.obec }
  const v = spocitaj(menu, obce, kosik, dorucenie)
  return {
    zdroj: 'web',
    sposob: k.sposob,
    obec: k.sposob === 'ROZVOZ' ? k.obec : null,
    adresa: adresaText(k),
    meno: k.meno.trim(),
    telefon: normalizujTelefon(k.telefon) ?? k.telefon,
    platba: platbaSystem(k.platba),
    na_cas: k.na_cas,
    poznamka: k.poznamka.trim(),
    polozky: v.riadky.map(({ riadok, cena_ks }) => {
      const { uid: _uid, ...zvysok } = riadok
      return { ...zvysok, cena_ks }
    }),
    polozky_text: naTextSystemu(menu, v),
    suma_jedlo: v.suma_jedlo,
    doprava: v.doprava,
    suma: v.suma,
  }
}

export type Objednavka = ReturnType<typeof zostavObjednavku>
export { eur }
