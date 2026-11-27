import { describe, expect, it } from 'vitest'
import menuJson from '../data/menu.json'
import obceJson from '../data/obce.json'
import nastaveniaJson from '../data/nastavenia.json'
import { casSlovami, casyNaDnes, odhadMinuty, vetaOdhadu } from './cas'
import { najdiObec } from './cena'
import { normalizujTelefon, platbaSystem, platneCisloDomu, zostavObjednavku } from './text'
import { skupinyHodin, stavOtvorenia, kedyPrijimame } from './otvaracie'
import type { Menu, Nastavenia, Obce } from './typy'

const menu = menuJson as unknown as Menu
const obce = obceJson as unknown as Obce
const n = nastaveniaJson as unknown as Nastavenia

describe('Objednávka vo formáte systému (časť 7)', () => {
  const o = zostavObjednavku(
    menu,
    obce,
    [
      { uid: 'a', id: 'calzone', velkost: 'mala', pol_na_pol: null, bez: ['šampiňóny'], navyse: [], pocet: 1 },
      { uid: 'b', id: 'royal-bbq', menu: true, dip: 'cesnaková', zamena_hranoliek: 'Batátové hranolky', pocet: 1 },
    ],
    { sposob: 'ROZVOZ', obec: 'Sečovce', ulica: 'Okružná', cislo: '5', poznamka: 'zvonček Novák, 2. poschodie', meno: 'Ján Novák', telefon: '0901 234 567', na_cas: null, platba: 'Karta pri prevzatí' },
  )
  it('text pre kuchyňu sedí so vzorom', () => {
    expect(o.polozky_text).toBe(
      '1x Calzone mala - 8,50 EUR\n  - bez sampinonov\n  + krabica mala - 0,50 EUR\n1x Royal BBQ Smash burger menu (dip cesnakovy) - 8,70 EUR\n  + batatove hranolky - 1,00 EUR\n  + balenie burger - 0,50 EUR',
    )
  })
  it('sumy a hlavička', () => {
    expect(o.suma_jedlo).toBe(19.2)
    expect(o.doprava).toBe(1)
    expect(o.suma).toBe(20.2)
    expect(o.adresa).toBe('Sečovce, Okružná 5')
    expect(o.telefon).toBe('0901234567')
    expect(o.platba).toBe('KARTA')
    expect(o.polozky[1].cena_ks).toBe(9.7)
  })
  it('nápoj v akcii, vymenený dresing, alias systému', () => {
    const x = zostavObjednavku(
      menu,
      obce,
      [
        { uid: 'a', id: 'brokolicova', pocet: 2 },
        { uid: 'b', id: 'kuracie-stripsy', omacka: 'kečup', pocet: 1 },
      ],
      { sposob: 'ODBER', obec: null, ulica: '', cislo: '', poznamka: '', meno: 'A', telefon: '+421901234567', na_cas: '18:30', platba: 'Stravné lístky' },
    )
    expect(x.polozky_text).toContain('2x Brocoli Chicken mala - 8,80 EUR')
    expect(x.polozky_text).toContain('1x Kuracie stripsy (omacka kecup) - 8,50 EUR')
    expect(x.polozky_text).toContain('1x Napoj podla ponuky ZDARMA (akcia 2 pizze + napoj) - 0,00 EUR')
    expect(x.platba).toBe('STRAVNE LISTKY')
    expect(x.telefon).toBe('0901234567')
  })
})

describe('Validácie', () => {
  it('telefón', () => {
    expect(normalizujTelefon('0901 234 567')).toBe('0901234567')
    expect(normalizujTelefon('+421 901 234 567')).toBe('0901234567')
    expect(normalizujTelefon('055 230 3166')).toBeNull()
    expect(normalizujTelefon('0901 234 56')).toBeNull()
  })
  it('číslo domu', () => {
    expect(platneCisloDomu('5')).toBe(true)
    expect(platneCisloDomu('821/41')).toBe(true)
    expect(platneCisloDomu('12A')).toBe(true)
    expect(platneCisloDomu('abc')).toBe(false)
  })
  it('platba', () => expect(platbaSystem('Hotovosť')).toBe('HOTOVOST'))
})

describe('Čas slovami', () => {
  it('po štvrťhodinách', () => {
    expect(casSlovami([0, 30])).toBe('zhruba do pol hodiny')
    expect(casSlovami([45, 60])).toBe('približne o trištvrte hodiny až hodinu')
    expect(casSlovami([60, 75])).toBe('približne o hodinu až hodinu a štvrť')
  })
  it('podľa obce', () => {
    expect(odhadMinuty(n, 'ROZVOZ', najdiObec(obce, 'Sečovce'))).toEqual([0, 30])
    expect(odhadMinuty(n, 'ROZVOZ', najdiObec(obce, 'Bačkov'))).toEqual([45, 60])
    expect(odhadMinuty(n, 'ROZVOZ', najdiObec(obce, 'Trebišov'))).toEqual([60, 75])
    expect(vetaOdhadu(n, 'ROZVOZ', najdiObec(obce, 'Horovce'), null)).toBe('U vás bude približne o hodinu až hodinu a štvrť')
    expect(vetaOdhadu(n, 'ODBER', null, null)).toBe('Objednávka bude pripravená do pol hodiny')
  })
})

describe('Otváracie hodiny', () => {
  // 27. 11. 2026 je piatok, 29. 11. nedeľa (zimný čas, UTC+1)
  it('otvorené / zatvorené', () => {
    expect(stavOtvorenia(n, new Date('2026-11-27T15:30:00Z'), false).otvorene).toBe(true)
    expect(stavOtvorenia(n, new Date('2026-11-27T12:00:00Z'), false)).toMatchObject({ otvorene: false, text: 'Zatvorené · otvárame dnes o 15:00' })
    expect(stavOtvorenia(n, new Date('2026-11-27T21:00:00Z'), false)).toMatchObject({ otvorene: false, text: 'Zatvorené · otvárame zajtra o 12:00' })
    expect(stavOtvorenia(n, new Date('2026-11-29T12:00:00Z'), false)).toMatchObject({ otvorene: false, text: 'Zatvorené · otvárame zajtra o 15:00' })
    expect(stavOtvorenia(n, new Date('2026-11-29T12:00:00Z'), true).otvorene).toBe(true)
  })
  it('texty', () => {
    expect(kedyPrijimame(n)).toBe('Po–Pi od 15:00, So od 12:00')
    expect(skupinyHodin(n)).toHaveLength(3)
  })
  it('časy na dnes po 15 minútach, najskôr o pol hodiny', () => {
    const s = stavOtvorenia(n, new Date('2026-11-27T17:05:00Z'), false) // 18:05
    const c = casyNaDnes(s, [0, 30])
    expect(c[0]).toBe('18:45')
    expect(c[c.length - 1]).toBe('21:30')
    const rano = stavOtvorenia(n, new Date('2026-11-27T09:00:00Z'), false)
    expect(casyNaDnes(rano, [45, 60])[0]).toBe('15:45')
  })
})
