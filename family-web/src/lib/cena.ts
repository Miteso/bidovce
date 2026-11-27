// Výpočet ceny objednávky – čisté funkcie, žiadny stav, žiadne ceny natvrdo.
// Všetky sumy sa interne počítajú v centoch (celé čísla), aby sedeli na cent.

import type { Menu, Navyse, Obce, Obec, Polozka, Riadok, Sposob } from './typy'

export const naCenty = (eur: number) => Math.round(eur * 100)
export const naEura = (centy: number) => Math.round(centy) / 100

/** 8.5 → „8,50 €" */
export function eur(suma: number): string {
  return suma.toFixed(2).replace('.', ',') + ' €'
}

export interface RozpisBalneho {
  nazov: string
  pocet: number
  cena: number
  spolu: number
}

export interface Akcia {
  typ: '3+1' | '2+napoj'
  text: string
  /** záporná suma zľavy (alebo 0 pri nápoji) */
  suma: number
}

export interface RiadokVypocet {
  riadok: Riadok
  polozka: Polozka
  /** základná cena 1 ks bez príplatkov */
  zaklad: number
  /** príplatky na 1 ks (prílohy navyše, zámena hranoliek, syr…) */
  priplatky: { nazov: string; cena: number }[]
  /** cena 1 ks vrátane príplatkov, bez balného */
  cena_ks: number
  spolu: number
  balne_ks: number
  balne_nazov: string
  je_pizza: boolean
}

export interface Vypocet {
  riadky: RiadokVypocet[]
  pocet_kusov: number
  pocet_pizz: number
  /** jedlá pred akciami, bez balného */
  medzisucet: number
  balne: number
  balne_rozpis: RozpisBalneho[]
  akcie: Akcia[]
  zlava: number
  /** jedlá + balné po akciách, bez dopravy */
  suma_jedlo: number
  doprava: number
  suma: number
  minimum: number | null
  chyba_do_minima: number
  da_sa_odoslat: boolean
}

export interface Dorucenie {
  sposob: Sposob
  /** názov obce (pri rozvoze) */
  obec?: string | null
}

function najdi(menu: Menu, id: string): Polozka {
  const p = menu.polozky.find((x) => x.id === id)
  if (!p) throw new Error(`Neznáme jedlo: ${id}`)
  return p
}

function cenaPizze(p: Polozka, velkost: 'mala' | 'velka'): number {
  return naCenty(velkost === 'velka' ? p.cena_velka! : p.cena_mala!)
}

function cenaPriplatku(zoznam: { nazov: string; cena: number }[], nazov: string): number {
  const x = zoznam.find((z) => z.nazov === nazov)
  if (!x) throw new Error(`Neznámy príplatok: ${nazov}`)
  return naCenty(x.cena)
}

const popisCasti = (n: Navyse) => (n.cast && n.cast !== 'cela' ? ' na polovicu' : '')

/** Výpočet jedného riadku (v centoch). */
function riadokCenty(menu: Menu, r: Riadok) {
  const p = najdi(menu, r.id)
  const priplatky: { nazov: string; cena: number }[] = []
  let zaklad = 0
  let balne = naCenty(menu.balne.balenie_jedal)
  let balne_nazov = 'Balenie jedál'

  if (p.kat === 'pizza') {
    const v = r.velkost ?? 'mala'
    zaklad = cenaPizze(p, v)
    if (r.pol_na_pol) {
      // pol na pol = jedna pizza za cenu drahšej polovice
      zaklad = Math.max(zaklad, cenaPizze(najdi(menu, r.pol_na_pol), v))
    }
    for (const n of r.navyse ?? []) {
      // príloha navyše stojí vždy plnú cenu, aj na polovicu
      priplatky.push({ nazov: n.nazov + popisCasti(n), cena: cenaPriplatku(menu.prilohy_na_pizzu, n.nazov) })
    }
    balne = naCenty(v === 'velka' ? menu.balne.krabica_velka : menu.balne.krabica_mala)
    balne_nazov = v === 'velka' ? 'Krabica veľká' : 'Krabica malá'
  } else if (p.kat === 'burgre') {
    zaklad = naCenty(r.menu ? p.cena_menu! : p.cena!)
    if (r.menu && r.zamena_hranoliek) {
      priplatky.push({ nazov: r.zamena_hranoliek, cena: cenaPriplatku(menu.zamena_hranoliek, r.zamena_hranoliek) })
    }
    for (const n of r.navyse ?? []) {
      priplatky.push({ nazov: n.nazov, cena: cenaPriplatku(menu.burger_navyse, n.nazov) })
    }
    balne = naCenty(menu.balne.balenie_burger)
    balne_nazov = 'Balenie burger'
  } else if (p.kat === 'omacky') {
    zaklad = naCenty(p.cena!)
    balne = naCenty(menu.balne.balenie_omacky)
    balne_nazov = 'Balenie omáčky'
  } else {
    if (p.varianty) zaklad = naCenty(p.varianty[r.variant ?? 0].cena)
    else zaklad = naCenty(p.cena!)
    if (p.ma_hranolky && r.zamena_hranoliek) {
      priplatky.push({ nazov: r.zamena_hranoliek, cena: cenaPriplatku(menu.zamena_hranoliek, r.zamena_hranoliek) })
    }
    if (p.syr_navyse != null && r.syr_navyse) {
      priplatky.push({ nazov: 'Syr navyše', cena: naCenty(p.syr_navyse) })
    }
  }

  const cena_ks = zaklad + priplatky.reduce((s, x) => s + x.cena, 0)
  return { p, zaklad, priplatky, cena_ks, balne, balne_nazov }
}

