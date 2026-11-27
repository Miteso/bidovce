import { nastavenia } from '../lib/data'
import { Hlavicka } from '../components/Hlavicka'
import { Paticka } from '../components/Paticka'

/** Zástupné texty – pred ostrou prevádzkou ich nahradia skutočné podmienky. */
export function Texty({ druh }: { druh: 'podmienky' | 'ochrana' }) {
  return (
    <div>
      <Hlavicka nadpis={druh === 'podmienky' ? 'Podmienky' : 'Údaje'} />
      <main className="mx-auto max-w-xl space-y-3 px-5 pt-2 text-sm leading-relaxed">
        <p className="rounded-xl border border-zlata/40 bg-zlata/10 p-3 font-bold text-white">Zástupný text – doplníme pred spustením ostrej prevádzky.</p>
        {druh === 'podmienky' ? (
          <>
            <p>Tu budú obchodné podmienky objednávania jedál z {nastavenia.nazov}, {nastavenia.adresa}.</p>
            <p>Objednávka sa platí až pri prevzatí – {nastavenia.platby.join(', ').toLowerCase()}.</p>
          </>
        ) : (
          <>
            <p>Tu budú informácie o spracovaní osobných údajov (meno, telefón, adresa doručenia) na účel vybavenia objednávky.</p>
            <p>V ukážkovom režime sa údaje nikam neodosielajú – ostávajú len vo vašom zariadení.</p>
          </>
        )}
      </main>
      <Paticka />
    </div>
  )
}
