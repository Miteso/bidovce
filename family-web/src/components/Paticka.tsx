import { menu, nastavenia } from '../lib/data'
import { skupinyHodin } from '../lib/otvaracie'

const tel = (c: string) => `tel:${c.replace(/\s/g, '')}`

export function Paticka() {
  return (
    <footer className="mt-10 border-t border-zlata/25 bg-black/35 px-5 pb-32 pt-8 text-sm">
      <div className="mx-auto grid max-w-3xl gap-7 sm:grid-cols-2">
        <section>
          <h2 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-jedlo">{nastavenia.nazov}</h2>
          <p>{nastavenia.adresa}</p>
          <p className="mt-2">
            Objednávky:{' '}
            <a className="font-bold text-white" href={tel(nastavenia.telefon_objednavky)}>
              {nastavenia.telefon_objednavky}
            </a>
          </p>
          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {nastavenia.telefony.map((t) => (
              <a key={t} className="py-1 font-bold text-white" href={tel(t)}>
                {t}
              </a>
            ))}
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-jedlo">Otváracie hodiny</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            {skupinyHodin(nastavenia).map((s) => (
              <div key={s.dni} className="contents">
                <dt className="font-bold text-white">{s.dni}</dt>
                <dd>{s.od ? `${s.od} – ${s.do}` : 'zatvorené'}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="sm:col-span-2">
          <h2 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-jedlo">Alergény</h2>
          <p className="text-xs leading-relaxed text-neutral-300">
            {Object.entries(menu.alergeny_legenda)
              .map(([c, n]) => `${c} – ${n}`)
              .join(' · ')}
          </p>
        </section>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs sm:col-span-2">
          <a className="py-2 underline decoration-zlata/50 underline-offset-4" href="#/podmienky">
            Obchodné podmienky
          </a>
          <a className="py-2 underline decoration-zlata/50 underline-offset-4" href="#/ochrana-udajov">
            Ochrana osobných údajov
          </a>
        </nav>
      </div>
    </footer>
  )
}
