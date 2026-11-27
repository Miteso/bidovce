import logo from '../assets/logo.webp'
import { chod } from '../lib/router'

/** Úzka mramorová hlavička pre vnútorné stránky. */
export function Hlavicka({ nadpis, pismo, spat = '/' }: { nadpis: string; pismo?: string; spat?: string }) {
  return (
    <header className="mramor-tien relative z-20">
      <div className="mramor flex items-center gap-3 px-3 pb-6 pt-2">
        <button
          type="button"
          onClick={() => chod(spat)}
          aria-label="Späť"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-2xl font-bold text-[#5c1414]"
        >
          ‹
        </button>
        <a href="#/" aria-label="Family – úvod" className="shrink-0">
          <img src={logo} alt="Family Restaurant & Caffe" width={52} height={53} className="h-[52px] w-[52px]" />
        </a>
        <h1 className="flex min-w-0 items-baseline gap-2">
          <span className="zlato zlato-mramor zlato-tien truncate text-[1.7rem] font-black uppercase leading-none">{nadpis}</span>
          {pismo && <span className="font-script text-3xl leading-none text-neutral-700">{pismo}</span>}
        </h1>
      </div>
    </header>
  )
}
