import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';

interface Props {
  onOpenCatalog: () => void;
}

const brandLogos = [
  'SWAROVSKI', 'PANDORA', 'D1 MILANO', 'TOMMY HILFIGER',
  'Calvin Klein', 'TISSOT', 'PIERRE LANNIER',
];

export function TripleGateway({ onOpenCatalog }: Props) {
  const navigate = useNavigate();

  return (
    <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 max-w-7xl mx-auto">

        {/* ── SWELT.PARTNER ── */}
        <button
          onClick={onOpenCatalog}
          className="group relative overflow-hidden rounded-2xl text-left transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-200/80 via-slate-100/90 to-white/95" />
          <div className="absolute inset-0 backdrop-blur-xl bg-white/[0.45] border border-white/[0.5]" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute -inset-full rotate-12 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
          </div>
          <div className="absolute inset-[1px] rounded-2xl border border-white/[0.3] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-between p-5 lg:p-6 min-h-[220px] sm:min-h-[200px] lg:min-h-[180px]">
            {/* Logo */}
            <div className="flex items-center gap-1.5">
              <img src={logo} alt="Swelt" className="h-8 lg:h-9" draggable={false} />
            </div>

            {/* Live indicator */}
            <div className="flex flex-col items-center gap-1.5 my-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <span className="text-slate-700 text-sm font-medium tracking-wide">Live Katalog 2026</span>
              </div>
              <p className="text-slate-500 text-xs text-center">Access to wholesale katalog</p>
            </div>

            {/* CTA */}
            <span className="inline-flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-5 py-2 transition-colors shadow-md">
              Get Live Offers
              <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>

            {/* Brand logos row */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3 opacity-60">
              {brandLogos.map((name) => (
                <span key={name} className="text-[10px] lg:text-xs font-bold text-slate-600 tracking-wider uppercase whitespace-nowrap">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </button>

        {/* ── SWELT.DROPSHIPPING ── */}
        <button
          onClick={() => navigate('/dropshipping')}
          className="group relative overflow-hidden rounded-2xl text-left transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700/80 via-blue-800/90 to-indigo-900/95" />
          <div className="absolute inset-0 backdrop-blur-xl bg-white/[0.08] border border-white/[0.15]" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute -inset-full rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
          </div>
          <div className="absolute inset-[1px] rounded-2xl border border-white/[0.08] pointer-events-none" />
          <img src={logo} alt="" className="absolute right-3 bottom-3 w-14 opacity-[0.07] pointer-events-none select-none" draggable={false} />

          <div className="relative z-10 p-5 lg:p-6 flex flex-col min-h-[220px] sm:min-h-[200px] lg:min-h-[180px] justify-between">
            <div>
              <span className="inline-block text-white/60 text-xs font-medium tracking-[0.2em] uppercase mb-2">Swelt.dropshipping</span>
              <h3 className="text-white font-bold text-base lg:text-lg tracking-wide leading-tight">EXPEDICE BEZ STAROSTÍ</h3>
            </div>
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed mt-2">
              Prodávejte, my se postaráme o zbytek. Logistika, balení a odesílání pod vaší značkou přímo ke koncovému zákazníkovi.
            </p>
            <div className="mt-3 flex items-center gap-2 text-white/50 group-hover:text-white/80 transition-colors text-sm">
              <span>Vstoupit</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>

        {/* ── SWELT.LUXURY ── */}
        <button
          onClick={() => navigate('/luxury')}
          className="group relative overflow-hidden rounded-2xl text-left transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-800/80 via-yellow-900/90 to-stone-900/95" />
          <div className="absolute inset-0 backdrop-blur-xl bg-white/[0.08] border border-white/[0.15]" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute -inset-full rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
          </div>
          <div className="absolute inset-[1px] rounded-2xl border border-white/[0.08] pointer-events-none" />
          <img src={logo} alt="" className="absolute right-3 bottom-3 w-14 opacity-[0.07] pointer-events-none select-none" draggable={false} />

          <div className="relative z-10 p-5 lg:p-6 flex flex-col min-h-[220px] sm:min-h-[200px] lg:min-h-[180px] justify-between">
            <div>
              <span className="inline-block text-white/60 text-xs font-medium tracking-[0.2em] uppercase mb-2">Swelt.luxury</span>
              <h3 className="text-white font-bold text-base lg:text-lg tracking-wide leading-tight">PRIVÁTNÍ NÁKUPY</h3>
            </div>
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed mt-2">
              Segment vysoké hodinařiny bez nutnosti minimálních odběrů. Máte IČO? Poptávka na jediný kus luxusních značek začíná zde.
            </p>
            <div className="mt-3 flex items-center gap-2 text-white/50 group-hover:text-white/80 transition-colors text-sm">
              <span>Vstoupit</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>

      </div>
    </div>
  );
}
