import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { useStockCount } from '@/hooks/useStockCount';
import { useAuthContext } from '@/contexts/AuthContext';

/** Live countdown to the 24h approval deadline of a submitted B2B registration */
function ApprovalCountdown({ requestedAt }: { requestedAt: string }) {
  const deadline = new Date(requestedAt).getTime() + 24 * 60 * 60 * 1000;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = Math.max(0, deadline - now);
  if (left === 0) return <>Schvalování probíhá…</>;
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(left / 3_600_000);
  const m = Math.floor(left / 60_000) % 60;
  const s = Math.floor(left / 1_000) % 60;
  return <>Schválení za <span className="tabular-nums">{pad(h)}:{pad(m)}:{pad(s)}</span></>;
}

/** Full homepage hero — logo, tagline, CTAs, bullets. Sits between the banner and the apps cards. */
export function HomeHero() {
  const openAuthModal = useStore((s) => s.openAuthModal);
  const setViewMode = useStore((s) => s.setViewMode);
  const navigate = useNavigate();
  const { user, role, profile, isB2bApproved } = useAuthContext();

  // B2B CTA: přihlášený → doplnit údaje v nastavení účtu (tam se i spustí 24h odpočet);
  // nepřihlášený → registrační popup. Tím se přihlášený uživatel už nikdy znovu
  // neregistruje od nuly (a nevznikne „ztracený" účet jako dřív).
  const handleB2BCta = () => {
    if (user) navigate('/ucet');
    else openAuthModal('b2b');
  };
  // Live in-stock product count for the KATALOG CTA badge (approved B2B partners only).
  const stockCount = useStockCount(!!isB2bApproved);

  // B2B lead = submitted B2B registration (lead with IČO), waiting for approval.
  // A plain lead (quick account, no IČO) is not waiting for anything.
  const isB2bLead = !!user && role === 'lead' && !!profile?.ico?.trim();

  // Logged in → straight into the catalog; logged out → create-account modal
  const openCatalog = () => {
    if (user) {
      setViewMode('catalog');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      openAuthModal('register');
    }
  };

  return (
    <div className="mt-6 sm:mt-8 flex flex-col items-center px-6 text-center">
      {/* CTAs — compact, light */}
      <div className="flex flex-col gap-2.5 justify-center w-full max-w-[280px] mx-auto">
        {/* B2B CTA — hidden for approved partners. A B2B lead (registration
            submitted) sees a live 24h countdown instead of a clickable CTA;
            other logged-in users get a "finish your registration" nudge. */}
        {!isB2bApproved && (isB2bLead ? (
          <div className="font-display w-full px-8 py-3 rounded-none bg-[#17191c]/80 backdrop-blur-md text-white font-semibold text-sm shadow-lg text-center cursor-default select-none tabular-nums">
            <ApprovalCountdown requestedAt={profile!.created_at} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 w-full">
            <Button className="h-10 w-full gap-2 px-6 text-sm" onClick={handleB2BCta}>
              {user ? 'Dokonči B2B registraci' : 'B2B registrace'} <ArrowRight className="h-4 w-4" />
            </Button>
            {/* Pure-information label — stejný font/velikost jako text pod CTA v brand detailu */}
            <span className="text-[11px] text-muted-foreground">
              Schválení do <span className="tabular-nums">24 h</span>
            </span>
          </div>
        ))}
        {isB2bApproved ? (
          /* Approved B2B partners (the only ones left with a standalone catalog
             button) → same dark KATALOG CTA as the navbar, with the live
             in-stock count label. */
          <div className="flex flex-col items-center gap-1.5 w-full">
            <Button className="h-10 w-full gap-2 px-6 text-sm" onClick={openCatalog}>
              KATALOG 2026 <ArrowRight className="h-4 w-4" />
            </Button>
            {/* Pure-information label — stejný font/velikost jako text pod CTA v brand detailu */}
            {stockCount != null && stockCount > 0 && (
              <span className="text-[11px] text-muted-foreground">
                <span className="tabular-nums">{stockCount.toLocaleString('cs-CZ')}</span> skladem
              </span>
            )}
          </div>
        ) : (
          <Button variant="outline" className="h-10 w-full gap-2 px-6 text-sm" onClick={openCatalog}>
            Prohlédnout katalog
          </Button>
        )}
      </div>

      {/* Bullets — approved partners get next-step nudges instead of signup reassurances */}
      {isB2bApproved ? (
        <ul className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-foreground/60">
          <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Využij DEAL nabídky</li>
          <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Napoj se na feed</li>
          <li className="hidden sm:flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Spusť e-shop do 48 h</li>
          <li className="hidden sm:flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Prodávej bez skladu</li>
        </ul>
      ) : (
        <ul className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-foreground/60">
          <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Registrace zdarma</li>
          <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Schválení do 24 hodin</li>
          <li className="hidden sm:flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Bez závazků</li>
          <li className="hidden sm:flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Bez kreditní karty</li>
        </ul>
      )}
    </div>
  );
}
