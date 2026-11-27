import menuJson from '../data/menu.json'
import obceJson from '../data/obce.json'
import nastaveniaJson from '../data/nastavenia.json'
import type { Menu, Nastavenia, Obce, Polozka } from './typy'

export const menu = menuJson as unknown as Menu
export const obce = obceJson as unknown as Obce
export const nastavenia = nastaveniaJson as unknown as Nastavenia

const podlaId = new Map(menu.polozky.map((p) => [p.id, p]))
export const polozka = (id: string): Polozka | undefined => podlaId.get(id)
