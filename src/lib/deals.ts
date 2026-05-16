/**
 * Deals (closeout offers) — shared types and tier-pricing logic.
 * Kept fully separate from the main product catalog.
 */
import { supabase } from '@/integrations/supabase/client';

export interface DealTier {
  min_qty: number;
  discount_percent: number;
}

export type DealCategory = 'watches' | 'jewelry' | 'general';
export type DealStatus = 'draft' | 'active' | 'ended';

export interface Deal {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: DealCategory;
  supplier: string;
  description: string;
  hero_image_url: string | null;
  brands: string[];
  currency: string;
  tiers: DealTier[];
  deposit_percent: number;
  delivery_weeks_min: number;
  delivery_weeks_max: number;
  payment_terms: string;
  starts_at: string;
  deadline: string;
  status: DealStatus;
  created_at: string;
  updated_at: string;
}

export interface DealProduct {
  id: string;
  deal_id: string;
  brand: string;
  sku: string;
  ean: string;
  gender: string;
  collection: string;
  item_status: string;
  attr_movement: string;
  attr_material: string;
  attr_size: string;
  retail_price: number;
  wholesale_tier1: number;
  wholesale_tier2: number;
  wholesale_tier3: number;
  available: number;
  image_url: string | null;
  sort_order: number;
}

/** Loosely-typed table accessors — the generated Database type does not yet
 *  include the new deal tables, so we bypass its table-name checking here.
 *  Callers cast `.data` to the Deal / DealProduct interfaces above. */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const dealsTable = () => supabase.from('deals' as never) as any;
export const dealProductsTable = () => supabase.from('deal_products' as never) as any;
/* eslint-enable @typescript-eslint/no-explicit-any */

export const DEFAULT_TIERS: DealTier[] = [
  { min_qty: 50, discount_percent: 66 },
  { min_qty: 100, discount_percent: 67 },
  { min_qty: 200, discount_percent: 68 },
];

/** Sort tiers ascending by min_qty (defensive — admin input may be unordered). */
export function sortedTiers(tiers: DealTier[]): DealTier[] {
  return [...tiers].sort((a, b) => a.min_qty - b.min_qty);
}

/** Index of the highest tier already unlocked by `qty`. -1 = none yet. */
export function activeTierIndex(qty: number, tiers: DealTier[]): number {
  const t = sortedTiers(tiers);
  let idx = -1;
  for (let i = 0; i < t.length; i++) {
    if (qty >= t[i].min_qty) idx = i;
  }
  return idx;
}

/** Wholesale unit price of a product for a given tier index (0-2). */
export function wholesaleForTierIndex(p: DealProduct, tierIndex: number): number {
  if (tierIndex >= 2) return p.wholesale_tier3;
  if (tierIndex === 1) return p.wholesale_tier2;
  return p.wholesale_tier1; // tierIndex 0 or -1 → entry price
}

export interface DealProgress {
  qty: number;
  /** Index of unlocked tier, -1 before the first threshold. */
  activeIndex: number;
  /** The tier currently in effect (entry tier shown before first unlock). */
  effectiveTier: DealTier;
  /** Next tier still to unlock, or null at the top. */
  nextTier: DealTier | null;
  /** Units still needed to unlock the next tier (0 at the top). */
  remainingToNext: number;
  /** 0-100 — fill toward the next threshold (or 100 at the top). */
  percentToNext: number;
  /** 0-100 — overall fill across the whole tier ladder. */
  percentOverall: number;
  /** True once the minimum valid order (first tier) is reached. */
  minimumReached: boolean;
}

/** Compute everything the FOMO progress bar needs from a deal + total qty. */
export function dealProgress(qty: number, tiers: DealTier[]): DealProgress {
  const t = sortedTiers(tiers.length ? tiers : DEFAULT_TIERS);
  const activeIndex = activeTierIndex(qty, t);
  const effectiveTier = t[Math.max(activeIndex, 0)];
  const nextTier = activeIndex + 1 < t.length ? t[activeIndex + 1] : null;
  const prevThreshold = activeIndex >= 0 ? t[activeIndex].min_qty : 0;
  const remainingToNext = nextTier ? Math.max(0, nextTier.min_qty - qty) : 0;
  const span = nextTier ? nextTier.min_qty - prevThreshold : 1;
  const percentToNext = nextTier
    ? Math.min(100, ((qty - prevThreshold) / span) * 100)
    : 100;
  const topThreshold = t[t.length - 1].min_qty;
  const percentOverall = Math.min(100, (qty / topThreshold) * 100);
  return {
    qty,
    activeIndex,
    effectiveTier,
    nextTier,
    remainingToNext,
    percentToNext,
    percentOverall,
    minimumReached: activeIndex >= 0,
  };
}

/** Build a URL-friendly slug from an arbitrary title. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'deal';
}

export function dealIsLive(deal: Pick<Deal, 'status' | 'deadline'>): boolean {
  return deal.status === 'active' && new Date(deal.deadline).getTime() > Date.now();
}
