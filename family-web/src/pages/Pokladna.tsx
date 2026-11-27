import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { casSlovami, casyNaDnes, odhadMinuty } from '../lib/cas'
import { eur, najdiObec } from '../lib/cena'
import { menu, nastavenia, obce } from '../lib/data'
import { kedyPrijimame, stavOtvorenia } from '../lib/otvaracie'
import { chod } from '../lib/router'
import { adresaText, bezDiakritiky, normalizujTelefon, platneCisloDomu, popisRiadku, zostavObjednavku } from '../lib/text'
import { ulozObjednavku, useKosik } from '../store/kosik'
import { Hlavicka } from '../components/Hlavicka'
import { Pole, Prepinac, poleTrieda } from '../components/Prvky'
import { INA_OBEC, VyberDorucenia } from '../components/VyberDorucenia'
import { Sucet, useVypocet } from './Kosik'

const KROKY = ['Doručenie', 'Kontakt a čas', 'Platba']

function Ukazovatel({ krok }: { krok: number }) {
  return (
    <ol className="mx-auto mb-4 flex max-w-xl items-start px-3" aria-label="Kroky objednávky">
      {KROKY.map((n, i) => (
        <li key={n} className="relative flex flex-1 flex-col items-center gap-1" aria-current={i === krok ? 'step' : undefined}>
          {i > 0 && (
            <span className="absolute right-1/2 top-4 -z-0 h-0.5 w-full bg-white/15">
              <motion.span className="block h-full bg-zlata" initial={false} animate={{ width: i <= krok ? '100%' : '0%' }} transition={{ duration: 0.35 }} />
            </span>
          )}
          <span className={`relative z-10 grid h-8 w-8 place-items-center rounded-full text-sm font-black ${i <= krok ? 'zlate-tlacidlo' : 'bg-neutral-700 text-neutral-300'}`}>
            {i < krok ? '✓' : i + 1}
          </span>
          <span className={`text-[0.7rem] font-bold ${i === krok ? 'text-white' : 'text-neutral-400'}`}>{n}</span>
        </li>
      ))}
    </ol>
  )
}

