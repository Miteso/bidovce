import { describe, expect, it } from 'vitest'
import menuJson from '../data/menu.json'
import obceJson from '../data/obce.json'
import { cenaKs, eur, spocitaj } from './cena'
import type { Menu, Obce, Riadok } from './typy'

const menu = menuJson as unknown as Menu
const obce = obceJson as unknown as Obce

let n = 0
const r = (id: string, extra: Partial<Riadok> = {}): Riadok => ({ uid: String(++n), id, pocet: 1, ...extra })
const odber = { sposob: 'ODBER' as const }
const rozvoz = (obec: string) => ({ sposob: 'ROZVOZ' as const, obec })

describe('Kontrolné príklady zo zadania (časť 5)', () => {
  it('1 – Šunková malá, rozvoz Sečovce = 9,50 €', () => {
    const v = spocitaj(menu, obce, [r('sunkova', { velkost: 'mala' })], rozvoz('Sečovce'))
    expect(v.medzisucet).toBe(8.0)
    expect(v.balne).toBe(0.5)
    expect(v.doprava).toBe(1.0)
    expect(v.akcie).toEqual([])
    expect(v.suma).toBe(9.5)
  })

  it('2 – 2× Šunková malá, rozvoz Sečovce = 18,00 € + nápoj zadarmo', () => {
    const v = spocitaj(menu, obce, [r('sunkova', { velkost: 'mala', pocet: 2 })], rozvoz('Sečovce'))
    expect(v.medzisucet).toBe(16.0)
    expect(v.balne).toBe(1.0)
    expect(v.akcie).toEqual([{ typ: '2+napoj', text: 'Nápoj podľa ponuky ZADARMO', suma: 0 }])
    expect(v.doprava).toBe(1.0)
    expect(v.suma).toBe(18.0)
  })

  it('3 – 4 pizze, odber = 39,40 € (Šunková zadarmo, krabice sa platia)', () => {
    const v = spocitaj(
      menu,
      obce,
      [
        r('sunkova', { velkost: 'mala' }),
        r('special', { velkost: 'mala' }),
        r('calzone', { velkost: 'mala', bez: ['šampiňóny'] }),
        r('gazdovska', { velkost: 'velka' }),
      ],
      odber,
    )
    expect(v.medzisucet).toBe(44.9)
    expect(v.zlava).toBe(8.0)
    expect(v.akcie).toEqual([{ typ: '3+1', text: 'Najlacnejšia pizza ZADARMO', suma: -8.0 }])
    expect(v.balne).toBe(2.5)
    expect(v.doprava).toBe(0)
    expect(v.suma).toBe(39.4)
  })

  it('4 – Pol na pol Brokolicová / Special malá, rozvoz Sečovce = 10,90 €', () => {
    const v = spocitaj(menu, obce, [r('brokolicova', { velkost: 'mala', pol_na_pol: 'special' })], rozvoz('Sečovce'))
    expect(v.medzisucet).toBe(9.4)
    expect(v.balne).toBe(0.5)
    expect(v.suma).toBe(10.9)
    expect(v.pocet_pizz).toBe(1)
  })

  it('5 – Salámová malá + feferóny na polovicu, odber = 9,30 €', () => {
    const v = spocitaj(
      menu,
      obce,
      [r('salamova', { velkost: 'mala', navyse: [{ nazov: 'Feferóny', cast: 'polovica1' }] })],
      odber,
    )
    expect(v.medzisucet).toBe(8.8)
    expect(v.balne).toBe(0.5)
    expect(v.suma).toBe(9.3)
  })

  it('6 – Royal BBQ Smash menu, hranolky za batátové, odber = 10,20 €', () => {
    const v = spocitaj(
      menu,
      obce,
      [r('royal-bbq', { menu: true, dip: 'cesnaková', zamena_hranoliek: 'Batátové hranolky' })],
      odber,
    )
    expect(v.riadky[0].zaklad).toBe(8.7)
    expect(v.riadky[0].cena_ks).toBe(9.7)
    expect(v.balne).toBe(0.5)
    expect(v.suma).toBe(10.2)
  })

  it('7 – Kuracie stripsy (dresing za kečup) + batátové, odber = 10,00 €', () => {
    const v = spocitaj(
      menu,
      obce,
      [r('kuracie-stripsy', { omacka: 'kečup', zamena_hranoliek: 'Batátové hranolky' })],
      odber,
    )
    expect(v.medzisucet).toBe(9.5)
    expect(v.balne).toBe(0.5)
    expect(v.suma).toBe(10.0)
  })

  it('8 – Batátové hranolky + syr, odber = 5,50 €', () => {
    const v = spocitaj(menu, obce, [r('batatove-hranolky', { syr_navyse: true })], odber)
    expect(v.medzisucet).toBe(5.0)
    expect(v.balne).toBe(0.5)
    expect(v.suma).toBe(5.5)
  })

  it('9 – Kečup samostatne, odber = 1,80 €', () => {
    const v = spocitaj(menu, obce, [r('omacka', { druh: 'kečup' })], odber)
    expect(v.medzisucet).toBe(1.5)
    expect(v.balne).toBe(0.3)
    expect(v.suma).toBe(1.8)
  })

  it('10 – 4× Šunková malá, rozvoz Trebišov: 26,00 € < 30 € → zablokované, chýba 4,00 €', () => {
    const v = spocitaj(menu, obce, [r('sunkova', { velkost: 'mala', pocet: 4 })], rozvoz('Trebišov'))
    expect(v.suma_jedlo).toBe(26.0)
    expect(v.minimum).toBe(30)
    expect(v.chyba_do_minima).toBe(4.0)
    expect(v.da_sa_odoslat).toBe(false)
  })
})

