import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Letiaci {
  id: number
  src: string
  od: DOMRect
  do: DOMRect
}

let poradie = 0

/** Spustí „odlet" obrázka jedla do ikony košíka + krátku vibráciu. */
export function odletDoKosika(zdroj: HTMLElement | null) {
  try {
    navigator.vibrate?.(25)
  } catch {
    /* nepodporované */
  }
  window.dispatchEvent(new CustomEvent('family:pridane'))
  if (!zdroj || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const img = zdroj.tagName === 'IMG' ? (zdroj as HTMLImageElement) : zdroj.querySelector('img')
  const od = zdroj.getBoundingClientRect()
  // košík sa môže objaviť až po pridaní prvej položky – počkáme na ďalší snímok
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const ciel = document.getElementById('ikona-kosika')?.getBoundingClientRect()
      if (!ciel || !od.width) return
      window.dispatchEvent(
        new CustomEvent<Letiaci>('family:let', { detail: { id: ++poradie, src: img?.src ?? '', od, do: ciel } }),
      )
    }),
  )
}

export function Let() {
  const [veci, setVeci] = useState<Letiaci[]>([])
  useEffect(() => {
    const h = (e: Event) => setVeci((v) => [...v, (e as CustomEvent<Letiaci>).detail])
    window.addEventListener('family:let', h)
    return () => window.removeEventListener('family:let', h)
  }, [])
  return (
    <>
      {veci.map((l) => (
        <motion.div
          key={l.id}
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-[80] overflow-hidden rounded-full"
          style={{ width: l.od.width, height: l.od.height }}
          initial={{ x: l.od.left, y: l.od.top, scale: 1, opacity: 1 }}
          animate={{
            x: l.do.left + l.do.width / 2 - l.od.width / 2,
            y: [l.od.top, Math.min(l.od.top, l.do.top) - 60, l.do.top + l.do.height / 2 - l.od.height / 2],
            scale: 0.25,
            opacity: [1, 1, 0.4],
          }}
          transition={{ duration: 0.65, ease: 'easeInOut' }}
          onAnimationComplete={() => setVeci((v) => v.filter((x) => x.id !== l.id))}
        >
          {l.src ? <img src={l.src} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-zlata" />}
        </motion.div>
      ))}
    </>
  )
}
