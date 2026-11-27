// Typy údajov (menu.json, obce.json, nastavenia.json) a košíka.

export type Velkost = 'mala' | 'velka'
export type KatId = 'pizza' | 'burgre' | 'snacky' | 'kridelka' | 'palacinky' | 'prilohy' | 'omacky'

export interface Polozka {
  id: string
  kat: KatId
  nazov: string
  alias_system?: string
  zlozenie?: string[]
  popis?: string
  gramaz?: string
  alergeny?: number[]
  odporucame?: boolean
  vypredane?: boolean
  cena?: number
  cena_mala?: number
  cena_velka?: number
  cena_menu?: number
  varianty?: { gramaz: string; cena: number }[]
  syr_navyse?: number
  druhy?: string[]
  ma_hranolky?: boolean
  ma_dresing?: boolean
}

export interface Priplatok {
  nazov: string
  cena: number
}

export interface Menu {
  mena: string
  alergeny_legenda: Record<string, string>
  kategorie: { id: KatId; nazov: string; popis?: string }[]
  polozky: Polozka[]
  prilohy_na_pizzu: Priplatok[]
  burger_navyse: Priplatok[]
  zamena_hranoliek: Priplatok[]
  balne: {
    krabica_mala: number
    krabica_velka: number
    balenie_burger: number
    balenie_jedal: number
    balenie_omacky: number
  }
}

export interface Obec {
  nazov: string
  doprava: number
  min_objednavka: number | null
  povinna_ulica: boolean
}

export interface Obce {
  obce: Obec[]
  casti_secoviec_bez_cisla: string[]
  specialne: { nazov: string; doprava: number; poznamka: string }[]
  nerozvazame: string[]
  ulice: Record<string, string[]>
}

export type Den = 'po' | 'ut' | 'st' | 'stv' | 'pi' | 'so' | 'ne'

export interface Nastavenia {
  nazov: string
  mesto: string
  adresa: string
  telefon_objednavky: string
  telefony: string[]
  otvaracie_hodiny: Record<Den, [string, string] | null>
  platby: string[]
  odhad_minuty: {
    odber: [number, number]
    rozvoz_secovce: [number, number]
    rozvoz_doprava_do_2_50: [number, number]
    rozvoz_doprava_od_3_00: [number, number]
  }
  demo: boolean
}

/** Na ktorú časť pizze ide príloha navyše. Cena je vždy plná. */
export type CastPizze = 'cela' | 'polovica1' | 'polovica2'

export interface Navyse {
  nazov: string
  cast?: CastPizze
}

/** Jeden riadok košíka – jedlo s úpravami. */
export interface Riadok {
  uid: string
  id: string
  pocet: number
  poznamka?: string
  // pizza
  velkost?: Velkost
  /** id druhej polovice (pol na pol) */
  pol_na_pol?: string | null
  bez?: string[]
  navyse?: Navyse[]
  // burger
  menu?: boolean
  dip?: string | null
  // burger menu, stripsy, toasty, wrapy, krídelká
  zamena_hranoliek?: string | null
  /** vymenený dresing za inú omáčku (zadarmo) */
  omacka?: string | null
  // prílohy
  variant?: number
  syr_navyse?: boolean
  // omáčka samostatne
  druh?: string
}

export type Sposob = 'ROZVOZ' | 'ODBER'
