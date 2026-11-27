import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cenaKs, eur } from '../lib/cena'
import { menu, polozka as najdiPolozku } from '../lib/data'
import { suroviny } from '../lib/text'
import type { CastPizze, Polozka, Riadok } from '../lib/typy'
import { useKosik } from '../store/kosik'
import { odletDoKosika } from './Let'
import { Obrazok } from './Obrazok'
import { Cip, Pocitadlo, Prepinac, Sekcia, poleTrieda } from './Prvky'

type Navrh = Omit<Riadok, 'uid'>

const omacky = () => menu.polozky.find((p) => p.kat === 'omacky')?.druhy ?? []

function vychodzi(p: Polozka): Navrh {
  const n: Navrh = { id: p.id, pocet: 1 }
  if (p.kat === 'pizza') Object.assign(n, { velkost: 'mala', pol_na_pol: null, bez: [], navyse: [] })
  else if (p.kat === 'burgre') Object.assign(n, { menu: false, dip: null, zamena_hranoliek: null, bez: [], navyse: [] })
  else if (p.kat === 'omacky') Object.assign(n, { druh: undefined })
  else {
    if (p.ma_dresing) n.omacka = null
    if (p.ma_hranolky) n.zamena_hranoliek = null
    if (p.varianty) n.variant = 0
    if (p.syr_navyse != null) n.syr_navyse = false
    n.bez = []
  }
  return n
}

