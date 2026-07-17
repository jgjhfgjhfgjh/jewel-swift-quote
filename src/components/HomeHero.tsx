import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
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
  const navigate = useNavigate();
  const { user, role, profile, isB2bApproved } = useAuthContext();

  // B2B CTA: přihlášený → doplnit údaje v nastavení účtu (tam se i spustí 24h odpočet);
  // nepřihlášený → registrační popup. Tím se přihlášený uživatel už nikdy znovu
  // neregistruje od nuly (a nevznikne „ztracený" účet jako dřív).
  const handleB2BCta = () => {
    if (user) navigate('/ucet');
    else openAuthModal('b2b');
  };

  // B2B lead = submitted B2B registration (lead with IČO), waiting for approval.
  // A plain lead (quick account, no IČO) is not waiting for anything.
  const isB2bLead = !!user && role === 'lead' && !!profile?.ico?.trim();

  // Pozn.: CTA katalogu (KATALOG 2026 / Katalog bez registrace) bylo trvale
  // přesunuto na hero kartu „Katalog 2026" v AppsCards — včetně chování ve
  // všech režimech (host / přihlášený / schválený B2B).

  return (
    <div className="flex flex-col items-center px-6 text-center">
      {isB2bApproved ? (
        /* Approved B2B partners → next-step nudges (catalog CTA lives in AppsCards) */
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-foreground/60">
          <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Využij DEAL nabídky</li>
          <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Napoj se na feed</li>
          <li className="hidden sm:flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Prodávej bez skladu</li>
        </ul>
      ) : (
        /* Guest / lead → B2B CTA + bullets */
        <>
          {/* 1) B2B registrace (nebo živý odpočet u podané žádosti) — iOS pilulka */}
          <div className="w-full max-w-[300px]">
            {isB2bLead ? (
              <div className="font-display w-full px-8 py-3.5 rounded-full bg-[#17191c]/80 backdrop-blur-md text-white font-semibold text-sm shadow-lg text-center cursor-default select-none tabular-nums">
                <ApprovalCountdown requestedAt={profile!.created_at} />
              </div>
            ) : (
              <Button
                className="h-12 w-full gap-2 rounded-full bg-black px-8 text-[15px] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] transition-all hover:bg-zinc-800"
                onClick={handleB2BCta}
              >
                {user ? 'Dokonči B2B registraci' : 'B2B registrace'} <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* 2) Trust texty pod CTA (anglicky) — stejná mezera jako nad CTA,
              takže pilulka je na svislém středu mezi karuselem a fajfkami */}
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-foreground/60 sm:mt-14">
            <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Free registration</li>
            <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> Approval within 24 hours</li>
            <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" strokeWidth={3} /> No commitment</li>
          </ul>
        </>
      )}
    </div>
  );
}
