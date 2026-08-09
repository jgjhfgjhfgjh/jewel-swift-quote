import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  acceptWantOffer, fetchOffersForBuyer, fetchOpenWantDeals, wantDealsTable, wantOffersTable,
  type WantDealRow, type WantKind, type WantListing, type WantOfferRow,
} from '@/lib/wantDeals';

export interface NewWantDeal {
  kind: WantKind;
  title: string;
  qty: number;
  targetPrice: number | null;
  note: string;
  deadline: string | null;
}

/**
 * WantDeal — poptávkové inzeráty a reverzní aukce.
 *
 * Hook drží tři pohledy, které se nesmí míchat:
 *  • `listings` — VEŘEJNÝ seznam otevřených poptávek z RPC (bez identit),
 *  • `mine`     — moje vlastní poptávky (RLS pouští jen je),
 *  • `offers`   — nabídky na jednu MOJI poptávku, opět bez identity
 *                 prodávajícího; načítají se až na vyžádání.
 *
 * Zápisy jdou přímo do tabulek (RLS hlídá, že si každý píše jen svoje),
 * přijetí nabídky přes RPC, protože musí zároveň zamítnout ostatní a uzavřít
 * poptávku — to je jedna transakce, ne tři klientské dotazy.
 */
export function useWantDeals() {
  const { user, profile } = useAuthContext();
  const [listings, setListings] = useState<WantListing[]>([]);
  const [mine, setMine] = useState<WantDealRow[]>([]);
  const [offers, setOffers] = useState<Record<string, WantOfferRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data } = await fetchOpenWantDeals();
    setListings(((data as WantListing[]) ?? []).map((r) => ({
      ...r,
      brands: Array.isArray(r.brands) ? r.brands : [],
      offers_count: Number(r.offers_count ?? 0),
      target_price: r.target_price === null ? null : Number(r.target_price),
      best_price: r.best_price === null || r.best_price === undefined ? null : Number(r.best_price),
      my_offer: r.my_offer === null || r.my_offer === undefined ? null : Number(r.my_offer),
    })));

    if (user) {
      const { data: own } = await wantDealsTable()
        .select('*')
        .order('created_at', { ascending: false });
      setMine((own as WantDealRow[]) ?? []);
    } else {
      setMine([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { void reload(); }, [reload]);

  /** Zveřejnit poptávku. Země jde z profilu — je to jediný údaj o kupujícím,
      který se ukazuje veřejně (trh potřebuje vědět, kam by se dodávalo). */
  const publish = useCallback(async (input: NewWantDeal) => {
    if (!user) return false;
    setBusy('publish');
    const { error } = await wantDealsTable().insert({
      buyer_user_id: user.id,
      kind: input.kind,
      title: input.title,
      qty: input.qty,
      target_price: input.kind === 'auction' ? input.targetPrice : null,
      note: input.note || null,
      deadline: input.deadline,
      country: profile?.country ?? null,
    });
    await reload();
    setBusy(null);
    return !error;
  }, [user, profile, reload]);

  /** Uzavřít vlastní poptávku — zmizí z veřejného seznamu. */
  const close = useCallback(async (id: string) => {
    if (!user) return false;
    setBusy(id);
    const { error } = await wantDealsTable()
      .update({ status: 'closed', updated_at: new Date().toISOString() })
      .eq('id', id);
    await reload();
    setBusy(null);
    return !error;
  }, [user, reload]);

  /** Nabídnout cenu (upsert — druhá nabídka přepíše tu první). */
  const makeOffer = useCallback(async (wantDealId: string, unitPrice: number, qty: number, note = '') => {
    if (!user || unitPrice <= 0 || qty <= 0) return false;
    setBusy(wantDealId);
    const { error } = await wantOffersTable().upsert(
      {
        want_deal_id: wantDealId,
        seller_user_id: user.id,
        unit_price: unitPrice,
        qty,
        note: note || null,
        status: 'sent',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'want_deal_id,seller_user_id' },
    );
    await reload();
    setBusy(null);
    return !error;
  }, [user, reload]);

  /** Načíst nabídky na MOJI poptávku (bez identity prodávajícího). */
  const loadOffers = useCallback(async (wantDealId: string) => {
    const { data } = await fetchOffersForBuyer(wantDealId);
    setOffers((o) => ({ ...o, [wantDealId]: (data as WantOfferRow[]) ?? [] }));
  }, []);

  /** Přijmout nabídku — ostatní se zamítnou a poptávka se uzavře. */
  const accept = useCallback(async (wantDealId: string, offerId: string) => {
    setBusy(offerId);
    const { error } = await acceptWantOffer(offerId);
    await loadOffers(wantDealId);
    await reload();
    setBusy(null);
    return !error;
  }, [loadOffers, reload]);

  return { listings, mine, offers, loading, busy, publish, close, makeOffer, loadOffers, accept, reload };
}
