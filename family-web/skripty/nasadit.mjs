// Skopíruje zostavený web (dist/) do priečinka family/ v koreni repozitára,
// odkiaľ ho GitHub Pages zverejní na https://miteso.github.io/bidovce/family/
import { cpSync, existsSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const tu = dirname(fileURLToPath(import.meta.url))
const dist = resolve(tu, '../dist')
const ciel = resolve(tu, '../../family')

if (!existsSync(resolve(dist, 'index.html'))) {
  console.error('Chýba dist/index.html – najprv spustite „npm run build".')
  process.exit(1)
}
rmSync(ciel, { recursive: true, force: true })
cpSync(dist, ciel, { recursive: true })
console.log(`Hotovo: ${ciel}`)
