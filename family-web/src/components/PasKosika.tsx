import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { eur, spocitaj } from '../lib/cena'
import { menu, obce } from '../lib/data'
import { useKosik } from '../store/kosik'

export function IkonaKosika({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 4h2.5l2.2 10.5a1.5 1.5 0 0 0 1.5 1.2h8.3a1.5 1.5 0 0 0 1.45-1.1L20.5 8H6.4" />
      <circle cx="9.5" cy="19.5" r="1.3" />
      <circle cx="17.5" cy="19.5" r="1.3" />
    </svg>
  )
}

/** Plávajúci panel dole – košík je stále na dosah. */
export function PasKosika() {
  const riadky = useKosik((s) => s.riadky)
  const v = useMemo(() => spocitaj(menu, obce, riadky, { sposob: 'ODBER' }), [riadky])
  const [skok, setSkok] = useState(0)
  useEffect(() => {
    const h = () => setSkok((x) => x + 1)
    window.addEventListener('family:pridane', h)
    return () => window.removeEventListener('family:pridane', h)
  }, [])

  return (
    <AnimatePresence>
      {v.pocet_kusov > 0 && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2"
        >
          <a
            href="#/kosik"
            className="zlate-tlacidlo mx-auto flex max-w-md items-center gap-3 rounded-full px-4 py-3"
            aria-label={`Košík: ${v.pocet_kusov} ks, ${eur(v.suma_jedlo)}. Otvoriť košík`}
          >
            <motion.span
              key={skok}
              id="ikona-kosika"
              initial={skok ? { scale: 1.45, rotate: -12 } : false}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 12, delay: skok ? 0.45 : 0 }}
              className="relative grid h-9 w-9 place-items-center rounded-full bg-[#231a05] text-zlata-sv"
            >
              <IkonaKosika className="h-5 w-5" />
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-bordo px-1 text-[0.7rem] font-extrabold text-white ring-2 ring-[#d4af37]">
                {v.pocet_kusov}
              </span>
            </motion.span>
            <span className="flex-1 text-base font-black uppercase tracking-wide">Košík</span>
            <span className="text-lg font-black">{eur(v.suma_jedlo)}</span>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
