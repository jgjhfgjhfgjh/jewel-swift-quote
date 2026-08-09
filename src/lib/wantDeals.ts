import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * WantDeal — OBRÁCENÝ tok: inzerát nezveřejňuje prodávající, ale kupující.
 *
 *  • `wanted`  — „sháním": kupující řekne, co potřebuje, a prodávající se
 *                ozvou s nabídkou,
 *  • `auction` — reverzní aukce: kupující zadá objem a cílovou cenu,
 *                prodávající se podbízejí dolů.
 *
 * ANONYMITA na obou stranách je vlastnost, ne detail: základní tabulky pouští
 * RLS jen vlastníkovi řádku a veřejně se chodí přes RPC, která identitu
 * nevrací vůbec (`want_deals_open`, `want_deal_offers_for_buyer`). Kupující
 * tedy vidí ceny, ne kdo je dal; prodávající vidí poptávku, ne kdo ji podal.
 *
 * U reverzní aukce je veřejná nejlepší (nejnižší) cena — bez ní by se nebylo
 * čeho chytit. U „sháním" jde ven jen počet nabídek.
 *
 * Tabulky nejsou v generovaných typech (soubor je za živou DB pozadu, stejně
 * jako u deal_alerts a split_commitments), proto řádkové typy držíme lokálně.
 */
export type WantKind = 'wanted' | 'auction';

/** Veřejný řádek z `want_deals_open()` — bez identity kupujícího. */
export interface WantListing {
  id: string;
  kind: WantKind;
  title: string;
  brands: string[];
  category: string;
  qty: number;
  target_price: number | null;
  currency: string;
  note: string | null;
  country: string | null;
  deadline: string | null;
  created_at: string;
  offers_count: number;
  /** Nejlepší cena — jen u reverzní aukce. */
  best_price: number | null;
  /** Moje vlastní nabídka na tuhle poptávku (null = zatím žádná). */
  my_offer: number | null;
}

/** Vlastní poptávka kupujícího (čte se z tabulky, RLS pouští jen svoje). */
export interface WantDealRow {
  id: string;
  buyer_user_id: string;
  kind: WantKind;
  title: string;
  qty: number;
  target_price: number | null;
  currency: string;
  note: string | null;
  deadline: string | null;
  status: 'open' | 'awarded' | 'closed' | 'cancelled';
  created_at: string;
}

/** Nabídka na moji poptávku — bez identity prodávajícího. */
export interface WantOfferRow {
  id: string;
  unit_price: number;
  qty: number;
  note: string | null;
  status: 'sent' | 'accepted' | 'declined' | 'withdrawn';
  created_at: string;
}

const db = supabase as unknown as SupabaseClient;

export const wantDealsTable = () => db.from('want_deals');
export const wantOffersTable = () => db.from('want_deal_offers');
export const fetchOpenWantDeals = () => db.rpc('want_deals_open');
export const fetchOffersForBuyer = (wantDealId: string) =>
  db.rpc('want_deal_offers_for_buyer', { p_want_deal_id: wantDealId });
export const acceptWantOffer = (offerId: string) =>
  db.rpc('want_deal_accept_offer', { p_offer_id: offerId });