/** Cena 1 kusu vrátane príplatkov, bez balného (v eurách). */
export function cenaKs(menu: Menu, r: Riadok): number {
  return naEura(riadokCenty(menu, r).cena_ks)
}

export function najdiObec(obce: Obce, nazov?: string | null): Obec | null {
  if (!nazov) return null
  const o = obce.obce.find((x) => x.nazov === nazov)
  if (o) return o
  const s = obce.specialne.find((x) => x.nazov === nazov)
  return s ? { nazov: s.nazov, doprava: s.doprava, min_objednavka: null, povinna_ulica: false } : null
}

/** Celý výpočet košíka: jedlá, balné, akcie, doprava, minimum. */
export function spocitaj(menu: Menu, obce: Obce, kosik: Riadok[], dorucenie: Dorucenie): Vypocet {
  const riadky: RiadokVypocet[] = []
  const balneMapa = new Map<string, RozpisBalneho>()
  const zakladyPizz: number[] = []
  let medzisucet = 0
  let balne = 0
  let pocet_kusov = 0

  for (const r of kosik) {
    if (r.pocet <= 0) continue
    const x = riadokCenty(menu, r)
    const je_pizza = x.p.kat === 'pizza'
    medzisucet += x.cena_ks * r.pocet
    balne += x.balne * r.pocet
    pocet_kusov += r.pocet
    if (je_pizza) for (let i = 0; i < r.pocet; i++) zakladyPizz.push(x.zaklad)
    const b = balneMapa.get(x.balne_nazov) ?? { nazov: x.balne_nazov, pocet: 0, cena: naEura(x.balne), spolu: 0 }
    b.pocet += r.pocet
    b.spolu = naEura(naCenty(b.spolu) + x.balne * r.pocet)
    balneMapa.set(x.balne_nazov, b)
    riadky.push({
      riadok: r,
      polozka: x.p,
      zaklad: naEura(x.zaklad),
      priplatky: x.priplatky.map((q) => ({ nazov: q.nazov, cena: naEura(q.cena) })),
      cena_ks: naEura(x.cena_ks),
      spolu: naEura(x.cena_ks * r.pocet),
      balne_ks: naEura(x.balne),
      balne_nazov: x.balne_nazov,
      je_pizza,
    })
  }

  // Akcie – nekombinujú sa: pri 4+ pizzách tri plus jedna, pri 2–3 pizzách nápoj.
  const akcie: Akcia[] = []
  let zlava = 0
  const pocet_pizz = zakladyPizz.length
  const zadarmo = Math.floor(pocet_pizz / 4)
  if (zadarmo > 0) {
    // zadarmo je najlacnejšia podľa základnej ceny; prílohy navyše a krabica sa platia
    const najlacnejsie = [...zakladyPizz].sort((a, b) => a - b).slice(0, zadarmo)
    for (const z of najlacnejsie) {
      zlava += z
      akcie.push({ typ: '3+1', text: 'Najlacnejšia pizza ZADARMO', suma: -naEura(z) })
    }
  } else if (pocet_pizz >= 2) {
    akcie.push({ typ: '2+napoj', text: 'Nápoj podľa ponuky ZADARMO', suma: 0 })
  }

  const suma_jedlo = medzisucet - zlava + balne
  const obec = dorucenie.sposob === 'ROZVOZ' ? najdiObec(obce, dorucenie.obec) : null
  const doprava = obec ? naCenty(obec.doprava) : 0
  const minimum = obec?.min_objednavka != null ? naCenty(obec.min_objednavka) : null
  const chyba = minimum != null ? Math.max(0, minimum - suma_jedlo) : 0

  return {
    riadky,
    pocet_kusov,
    pocet_pizz,
    medzisucet: naEura(medzisucet),
    balne: naEura(balne),
    balne_rozpis: [...balneMapa.values()],
    akcie,
    zlava: naEura(zlava),
    suma_jedlo: naEura(suma_jedlo),
    doprava: naEura(doprava),
    suma: naEura(suma_jedlo + doprava),
    minimum: minimum != null ? naEura(minimum) : null,
    chyba_do_minima: naEura(chyba),
    da_sa_odoslat: pocet_kusov > 0 && chyba === 0,
  }
}
