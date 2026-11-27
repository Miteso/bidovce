import { useCallback, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { polozka as najdiPolozku } from './lib/data'
import { useCesta } from './lib/router'
import type { Polozka, Riadok } from './lib/typy'
import { Detail } from './components/Detail'
import { Let } from './components/Let'
import { PasKosika } from './components/PasKosika'
import { PasZatvorene } from './components/PasZatvorene'
import { Kosik } from './pages/Kosik'
import { MenuStranka } from './pages/MenuStranka'
import { Pokladna } from './pages/Pokladna'
import { Potvrdenie } from './pages/Potvrdenie'
import { Texty } from './pages/Texty'
import { Uvod } from './pages/Uvod'

interface Otvorene {
  p: Polozka
  povodny?: Riadok
  zdroj?: HTMLElement | null
}

export default function App() {
  const cesta = useCesta()
  const [detail, setDetail] = useState<Otvorene | null>(null)
  const zavri = useCallback(() => setDetail(null), [])

  const stranka = cesta.split('/')[1] ?? ''
  let obsah: React.ReactNode
  if (stranka === 'menu') obsah = <MenuStranka onOtvor={(p, zdroj) => setDetail({ p, zdroj })} />
  else if (stranka === 'kosik')
    obsah = (
      <Kosik
        onUprav={(r) => {
          const p = najdiPolozku(r.id)
          if (p) setDetail({ p, povodny: r })
        }}
      />
    )
  else if (stranka === 'pokladna') obsah = <Pokladna />
  else if (stranka === 'objednavka') obsah = <Potvrdenie cislo={cesta.split('/')[2] ?? ''} />
  else if (stranka === 'podmienky') obsah = <Texty druh="podmienky" />
  else if (stranka === 'ochrana-udajov') obsah = <Texty druh="ochrana" />
  else obsah = <Uvod />

  return (
    <MotionConfig reducedMotion="user">
      <PasZatvorene />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={stranka} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {obsah}
        </motion.div>
      </AnimatePresence>
      {stranka === 'menu' && <PasKosika />}
      <Let />
      <AnimatePresence>{detail && <Detail key={detail.p.id + (detail.povodny?.uid ?? '')} {...detail} onZavri={zavri} />}</AnimatePresence>
    </MotionConfig>
  )
}
