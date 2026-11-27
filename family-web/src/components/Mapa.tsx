import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Ukážková trasa v Sečovciach – nie skutočná poloha vodiča ani adresa zákazníka.
const TRASA: [number, number][] = [
  [48.7012, 21.6603],
  [48.7021, 21.6611],
  [48.7033, 21.6608],
  [48.7046, 21.6619],
  [48.7052, 21.6641],
  [48.7049, 21.6663],
  [48.7058, 21.6681],
  [48.7069, 21.6688],
]

const znacka = (obsah: string, trieda = '') =>
  L.divIcon({ html: `<div class="mapa-znacka ${trieda}">${obsah}</div>`, className: '', iconSize: [38, 38], iconAnchor: [19, 19] })

function bodNaTrase(t: number): [number, number] {
  const useky = TRASA.slice(1).map((b, i) => Math.hypot(b[0] - TRASA[i][0], b[1] - TRASA[i][1]))
  const spolu = useky.reduce((a, b) => a + b, 0)
  let zostava = t * spolu
  for (let i = 0; i < useky.length; i++) {
    if (zostava <= useky[i]) {
      const p = zostava / useky[i]
      return [TRASA[i][0] + (TRASA[i + 1][0] - TRASA[i][0]) * p, TRASA[i][1] + (TRASA[i + 1][1] - TRASA[i][1]) * p]
    }
    zostava -= useky[i]
  }
  return TRASA[TRASA.length - 1]
}

export default function Mapa() {
  const el = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!el.current) return
    const mapa = L.map(el.current, { zoomControl: false, attributionControl: true, scrollWheelZoom: false })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapa)
    const ciara = L.polyline(TRASA, { color: '#d4af37', weight: 5, opacity: 0.9, dashArray: '2 10', lineCap: 'round' }).addTo(mapa)
    L.marker(TRASA[0], { icon: znacka('🍕'), title: 'Family Restaurant & Caffe' }).addTo(mapa)
    L.marker(TRASA[TRASA.length - 1], { icon: znacka('🏠'), title: 'Vaša adresa (ukážka)' }).addTo(mapa)
    const auto = L.marker(TRASA[0], { icon: znacka('🚗', 'auto'), zIndexOffset: 500, title: 'Vodič (ukážka)' }).addTo(mapa)
    mapa.fitBounds(ciara.getBounds(), { padding: [34, 34] })

    const pokoj = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    if (pokoj) auto.setLatLng(bodNaTrase(0.55))
    else {
      const zaciatok = performance.now()
      const krok = (teraz: number) => {
        const t = ((teraz - zaciatok) / 24000) % 1.15
        auto.setLatLng(bodNaTrase(Math.min(1, t)))
        raf = requestAnimationFrame(krok)
      }
      raf = requestAnimationFrame(krok)
    }
    return () => {
      cancelAnimationFrame(raf)
      mapa.remove()
    }
  }, [])
  return <div ref={el} className="h-72 w-full" role="img" aria-label="Mapa s ukážkovou trasou vodiča z pizzerie na adresu" />
}
