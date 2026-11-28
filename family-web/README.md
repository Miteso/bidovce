# Family Restaurant & Caffe Sečovce – objednávkový web (prototyp)

Klikateľný prototyp objednávania. Beží v **ukážkovom režime**: objednávka sa nikam neodosiela,
len sa uloží v prehliadači a vypíše do konzoly.

Zverejnená verzia: https://miteso.github.io/bidovce/family/
(pre prezentáciu mimo otváracích hodín: https://miteso.github.io/bidovce/family/?demo=otvorene)

## Ako spustiť

Treba Node.js 20 alebo novší.

```bash
cd family-web
npm install
npm run dev
```

Potom otvorte adresu, ktorú príkaz vypíše (končí na `/bidovce/family/`).

| Príkaz | Čo robí |
| --- | --- |
| `npm run dev` | spustí web na počítači, zmeny sa prejavia hneď |
| `npm test` | spustí kontrolu výpočtu cien (všetkých 10 príkladov zo zadania a ďalšie) |
| `npm run build` | zostaví web do `dist/` |
| `npm run nasadit` | test + zostavenie + skopírovanie do `../family/` |

## Ako zverejniť zmenu

```bash
npm run nasadit
```

```bash
git add -A ../family . && git commit -m "Family web: zmena" && git push
```

GitHub Pages zverejní obsah priečinka `family/` z vetvy `main` do pár minút.

## Ako zmeniť ceny alebo pridať jedlo

Všetko je v troch súboroch v `src/data/`. Kód netreba meniť – stačí upraviť JSON a znova zverejniť.

### `src/data/menu.json`

- **Zmena ceny:** nájdite jedlo v zozname `polozky` a prepíšte číslo. Desatinná **bodka**, nie čiarka (`8.50`).
  - pizza: `cena_mala`, `cena_velka`
  - burger: `cena` (samostatne), `cena_menu`
  - prílohy s dvoma veľkosťami: `varianty` → `cena`
  - ostatné: `cena`
- **Nové jedlo:** skopírujte riadok podobného jedla a zmeňte:
  - `id` – jedinečné, malými písmenami bez diakritiky a medzier (napr. `tuniakova`)
  - `kat` – kategória: `pizza`, `burgre`, `snacky`, `kridelka`, `palacinky`, `prilohy`, `omacky`
  - `nazov`, `zlozenie` (z neho sa ponúka „Bez…"), `alergeny`, `gramaz`
  - `ma_hranolky: true` / `ma_dresing: true` – ak sa dajú vymeniť hranolky / dresing
- **Vypredané:** pridajte k jedlu `"vypredane": true` – zobrazí sa sivo s nápisom „Dnes vypredané".
- **Odporúčame:** `"odporucame": true` pridá štítok.
- **Prílohy na pizzu, burger navyše, zámena hranoliek, balné:** zoznamy `prilohy_na_pizzu`, `burger_navyse`,
  `zamena_hranoliek`, `balne` na konci súboru.
- **Alergény:** `alergeny_legenda`.

### `src/data/obce.json`

- `obce` – kam sa rozváža: `doprava` (cena), `min_objednavka` (suma alebo `null`), `povinna_ulica`.
- `specialne` – obce s odovzdaním na inom mieste (Tušice).
- `ulice` – našepkávač ulíc; `casti_secoviec_bez_cisla` – kde sa nepýta číslo domu.

### `src/data/nastavenia.json`

Telefóny, adresa, otváracie hodiny, spôsoby platby a odhad času (v minútach, zobrazuje sa slovami).

Po úprave spustite `npm test` – ak ste zmenili cenu, ktorú používa kontrolný príklad, test na to upozorní.

## Ako pridať fotku jedla

Fotku pomenujte podľa `id` jedla (napr. `sunkova.jpg`), dajte ju do `fotky/` a spustite `npm run fotky`.
Web ju potom použije namiesto zástupného obrázka. Zoznam súborov a pripravené zadania pre
generátor obrázkov sú v `FOTKY.md`.

## Ako je to poskladané

| Kde | Čo |
| --- | --- |
| `src/lib/cena.ts` | celý výpočet: ceny, balné, akcie, doprava, minimum (čisté funkcie, počíta v centoch) |
| `src/lib/cena.test.ts` | 10 kontrolných príkladov zo zadania + ďalšie pravidlá |
| `src/lib/text.ts` | `naTextSystemu()` – text objednávky vo formáte pre kuchyňu; `zostavObjednavku()` |
| `src/lib/cas.ts` | odhad času slovami po štvrťhodinách, časy „Na čas" |
| `src/lib/otvaracie.ts` | otvorené / zatvorené (v slovenskom čase) |
| `src/store/kosik.ts` | košík a údaje pokladne, uložené v `localStorage` |
| `src/pages/` | Úvod, Menu, Košík, Pokladňa, Potvrdenie |
| `src/components/Detail.tsx` | výber úprav jedla |

Technológie: Vite, React, TypeScript, Tailwind CSS, Framer Motion, Zustand, Vitest, Leaflet.

## Čo je len ukážka

- Objednávka sa neodosiela (vznikne v tvare pre server, uloží sa do `localStorage` pod `family-objednavky-v1`).
- Stav objednávky na potvrdení sa posúva sám.
- „Sledovať vodiča" ukazuje vymyslenú trasu v Sečovciach, nie skutočnú adresu ani vodiča.
- Podmienky a ochrana údajov sú zástupné texty.
- Logo je výrez z lístka; všetky pizze majú rovnakú fotku, jedlá bez fotky majú kreslenú ikonu.
- Vypredané jedlá, hodiny a odhad času sa berú zo súborov, nie zo servera.

## Rozhodnutia, ktoré zadanie neurčilo

- Pri 8 a viac pizzách sú zadarmo dve (tri…) **najlacnejšie zo všetkých** pizz v košíku.
- Riadok akcie tri plus jedna v texte pre kuchyňu: `Akcia 3+1: najlacnejsia pizza ZDARMA - -8,00 EUR`
  (vzor v zadaní bol len pre nápoj) – treba zosúladiť s tlačou.
- Príloha navyše na polovicu sa v texte pre kuchyňu píše `+ feferony na polovicu`.
- Minimálna objednávka sa porovnáva so sumou jedál a balného po akciách, bez dopravy.
