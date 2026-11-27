import { useEffect, useState } from 'react'

const citaj = () => window.location.hash.replace(/^#/, '') || '/'

/** Jednoduché smerovanie cez hash (#/menu, #/kosik…) – funguje na GitHub Pages. */
export function useCesta(): string {
  const [cesta, setCesta] = useState(citaj)
  useEffect(() => {
    const zmena = () => {
      setCesta(citaj())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', zmena)
    return () => window.removeEventListener('hashchange', zmena)
  }, [])
  return cesta
}

export const chod = (cesta: string) => {
  window.location.hash = cesta
}