/** Panel zdola (na počítači okno v strede) – výber úprav, cena sa prepočítava hneď. */
export function Detail({ p, povodny, zdroj, onZavri }: { p: Polozka; povodny?: Riadok; zdroj?: HTMLElement | null; onZavri: () => void }) {
  const [n, setN] = useState<Navrh>(() => (povodny ? { ...povodny } : vychodzi(p)))
  const pridaj = useKosik((s) => s.pridaj)
  const uprav = useKosik((s) => s.uprav)
  const foto = useRef<HTMLDivElement>(null)
  const zmen = (z: Partial<Navrh>) => setN((x) => ({ ...x, ...z }))

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onZavri()
    window.addEventListener('keydown', esc)
    const povodne = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', esc)
      document.body.style.overflow = povodne
    }
  }, [onZavri])

  const druha = n.pol_na_pol ? najdiPolozku(n.pol_na_pol) : null
  const cena = useMemo(() => cenaKs(menu, { ...n, uid: 'x' }), [n])
  const chyba =
    p.kat === 'burgre' && n.menu && !n.dip ? 'Vyberte dip k menu' : p.kat === 'omacky' && !n.druh ? 'Vyberte druh omáčky' : n.pol_na_pol === '' ? 'Vyberte druhú polovicu' : null

  const prepniBez = (s: string) => zmen({ bez: n.bez?.includes(s) ? n.bez.filter((x) => x !== s) : [...(n.bez ?? []), s] })
  const prepniNavyse = (nazov: string) =>
    zmen({ navyse: n.navyse?.some((x) => x.nazov === nazov) ? n.navyse.filter((x) => x.nazov !== nazov) : [...(n.navyse ?? []), { nazov, cast: 'cela' }] })
  const nastavCast = (nazov: string, cast: CastPizze) => zmen({ navyse: n.navyse?.map((x) => (x.nazov === nazov ? { ...x, cast } : x)) })

  const potvrd = () => {
    if (chyba) return
    const cisty: Navrh = { ...n, poznamka: n.poznamka?.trim() || undefined }
    if (!cisty.pol_na_pol) cisty.navyse = cisty.navyse?.map((x) => (x.cast ? { ...x, cast: 'cela' as const } : x))
    if (povodny) uprav(povodny.uid, cisty)
    else {
      pridaj(cisty)
      odletDoKosika(foto.current ?? zdroj ?? null)
    }
    onZavri()
  }

  const zamenaHranoliek = (
    <Sekcia nadpis="Hranolky">
      <Prepinac
        popis="Hranolky"
        hodnota={n.zamena_hranoliek ?? ''}
        onZmena={(h) => zmen({ zamena_hranoliek: h || null })}
        moznosti={[{ hodnota: '', nazov: 'Klasické', pod: 'v cene' }, ...menu.zamena_hranoliek.map((z) => ({ hodnota: z.nazov, nazov: z.nazov.replace(' hranolky', ''), pod: `+ ${eur(z.cena)}` }))]}
      />
    </Sekcia>
  )
  const bez = suroviny(p, druha)

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label={p.nazov}>
      <motion.button
        type="button"
        aria-label="Zavrieť"
        className="absolute inset-0 bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onZavri}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 330, damping: 34 }}
        className="relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl border border-b-0 border-zlata/30 bg-[#1f1f1f] shadow-2xl md:rounded-3xl md:border-b"
      >
        <div className="mx-auto mt-2 h-1.5 w-11 shrink-0 rounded-full bg-white/25 md:hidden" />
        <button type="button" onClick={onZavri} aria-label="Zavrieť" className="absolute right-2 top-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-[#1f1f1f]/90 text-2xl text-neutral-200">
          ×
        </button>

        <div className="overflow-y-auto overscroll-contain px-4 pb-4 pt-3">
          <div className="flex items-center gap-4 pr-9">
            <div ref={foto}>
              <Obrazok p={p} velkost={92} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold uppercase leading-tight text-jedlo">{p.nazov}</h2>
              {p.gramaz && <p className="text-xs text-neutral-300">{p.gramaz}</p>}
              {p.alergeny && <p className="text-xs text-neutral-400">Alergény: {p.alergeny.join(', ')}</p>}
            </div>
          </div>
          {p.zlozenie && <p className="mt-3 text-sm leading-snug text-text">{p.zlozenie.join(', ')}</p>}
          {p.popis && <p className="mt-2 text-xs leading-relaxed text-neutral-400">{p.popis}</p>}

          {p.kat === 'pizza' && (
            <>
              <Sekcia nadpis="Veľkosť">
                <Prepinac
                  popis="Veľkosť pizze"
                  hodnota={n.velkost ?? 'mala'}
                  onZmena={(velkost) => zmen({ velkost })}
                  moznosti={[
                    { hodnota: 'mala' as const, nazov: 'Malá 500 g', pod: eur(p.cena_mala!) },
                    { hodnota: 'velka' as const, nazov: 'Veľká 1000 g', pod: eur(p.cena_velka!) },
                  ]}
                />
              </Sekcia>
              <Sekcia nadpis="Pol na pol" pozn="cena drahšej polovice">
                <label className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-white/15 bg-black/30 px-3.5">
                  <span className="text-sm font-bold text-white">Chcem dve polovice</span>
                  <input
                    type="checkbox"
                    className="h-6 w-6 accent-[#d4af37]"
                    checked={n.pol_na_pol != null}
                    onChange={(e) => zmen({ pol_na_pol: e.target.checked ? '' : null })}
                  />
                </label>
                {n.pol_na_pol != null && (
                  <select
                    aria-label="Druhá polovica"
                    value={n.pol_na_pol}
                    onChange={(e) => zmen({ pol_na_pol: e.target.value })}
                    className={`${poleTrieda} mt-2`}
                  >
                    <option value="">Vyberte druhú polovicu…</option>
                    {menu.polozky
                      .filter((x) => x.kat === 'pizza' && x.id !== p.id && !x.vypredane)
                      .map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.nazov} · {eur(n.velkost === 'velka' ? x.cena_velka! : x.cena_mala!)}
                        </option>
                      ))}
                  </select>
                )}
              </Sekcia>
              <Sekcia nadpis="Príloha navyše" pozn={druha ? 'aj na jednu polovicu' : undefined}>
                <div className="flex flex-wrap gap-2">
                  {menu.prilohy_na_pizzu.map((x) => (
                    <Cip key={x.nazov} zap={!!n.navyse?.some((y) => y.nazov === x.nazov)} onClick={() => prepniNavyse(x.nazov)}>
                      {x.nazov} <span className="font-bold text-jedlo">+{eur(x.cena)}</span>
                    </Cip>
                  ))}
                </div>
                {druha &&
                  n.navyse?.map((x) => (
                    <div key={x.nazov} className="mt-3">
                      <p className="mb-1 text-sm font-bold text-white">{x.nazov} – kam?</p>
                      <Prepinac
                        popis={`${x.nazov} – kam`}
                        hodnota={x.cast ?? 'cela'}
                        onZmena={(c) => nastavCast(x.nazov, c)}
                        moznosti={[
                          { hodnota: 'cela' as const, nazov: 'Celá pizza' },
                          { hodnota: 'polovica1' as const, nazov: '1. polovica', pod: p.nazov },
                          { hodnota: 'polovica2' as const, nazov: '2. polovica', pod: druha.nazov },
                        ]}
                      />
                    </div>
                  ))}
                {druha && !!n.navyse?.length && <p className="mt-2 text-xs text-neutral-400">Príloha stojí rovnako na celú pizzu aj na polovicu.</p>}
              </Sekcia>
            </>
          )}

          {p.kat === 'burgre' && (
            <>
              <Sekcia nadpis="Ako ho chcete">
                <Prepinac
                  popis="Samostatne alebo menu"
                  hodnota={n.menu ? 'menu' : 'sam'}
                  onZmena={(h) => zmen(h === 'menu' ? { menu: true } : { menu: false, dip: null, zamena_hranoliek: null })}
                  moznosti={[
                    { hodnota: 'sam', nazov: 'Samostatne', pod: eur(p.cena!) },
                    { hodnota: 'menu', nazov: 'Menu + dip + hranolky', pod: eur(p.cena_menu!) },
                  ]}
                />
              </Sekcia>
              {n.menu && (
                <>
                  <Sekcia nadpis="Dip k menu" pozn="v cene">
                    <div className="flex flex-wrap gap-2">
                      {omacky().map((d) => (
                        <Cip key={d} zap={n.dip === d} onClick={() => zmen({ dip: d })}>
                          {d}
                        </Cip>
                      ))}
                    </div>
                  </Sekcia>
                  {zamenaHranoliek}
                </>
              )}
              <Sekcia nadpis="Navyše">
                <div className="flex flex-wrap gap-2">
                  {menu.burger_navyse.map((x) => (
                    <Cip key={x.nazov} zap={!!n.navyse?.some((y) => y.nazov === x.nazov)} onClick={() => zmen({ navyse: n.navyse?.some((y) => y.nazov === x.nazov) ? n.navyse.filter((y) => y.nazov !== x.nazov) : [...(n.navyse ?? []), { nazov: x.nazov }] })}>
                      {x.nazov} <span className="font-bold text-jedlo">+{eur(x.cena)}</span>
                    </Cip>
                  ))}
                </div>
              </Sekcia>
            </>
          )}

          {p.ma_dresing && (
            <Sekcia nadpis="Dresing" pozn="výmena zadarmo">
              <div className="flex flex-wrap gap-2">
                <Cip zap={!n.omacka} onClick={() => zmen({ omacka: null })}>
                  podľa lístka
                </Cip>
                {omacky().map((d) => (
                  <Cip key={d} zap={n.omacka === d} onClick={() => zmen({ omacka: d })}>
                    {d}
                  </Cip>
                ))}
              </div>
            </Sekcia>
          )}
          {p.ma_hranolky && zamenaHranoliek}

          {p.varianty && (
            <Sekcia nadpis="Veľkosť porcie">
              <Prepinac
                popis="Veľkosť porcie"
                hodnota={n.variant ?? 0}
                onZmena={(variant) => zmen({ variant })}
                moznosti={p.varianty.map((v, i) => ({ hodnota: i, nazov: v.gramaz, pod: eur(v.cena) }))}
              />
            </Sekcia>
          )}
          {p.syr_navyse != null && (
            <Sekcia nadpis="Navyše">
              <Cip zap={!!n.syr_navyse} onClick={() => zmen({ syr_navyse: !n.syr_navyse })}>
                Syr navyše <span className="font-bold text-jedlo">+{eur(p.syr_navyse)}</span>
              </Cip>
            </Sekcia>
          )}
          {p.druhy && (
            <Sekcia nadpis="Druh omáčky">
              <div className="flex flex-wrap gap-2">
                {p.druhy.map((d) => (
                  <Cip key={d} zap={n.druh === d} onClick={() => zmen({ druh: d })}>
                    {d}
                  </Cip>
                ))}
              </div>
            </Sekcia>
          )}

          {bez.length > 0 && p.kat !== 'prilohy' && (
            <Sekcia nadpis="Bez…" pozn="zadarmo">
              <div className="flex flex-wrap gap-2">
                {bez.map((s) => (
                  <Cip key={s} skrt zap={!!n.bez?.includes(s)} onClick={() => prepniBez(s)}>
                    {s}
                  </Cip>
                ))}
              </div>
            </Sekcia>
          )}

          <Sekcia nadpis="Poznámka">
            <input
              type="text"
              maxLength={120}
              value={n.poznamka ?? ''}
              onChange={(e) => zmen({ poznamka: e.target.value })}
              placeholder="napr. dobre prepiecť"
              aria-label="Poznámka k jedlu"
              className={poleTrieda}
            />
          </Sekcia>
        </div>

        <div className="flex shrink-0 items-center gap-3 border-t border-zlata/25 bg-[#181818] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:rounded-b-3xl">
          <Pocitadlo pocet={n.pocet} onMinus={() => zmen({ pocet: Math.max(1, n.pocet - 1) })} onPlus={() => zmen({ pocet: Math.min(20, n.pocet + 1) })} />
          <button
            type="button"
            onClick={potvrd}
            aria-disabled={!!chyba}
            className={`flex-1 rounded-full px-3 py-3.5 text-center text-[0.95rem] font-black ${chyba ? 'bg-neutral-700 text-neutral-300' : 'zlate-tlacidlo'}`}
          >
            {chyba ?? `${povodny ? 'Uložiť' : 'Pridať'} · ${eur(cena * n.pocet)}`}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