describe('Ďalšie pravidlá', () => {
  it('bez veľkosti = malá; „bez ingrediencie" cenu nemení', () => {
    expect(cenaKs(menu, r('calzone', { bez: ['šampiňóny', 'olivy'] }))).toBe(8.5)
  })

  it('pri 3 pizzách je nápoj, pri 4 už nie', () => {
    const tri = spocitaj(menu, obce, [r('sunkova', { pocet: 3 })], odber)
    expect(tri.akcie.map((a) => a.typ)).toEqual(['2+napoj'])
    const styri = spocitaj(menu, obce, [r('sunkova', { pocet: 4 })], odber)
    expect(styri.akcie.map((a) => a.typ)).toEqual(['3+1'])
  })

  it('zadarmo je najlacnejšia podľa základnej ceny – prílohy navyše sa platia', () => {
    const v = spocitaj(
      menu,
      obce,
      [r('margherita', { navyse: [{ nazov: 'Šunka' }, { nazov: 'Niva' }] }), r('special', { pocet: 3 })],
      odber,
    )
    expect(v.zlava).toBe(7.5)
    expect(v.suma).toBe(7.5 + 1.5 + 1.8 + 3 * 9.4 - 7.5 + 4 * 0.5)
  })

  it('8 pizz = 2 najlacnejšie zadarmo', () => {
    const v = spocitaj(menu, obce, [r('sunkova', { pocet: 2 }), r('special', { pocet: 6 })], odber)
    expect(v.zlava).toBe(16)
  })

  it('pol na pol sa počíta ako 1 pizza za cenu drahšej polovice (aj veľká)', () => {
    expect(cenaKs(menu, r('special', { velkost: 'velka', pol_na_pol: 'margherita' }))).toBe(19.8)
  })

  it('burger navyše a dip v menu', () => {
    expect(cenaKs(menu, r('family-signature', { navyse: [{ nazov: 'Extra slanina' }] }))).toBe(7.4)
    expect(cenaKs(menu, r('family-signature', { menu: true, dip: 'BBQ' }))).toBe(8.0)
  })

  it('hranolky 250 g, osobný odber je bez dopravy, rozvoz bez minima sa dá odoslať', () => {
    const v = spocitaj(menu, obce, [r('hranolky', { variant: 1 })], odber)
    expect(v.suma).toBe(3.5)
    const d = spocitaj(menu, obce, [r('hranolky', { variant: 1 })], rozvoz('Horovce'))
    expect(d.doprava).toBe(3.5)
    expect(d.da_sa_odoslat).toBe(true)
  })

  it('Tušice – odovzdanie v Horovciach, doprava 3,50 €', () => {
    const v = spocitaj(menu, obce, [r('sunkova')], rozvoz('Tušice'))
    expect(v.doprava).toBe(3.5)
  })

  it('formát meny', () => {
    expect(eur(8.5)).toBe('8,50 €')
  })
})
