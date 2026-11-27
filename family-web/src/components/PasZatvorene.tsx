import { nastavenia } from '../lib/data'
import { kedyPrijimame, stavOtvorenia } from '../lib/otvaracie'

export function PasZatvorene() {
  if (stavOtvorenia(nastavenia).otvorene) return null
  return (
    <p role="status" className="relative z-30 bg-bordo px-4 py-2 text-center text-[0.8rem] font-bold leading-snug text-white">
      Teraz máme zatvorené – objednávky prijímame {kedyPrijimame(nastavenia)}
    </p>
  )
}
