import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

const PAGE_SIZE = 60;

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Hodinky: ['hodinky', 'watches', 'hodin'],
  Šperky: ['šperky', 'jewelry', 'bijoux', 'jewels', 'šperk'],
  Příslušenství: ['příslušenství', 'accessories', 'strap', 'box'],
};

export interface SearchFilters {
  search: string;
  selectedBrands: string[];
  selectedCategory: string | null;
  stockOnly: boolean;
  minDiscount: number;
  selectedGenders: string[];
  selectedParams: Record<string, string[]>;
  /** Restrict results to these UUIDs (for Favorites). null/undefined = no restriction. */
  ids?: string[] | null;
}

interface SearchRow {
  total_count: number;
  id: string;
  sku: string;
  ean: string | null;
  product_name: string | null;
  manufacturer: string | null;
  category_text: string | null;
  long_description: string | null;
  short_description: string | null;
  retail_price: number | null;
  wholesale_price: number | null;
  wholesale_discount: string | null;
  stock: number | null;
  image_url: string | null;
  image_urls: string[] | null;
}

function rowToProduct(row: SearchRow): Product {
  return {
    id: row.id,
    name: row.product_name || row.sku,
    manufacturer: row.manufacturer || '',
    sku: row.sku,
    ean: row.ean || '',
    description: row.long_description || '',
    short_description: row.short_description || undefined,
    category: row.category_text || '',
    img: row.image_url || '',
    image_urls: row.image_urls ?? [],
    price: Number(row.retail_price ?? 0),
    wholesale: Number(row.wholesale_price ?? 0),
    stock: row.stock ?? 0,
    inStock: (row.stock ?? 0) > 0,
  };
}

function buildArgs(filters: SearchFilters, offset: number, limit: number) {
  const activeBrands = filters.selectedBrands.length > 0 ? filters.selectedBrands : null;
  const activeGenders = filters.selectedGenders.length > 0 ? filters.selectedGenders : null;
  const paramEntries = Object.entries(filters.selectedParams).filter(([, v]) => v.length > 0);
  const activeParams = paramEntries.length > 0 ? Object.fromEntries(paramEntries) : null;
  const catKeywords = filters.selectedCategory ? CATEGORY_KEYWORDS[filters.selectedCategory] ?? null : null;
  const activeIds = filters.ids && filters.ids.length > 0 ? filters.ids : null;

  return {
    p_search: filters.search.trim() || null,
    p_brands: activeBrands,
    p_category_keywords: catKeywords,
    p_stock_only: !!filters.stockOnly,
    p_min_discount: filters.minDiscount || 0,
    p_genders: activeGenders,
    p_params: activeParams,
    p_ids: activeIds,
    p_limit: limit,
    p_offset: offset,
  };
}

export function useProductSearch(filters: SearchFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const offsetRef = useRef(0);
  const reqIdRef = useRef(0);

  // Serialize filters so the effect compares value-stable
  const filtersKey = JSON.stringify({
    s: filters.search,
    b: filters.selectedBrands,
    c: filters.selectedCategory,
    so: filters.stockOnly,
    md: filters.minDiscount,
    g: filters.selectedGenders,
    p: filters.selectedParams,
    i: filters.ids ?? null,
  });

  useEffect(() => {
    // If favorites mode and no IDs, short-circuit
    if (filters.ids && filters.ids.length === 0) {
      setProducts([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    const myReq = ++reqIdRef.current;
    setLoading(true);
    offsetRef.current = 0;

    (supabase as any)
      .rpc('search_products', buildArgs(filters, 0, PAGE_SIZE))
      .then(({ data, error }: { data: SearchRow[] | null; error: unknown }) => {
        if (myReq !== reqIdRef.current) return; // stale
        if (error || !data) {
          setProducts([]);
          setTotalCount(0);
          setLoading(false);
          return;
        }
        setTotalCount(data[0]?.total_count ?? 0);
        setProducts(data.map(rowToProduct));
        offsetRef.current = data.length;
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  const loadMore = async () => {
    if (loadingMore || loading) return;
    if (products.length >= totalCount) return;
    const myReq = reqIdRef.current;
    setLoadingMore(true);
    const { data, error } = await (supabase as any)
      .rpc('search_products', buildArgs(filters, offsetRef.current, PAGE_SIZE)) as
      { data: SearchRow[] | null; error: unknown };
    if (myReq !== reqIdRef.current) return; // stale
    if (!error && data) {
      setProducts((prev) => [...prev, ...data.map(rowToProduct)]);
      offsetRef.current += data.length;
    }
    setLoadingMore(false);
  };

  return {
    products,
    totalCount,
    loading,
    loadingMore,
    hasMore: products.length < totalCount,
    loadMore,
  };
}
