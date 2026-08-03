import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, ChevronLeft, ChevronRight, Lock, TrendingUp, Zap } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { CountdownTimer } from '@/components/deals/CountdownTimer';
import { dealsI18n } from '@/lib/i18n-deals';
import { useStore } from '@/lib/store';
import type { DealTileItem } from '@/lib/dealCatalog';

/**
 * Hero pás bannerů nad katalogem — přímý protějšek promo karuselu na Woltu:
 * široké karty s přesahem sousedů (peek), scroll-snap, kulaté šipky přes
 * okraje a tečkový indikátor. Místo fotek jídla drží Swelt vlastní jazyk:
 * tmavá karta dealu, gradientová karta PRO a klidná karta alertů.
 */
export function DealHeroCarousel({
  featured,
  onAlerts,
  onHow,
}: {
  /** Nejnaléhavější dlaždice (živá dávka, jinak nejbližší připravovaná). */
  featured?: DealTileItem;
  onAlerts: () => void;
  onHow: () => void;
}) {
  const lang = useStore((s) => s.lang);
  const t = dealsI18n[lang];
  const p = t.catalog.promo;

  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const slides: ReactNode[] = [];
  if (featured) slides.push(<FeaturedSlide key="featured" item={featured} lang={lang} />);
  slides.push(
    <PromoSlide
      key="pro"
      tone="gradient"
      icon={<Zap className="h-4 w-4" />}
      eyebrow="PRO"
      title={p.proTitle}
      sub={p.proSub}
      cta={p.proCta}
      to="/#gbd-pricing"
    />,
    <PromoSlide
      key="alerts"
      tone="light"
      icon={<Bell className="h-4 w-4" />}
      eyebrow="Alerts"
      title={p.alertTitle}
      sub={p.alertSub}
      cta={p.alertCta}
      onClick={onAlerts}
    />,
    <PromoSlide
      key="how"
      tone="dark"
      icon={<TrendingUp className="h-4 w-4" />}
      eyebrow="How it works"
      title={p.howTitle}
      sub={p.howSub}
      cta={p.howCta}
      onClick={onHow}
    />,
  );

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-slide]');
    const step = card ? card.offsetWidth + 16 : el.clientWidth;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  // Tečky sledují pozici scrollu (na dotyku je swipe jediné ovládání).
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const card = el.querySelector<HTMLElement>('[data-slide]');
      const step = card ? card.offsetWidth + 16 : el.clientWidth;
      setActive(Math.round(el.scrollLeft / step));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="group relative min-w-0 py-2">
      <div
        ref={track}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 sm:px-8 lg:px-12
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            data-slide
            className="w-[min(86vw,780px)] shrink-0 snap-start"
          >
            {slide}
          </div>
        ))}
      </div>

      {/* šipky přes okraje pásu — jako na Woltu, na mobilu se swipuje */}
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Předchozí"
        className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#0B1215]/80 text-white ring-1 ring-white/15 shadow-lg backdrop-blur transition-all hover:bg-white/10 sm:flex lg:left-5"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Další"
        className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#0B1215]/80 text-white ring-1 ring-white/15 shadow-lg backdrop-blur transition-all hover:bg-white/10 sm:flex lg:right-5"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* tečky na černé ploše — aktivní bílá, ostatní tlumené */}
      <div className="mt-1 flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/25'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/** Banner nejnaléhavější dávky — tmavá karta s logem koncernu a odpočtem. */
function FeaturedSlide({ item, lang }: { item: DealTileItem; lang: 'cs' | string }) {
  const t = dealsI18n[lang as 'cs'];
  const live = item.kind === 'live';

  const inner = (
    /* tmavá glass karta — stejný tón jako všechny karty katalogu */
    <div className="relative flex h-[240px] flex-col justify-between overflow-hidden rounded-[24px] bg-white/[0.04] p-6 ring-1 ring-white/10 transition-transform duration-300 hover:scale-[1.005] sm:h-[300px] sm:p-8">
      {item.heroImageUrl && (
        /* kampaňová fotka dealu + tmavý scrim, aby bílé texty zůstaly čitelné */
        <>
          <img
            src={item.heroImageUrl}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10"
          />
        </>
      )}
      <div className="relative flex items-start justify-between gap-4">
        {item.concernDomain ? (
          <BrandLogo
            name={item.concernName ?? item.supplier}
            domain={item.concernDomain}
            width={280}
            height={120}
            className="max-h-7 max-w-[150px] object-contain opacity-90 [filter:brightness(0)_invert(1)]"
            fallbackClassName="text-sm font-bold text-white"
          />
        ) : (
          <span className="text-sm font-bold text-white">{item.supplier}</span>
        )}
        {live && item.deadline ? (
          <CountdownTimer deadline={item.deadline} variant="compact" lang={lang as 'cs'} />
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
            <Lock className="h-3 w-3" /> {t.catalog.tile.upcoming}
          </span>
        )}
      </div>

      <div className="relative">
        <h2 className="max-w-[18ch] font-sans text-2xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
          {item.title}
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {item.maxDiscount > 0 && (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-zinc-900">
              −{item.maxDiscount} %
            </span>
          )}
          {item.brands.slice(0, 3).map((b) => (
            <span key={b} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-zinc-200">
              {b}
            </span>
          ))}
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900">
            {t.card.view} <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );

  return item.slug ? <Link to={`/deals/${item.slug}`} className="block">{inner}</Link> : inner;
}

/** Promo banner (PRO / alerty / vysvětlení) — tři tóny, jinak stejná kostra. */
function PromoSlide({
  tone, icon, eyebrow, title, sub, cta, to, onClick,
}: {
  tone: 'gradient' | 'light' | 'dark';
  icon: ReactNode;
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  to?: string;
  onClick?: () => void;
}) {
  /* jednotný dashboard tón (pokyn Tomka) — všechny promo karty stejné tmavé
     glass jako zbytek katalogu; `tone` zůstává v signatuře pro volající,
     barvu už neřídí */
  void tone;
  const shell = 'bg-white/[0.04] text-white ring-1 ring-white/10';
  const ctaClass = 'bg-white text-zinc-900 hover:bg-zinc-200';
  const subClass = 'text-zinc-400';

  const content = (
    <div className={`relative flex h-[240px] flex-col justify-between overflow-hidden rounded-[24px] p-6 transition-transform duration-300 hover:scale-[1.005] sm:h-[300px] sm:p-8 ${shell}`}>
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white ring-1 ring-white/15">
        {icon} {eyebrow}
      </span>
      <div>
        <h2 className="max-w-[20ch] font-sans text-2xl font-semibold leading-tight tracking-tight sm:text-[2rem]">
          {title}
        </h2>
        <p className={`mt-3 max-w-[46ch] text-sm leading-relaxed ${subClass}`}>{sub}</p>
        <span className={`mt-5 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${ctaClass}`}>
          {cta} <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </div>
  );

  if (to) return <Link to={to} className="block">{content}</Link>;
  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      {content}
    </button>
  );
}
