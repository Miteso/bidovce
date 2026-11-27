import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nastavenia } from '../lib/data'
import type { Kontakt } from '../lib/text'
import type { Riadok } from '../lib/typy'

interface Stav {
  riadky: Riadok[]
  kontakt: Kontakt
  suhlas: boolean
  pridaj: (r: Omit<Riadok, 'uid'>) => void
  uprav: (uid: string, r: Omit<Riadok, 'uid'>) => void
  zmenPocet: (uid: string, o: number) => void
  odstran: (uid: string) => void
  vyprazdni: () => void
  zmenKontakt: (k: Partial<Kontakt>) => void
  setSuhlas: (s: boolean) => void
}

const uid = () => Math.random().toString(36).slice(2, 10)

const prazdnyKontakt: Kontakt = {
  sposob: 'ROZVOZ',
  obec: null,
  ulica: '',
  cislo: '',
  poznamka: '',
  meno: '',
  telefon: '',
  na_cas: null,
  platba: nastavenia.platby[0],
}

/** Košík a údaje pokladne – jeden store, uložený v localStorage (obnovenie stránky ho nezmaže). */
export const useKosik = create<Stav>()(
  persist(
    (set) => ({
      riadky: [],
      kontakt: prazdnyKontakt,
      suhlas: false,
      pridaj: (r) => set((s) => ({ riadky: [...s.riadky, { ...r, uid: uid() }] })),
      uprav: (id, r) => set((s) => ({ riadky: s.riadky.map((x) => (x.uid === id ? { ...r, uid: id } : x)) })),
      zmenPocet: (id, o) =>
        set((s) => ({
          riadky: s.riadky.map((x) => (x.uid === id ? { ...x, pocet: x.pocet + o } : x)).filter((x) => x.pocet > 0),
        })),
      odstran: (id) => set((s) => ({ riadky: s.riadky.filter((x) => x.uid !== id) })),
      vyprazdni: () => set({ riadky: [], suhlas: false }),
      zmenKontakt: (k) => set((s) => ({ kontakt: { ...s.kontakt, ...k } })),
      setSuhlas: (suhlas) => set({ suhlas }),
    }),
    { name: 'family-kosik-v1' },
  ),
)

const KLUC = 'family-objednavky-v1'
export interface UlozenaObjednavka {
  cislo: string
  cas: number
  objednavka: import('../lib/text').Objednavka
  kontakt: Kontakt
}
export function ulozObjednavku(o: UlozenaObjednavka) {
  try {
    const vsetky: UlozenaObjednavka[] = JSON.parse(localStorage.getItem(KLUC) ?? '[]')
    localStorage.setItem(KLUC, JSON.stringify([o, ...vsetky].slice(0, 20)))
  } catch {
    /* localStorage nedostupné – ukážka funguje ďalej */
  }
}
export function nacitajObjednavku(cislo: string): UlozenaObjednavka | null {
  try {
    const vsetky: UlozenaObjednavka[] = JSON.parse(localStorage.getItem(KLUC) ?? '[]')
    return vsetky.find((x) => x.cislo === cislo) ?? null
  } catch {
    return null
  }
}
