// Pripraví fotky jedál: fotky/<id>.(jpg|png|webp) → src/assets/jedla/<id>.webp (štvorec 480 px).
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, extname, basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const tu = dirname(fileURLToPath(import.meta.url))
const vstup = resolve(tu, process.argv[2] ?? '../fotky')
const vystup = resolve(tu, process.argv[3] ?? '../src/assets/jedla')
const menu = JSON.parse(readFileSync(resolve(tu, '../src/data/menu.json'), 'utf8'))
const idcka = new Set(menu.polozky.map((p) => p.id))

mkdirSync(vystup, { recursive: true })
let pocet = 0
for (const subor of existsSync(vstup) ? readdirSync(vstup) : []) {
  const pripona = extname(subor).toLowerCase()
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(pripona)) continue
  const id = basename(subor, extname(subor))
  if (!idcka.has(id)) {
    console.warn(`! ${subor}: jedlo s id „${id}" v menu.json nie je – preskakujem`)
    continue
  }
  await sharp(resolve(vstup, subor))
    .rotate()
    .resize(480, 480, { fit: 'cover', position: 'centre' })
    .webp({ quality: 80 })
    .toFile(resolve(vystup, `${id}.webp`))
  console.log(`✓ ${id}`)
  pocet++
}
const hotove = new Set(readdirSync(vystup).filter((s) => s.endsWith('.webp')).map((s) => basename(s, '.webp')))
const chyba = [...idcka].filter((id) => !hotove.has(id))
console.log(`\nSpracované: ${pocet}. S vlastnou fotkou: ${hotove.size} z ${idcka.size}.`)
if (chyba.length) console.log(`Bez fotky: ${chyba.join(', ')}`)