export function Pokladna() {
  const k = useKosik((s) => s.kontakt)
  const zmen = useKosik((s) => s.zmenKontakt)
  const riadky = useKosik((s) => s.riadky)
  const suhlas = useKosik((s) => s.suhlas)
  const setSuhlas = useKosik((s) => s.setSuhlas)
  const vyprazdni = useKosik((s) => s.vyprazdni)
  const v = useVypocet()
  const [krok, setKrok] = useState(0)
  const [skusene, setSkusene] = useState(false)
  const [naseptavac, setNaseptavac] = useState(false)
  const odoslane = useRef(false)

  const stav = stavOtvorenia(nastavenia)
  const obec = k.sposob === 'ROZVOZ' ? najdiObec(obce, k.obec) : null
  const odhad = odhadMinuty(nastavenia, k.sposob, obec)
  const casy = useMemo(() => casyNaDnes(stav, odhad), [stav.minuty, stav.dnes?.[0], stav.dnes?.[1], odhad[0]])

  // Mimo otváracích hodín sa dá objednať len „Na čas".
  useEffect(() => {
    if (!stav.otvorene && k.na_cas == null && casy.length) zmen({ na_cas: casy[0] })
    if (k.na_cas != null && !casy.includes(k.na_cas)) zmen({ na_cas: stav.otvorene ? null : (casy[0] ?? null) })
  }, [stav.otvorene, casy, k.na_cas, zmen])

  useEffect(() => {
    if (riadky.length === 0 && !odoslane.current) chod('/kosik')
  }, [riadky.length])

  const povinnaUlica = !!obec && !!obce.obce.find((o) => o.nazov === obec.nazov)?.povinna_ulica
  const bezCisla = obce.casti_secoviec_bez_cisla.some((c) => bezDiakritiky(c).toLowerCase() === bezDiakritiky(k.ulica.trim()).toLowerCase())
  const ulice = (k.obec && obce.ulice[k.obec]) || []
  const q = bezDiakritiky(k.ulica.trim()).toLowerCase()
  const navrhy = q.length > 0 ? ulice.filter((u) => bezDiakritiky(u).toLowerCase().includes(q) && u !== k.ulica).slice(0, 6) : []

  const chyby = {
    obec: k.sposob === 'ROZVOZ' && !obec ? (k.obec === INA_OBEC ? 'Do tejto obce nerozvážame – zvoľte osobný odber.' : 'Vyberte obec.') : null,
    ulica: k.sposob === 'ROZVOZ' && povinnaUlica && !k.ulica.trim() ? 'Zadajte ulicu.' : null,
    cislo:
      k.sposob === 'ROZVOZ' && obec && !bezCisla
        ? !k.cislo.trim()
          ? 'Zadajte číslo domu.'
          : !platneCisloDomu(k.cislo)
            ? 'Číslo domu zadajte v tvare 5 alebo 821/41.'
            : null
        : null,
    minimum: k.sposob === 'ROZVOZ' && v.chyba_do_minima > 0 ? `Do minimálnej objednávky pre obec ${k.obec} (${eur(v.minimum ?? 0)}) chýba ${eur(v.chyba_do_minima)}.` : null,
    meno: k.meno.trim().length < 2 ? 'Zadajte meno.' : null,
    telefon: !normalizujTelefon(k.telefon) ? 'Zadajte slovenské mobilné číslo, napr. 0901 234 567 alebo +421 901 234 567.' : null,
    cas: !stav.otvorene && casy.length === 0 ? `Dnes už objednávky neprijímame. Prijímame ich ${kedyPrijimame(nastavenia)}.` : null,
    suhlas: !suhlas ? 'Bez súhlasu so spracovaním údajov objednávku nevieme prijať.' : null,
  }
  const chybyKroku = [
    [chyby.obec, chyby.ulica, chyby.cislo, chyby.minimum],
    [chyby.meno, chyby.telefon, chyby.cas],
    [chyby.suhlas],
  ]
  const ukaz = (c: string | null) => (skusene ? c : null)

  const dalej = () => {
    if (chybyKroku[krok].some(Boolean)) {
      setSkusene(true)
      requestAnimationFrame(() => document.querySelector('[role="alert"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' }))
      return
    }
    setSkusene(false)
    if (krok < 2) {
      setKrok(krok + 1)
      window.scrollTo(0, 0)
      return
    }
    const objednavka = zostavObjednavku(menu, obce, riadky, k)
    const cislo = String(Math.floor(1000 + Math.random() * 9000))
    ulozObjednavku({ cislo, cas: Date.now(), objednavka, kontakt: k })
    // Ukážkový režim: objednávka sa nikam neposiela, len sa uloží a vypíše.
    console.log('Objednávka (ukážka – neodoslaná):', objednavka)
    odoslane.current = true
    vyprazdni()
    chod(`/objednavka/${cislo}`)
  }

  const spat = () => {
    setSkusene(false)
    if (krok === 0) chod('/kosik')
    else setKrok(krok - 1)
  }

  return (
    <div>
      <Hlavicka nadpis="Pokladňa" spat="/kosik" />
      <Ukazovatel krok={krok} />
      <main className="mx-auto max-w-xl px-3 pb-40">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={krok} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
            {krok === 0 && (
              <section className="karta rounded-2xl p-3.5">
                <VyberDorucenia chyba={ukaz(chyby.obec)} />
                {k.sposob === 'ROZVOZ' && obec && (
                  <>
                    <Pole popis="Ulica" pozn={povinnaUlica ? 'povinné' : 'nepovinné'} chyba={ukaz(chyby.ulica)}>
                      <div className="relative">
                        <input
                          type="text"
                          autoComplete="address-line1"
                          value={k.ulica}
                          onChange={(e) => {
                            zmen({ ulica: e.target.value })
                            setNaseptavac(true)
                          }}
                          onFocus={() => setNaseptavac(true)}
                          onBlur={() => setTimeout(() => setNaseptavac(false), 150)}
                          placeholder={ulice.length ? 'Začnite písať názov ulice' : 'Názov ulice'}
                          className={poleTrieda}
                          role="combobox"
                          aria-expanded={naseptavac && navrhy.length > 0}
                          aria-controls="navrhy-ulic"
                          aria-autocomplete="list"
                        />
                        {naseptavac && navrhy.length > 0 && (
                          <ul id="navrhy-ulic" role="listbox" className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-zlata/40 bg-[#262626] shadow-xl">
                            {navrhy.map((u) => (
                              <li key={u} role="option" aria-selected={false}>
                                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { zmen({ ulica: u }); setNaseptavac(false) }} className="block min-h-11 w-full px-3.5 text-left text-base text-white">
                                  {u}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </Pole>
                    {!bezCisla && (
                      <Pole popis="Číslo domu" pozn="napr. 5 alebo 821/41" chyba={ukaz(chyby.cislo)}>
                        <input type="text" inputMode="text" autoComplete="address-line2" value={k.cislo} onChange={(e) => zmen({ cislo: e.target.value })} className={poleTrieda} />
                      </Pole>
                    )}
                    <Pole popis="Poznámka pre vodiča" pozn="nepovinné">
                      <input type="text" maxLength={140} value={k.poznamka} onChange={(e) => zmen({ poznamka: e.target.value })} placeholder="napr. zvonček Novák, 2. poschodie" className={poleTrieda} />
                    </Pole>
                  </>
                )}
                {ukaz(chyby.minimum) && (
                  <p role="alert" className="mt-3 rounded-xl border border-red-400/50 bg-red-950/40 p-3 text-sm font-medium text-white">
                    {chyby.minimum}{' '}
                    <a href="#/menu" className="font-bold text-zlata-sv underline">
                      Pridať jedlo
                    </a>
                  </p>
                )}
              </section>
            )}

            {krok === 1 && (
              <section className="karta rounded-2xl p-3.5">
                <Pole popis="Meno a priezvisko" chyba={ukaz(chyby.meno)}>
                  <input type="text" autoComplete="name" value={k.meno} onChange={(e) => zmen({ meno: e.target.value })} className={poleTrieda} />
                </Pole>
                <Pole popis="Telefón" pozn="zavoláme len pri nejasnosti" chyba={ukaz(chyby.telefon)}>
                  <input type="tel" inputMode="tel" autoComplete="tel" value={k.telefon} onChange={(e) => zmen({ telefon: e.target.value })} placeholder="0901 234 567" className={poleTrieda} />
                </Pole>
                <div className="mt-5">
                  <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-jedlo">Kedy</h3>
                  <Prepinac
                    popis="Čas"
                    hodnota={k.na_cas == null ? 'hned' : 'cas'}
                    onZmena={(h) => {
                      if (h === 'hned') stav.otvorene && zmen({ na_cas: null })
                      else zmen({ na_cas: k.na_cas ?? casy[0] ?? null })
                    }}
                    moznosti={[
                      { hodnota: 'hned', nazov: 'Čo najskôr', pod: stav.otvorene ? casSlovami(odhad) : 'teraz je zatvorené' },
                      { hodnota: 'cas', nazov: 'Na čas', pod: 'dnes' },
                    ]}
                  />
                  {k.na_cas != null && casy.length > 0 && (
                    <select aria-label="Čas doručenia" value={k.na_cas} onChange={(e) => zmen({ na_cas: e.target.value })} className={`${poleTrieda} mt-2`}>
                      {casy.map((c) => (
                        <option key={c} value={c}>
                          dnes o {c}
                        </option>
                      ))}
                    </select>
                  )}
                  {ukaz(chyby.cas) && (
                    <p role="alert" className="mt-2 text-sm font-medium text-red-300">
                      {chyby.cas}
                    </p>
                  )}
                  {!stav.otvorene && casy.length > 0 && <p className="mt-2 text-xs text-neutral-400">Teraz máme zatvorené, objednať sa dá na čas.</p>}
                </div>
              </section>
            )}

            {krok === 2 && (
              <>
                <section className="karta rounded-2xl p-3.5">
                  <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-jedlo">Spôsob platby</h3>
                  <div role="radiogroup" aria-label="Spôsob platby" className="space-y-2">
                    {nastavenia.platby.map((p) => (
                      <label key={p} className={`flex min-h-12 items-center gap-3 rounded-xl border px-3.5 ${k.platba === p ? 'border-zlata bg-zlata/15' : 'border-white/15 bg-black/30'}`}>
                        <input type="radio" name="platba" className="h-5 w-5 accent-[#d4af37]" checked={k.platba === p} onChange={() => zmen({ platba: p })} />
                        <span className="text-sm font-bold text-white">{p}</span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-neutral-300">Platíte až pri prevzatí.</p>
                </section>

                <section className="karta mt-4 rounded-2xl p-3.5">
                  <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-jedlo">Zhrnutie</h3>
                  <ul className="mb-3 space-y-1.5 text-sm">
                    {v.riadky.map((x) => {
                      const { nazov, upravy } = popisRiadku(menu, x.riadok)
                      return (
                        <li key={x.riadok.uid} className="flex justify-between gap-3">
                          <span>
                            <span className="font-bold text-white">
                              {x.riadok.pocet}× {nazov}
                            </span>
                            {upravy.length > 0 && <span className="block text-xs text-neutral-400">{upravy.join(' · ')}</span>}
                          </span>
                          <span className="shrink-0 font-bold text-white">{eur(x.spolu)}</span>
                        </li>
                      )
                    })}
                  </ul>
                  <div className="border-t border-white/10 pt-3">
                    <Sucet v={v} sposob={k.sposob} obecVybrana={!!obec} />
                  </div>
                  <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-white/10 pt-3 text-sm">
                    <dt className="text-neutral-400">{k.sposob === 'ODBER' ? 'Odber' : 'Adresa'}</dt>
                    <dd className="text-white">{k.sposob === 'ODBER' ? nastavenia.adresa : adresaText(k)}</dd>
                    <dt className="text-neutral-400">Kontakt</dt>
                    <dd className="text-white">
                      {k.meno}, {k.telefon}
                    </dd>
                    <dt className="text-neutral-400">Čas</dt>
                    <dd className="text-white">{k.na_cas ? `dnes o ${k.na_cas}` : `čo najskôr (${casSlovami(odhad)})`}</dd>
                  </dl>
                </section>

                <label className="mt-4 flex items-start gap-3 px-1 text-sm leading-snug">
                  <input type="checkbox" className="mt-0.5 h-6 w-6 shrink-0 accent-[#d4af37]" checked={suhlas} onChange={(e) => setSuhlas(e.target.checked)} />
                  <span>
                    Súhlasím so spracovaním osobných údajov na účel vybavenia objednávky.{' '}
                    <a href="#/ochrana-udajov" className="font-bold text-zlata-sv underline">
                      Viac informácií
                    </a>
                  </span>
                </label>
                {ukaz(chyby.suhlas) && (
                  <p role="alert" className="mt-1 px-1 text-sm font-medium text-red-300">
                    {chyby.suhlas}
                  </p>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zlata/30 bg-[#161616]/95 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur">
        <div className="mx-auto flex max-w-md gap-2.5">
          <button type="button" onClick={spat} className="rounded-full border border-white/20 px-5 text-sm font-bold text-neutral-200">
            Späť
          </button>
          <button type="button" onClick={dalej} className="zlate-tlacidlo flex-1 rounded-full py-3.5 text-center text-base font-black">
            {krok < 2 ? 'Pokračovať' : `Odoslať objednávku · ${eur(v.suma)}`}
          </button>
        </div>
        {krok === 2 && nastavenia.demo && <p className="mt-1.5 text-center text-[0.68rem] text-neutral-400">Ukážka – objednávka sa neodošle</p>}
      </div>
    </div>
  )
}
