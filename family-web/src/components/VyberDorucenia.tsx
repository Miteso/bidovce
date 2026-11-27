import { eur } from '../lib/cena'
import { nastavenia, obce } from '../lib/data'
import { useKosik } from '../store/kosik'
import { Prepinac, poleTrieda } from './Prvky'

export const INA_OBEC = '__ina__'

/** Rozvoz / osobný odber + obec s cenou dopravy. Použité v košíku aj v pokladni. */
export function VyberDorucenia({ chyba }: { chyba?: string | null }) {
  const k = useKosik((s) => s.kontakt)
  const zmen = useKosik((s) => s.zmenKontakt)
  const specialna = obce.specialne.find((s) => s.nazov === k.obec)
  return (
    <div>
      <Prepinac
        popis="Spôsob prevzatia"
        hodnota={k.sposob}
        onZmena={(sposob) => zmen({ sposob })}
        moznosti={[
          { hodnota: 'ROZVOZ' as const, nazov: 'Rozvoz', pod: 'až k vám domov' },
          { hodnota: 'ODBER' as const, nazov: 'Osobný odber', pod: 'bez dopravy' },
        ]}
      />
      {k.sposob === 'ODBER' ? (
        <p className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3 text-sm leading-snug">
          <span className="font-bold text-white">{nastavenia.nazov}</span>
          <br />
          {nastavenia.adresa}
          <br />
          <span className="text-neutral-300">Pripravené do pol hodiny.</span>
        </p>
      ) : (
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-bold text-neutral-200">Obec</span>
          <select
            value={k.obec ?? ''}
            onChange={(e) => zmen({ obec: e.target.value || null, ulica: '', cislo: '' })}
            className={poleTrieda}
            aria-invalid={!!chyba}
          >
            <option value="">Vyberte obec…</option>
            {obce.obce.map((o) => (
              <option key={o.nazov} value={o.nazov}>
                {o.nazov} · doprava {eur(o.doprava)}
              </option>
            ))}
            {obce.specialne.map((o) => (
              <option key={o.nazov} value={o.nazov}>
                {o.nazov} · doprava {eur(o.doprava)}
              </option>
            ))}
            <option value={INA_OBEC}>Moja obec nie je v zozname</option>
          </select>
          {chyba && (
            <span role="alert" className="mt-1 block text-sm font-medium text-red-300">
              {chyba}
            </span>
          )}
        </label>
      )}
      {k.sposob === 'ROZVOZ' && specialna && (
        <p className="mt-2 rounded-xl border border-zlata/40 bg-zlata/10 p-3 text-sm text-white">
          {specialna.nazov}: {specialna.poznamka}.
        </p>
      )}
      {k.sposob === 'ROZVOZ' && k.obec === INA_OBEC && (
        <div className="mt-2 rounded-xl border border-red-400/50 bg-red-950/40 p-3 text-sm text-white">
          <p className="font-bold">Do vašej obce, žiaľ, nerozvážame.</p>
          <p className="mt-1 text-neutral-200">Objednávku si môžete vyzdvihnúť osobne – pripravená je do pol hodiny.</p>
          <button type="button" onClick={() => zmen({ sposob: 'ODBER' })} className="zlate-tlacidlo mt-3 rounded-full px-5 py-2.5 text-sm font-black">
            Chcem osobný odber
          </button>
        </div>
      )}
    </div>
  )
}
