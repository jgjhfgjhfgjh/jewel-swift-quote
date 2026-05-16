import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, BrandDiscount, Product } from './types';
import type { Lang } from './i18n';

export interface SalesCustomer {
  user_id: string;
  company_name: string;
  ico: string | null;
  base_discount: number;
}

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  isAdmin: boolean;
  setAdmin: (v: boolean) => void;

  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  setItemDiscount: (productId: string, percent: number | undefined) => void;
  clearCart: () => void;

  // Deal order carts — keyed by dealId, then productId -> quantity.
  dealCart: Record<string, Record<string, number>>;
  setDealItemQty: (dealId: string, productId: string, qty: number) => void;
  addDealItem: (dealId: string, productId: string) => void;
  removeDealItem: (dealId: string, productId: string) => void;
  clearDealCart: (dealId: string) => void;

  // Individual product discount overrides (single source of truth)
  productDiscounts: Record<string, number>;
  setProductDiscount: (productId: string, percent: number | undefined) => void;

  brandDiscounts: BrandDiscount[];
  setBrandDiscount: (brand: string, percent: number) => void;
  removeBrandDiscount: (brand: string) => void;
  clearAllAdminDiscounts: () => void;

  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  gatewayOpen: boolean;
  setGatewayOpen: (v: boolean) => void;

  // Filter state (persisted)
  search: string;
  setSearch: (v: string) => void;
  selectedBrands: string[];
  setSelectedBrands: (v: string[]) => void;
  selectedCategory: string | null;
  setSelectedCategory: (v: string | null) => void;
  stockOnly: boolean;
  setStockOnly: (v: boolean) => void;
  minDiscount: number;
  setMinDiscount: (v: number) => void;
  selectedGenders: string[];
  setSelectedGenders: (v: string[]) => void;
  selectedParams: Record<string, string[]>;
  setSelectedParams: (v: Record<string, string[]>) => void;

  // View mode
  viewMode: 'home' | 'catalog';
  setViewMode: (v: 'home' | 'catalog') => void;

  // Sales mode
  salesCustomer: SalesCustomer | null;
  salesBrandDiscounts: BrandDiscount[];
  salesProductDiscounts: Record<string, number>;
  setSalesMode: (customer: SalesCustomer, brandDiscounts: BrandDiscount[], productDiscounts: Record<string, number>) => void;
  clearSalesMode: () => void;
  setSalesBrandDiscount: (brand: string, percent: number) => void;
  removeSalesBrandDiscount: (brand: string) => void;
  setSalesProductDiscount: (productId: string, percent: number | undefined) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      lang: 'cs',
      setLang: (lang) => set({ lang }),
      isAdmin: false,
      setAdmin: (v) => set({ isAdmin: v }),

      viewMode: 'home',
      setViewMode: (v) => set({ viewMode: v }),

      cart: [],
      addToCart: (product) => set((s) => {
        const existing = s.cart.find((i) => i.product.id === product.id);
        if (existing) {
          return { cart: s.cart.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) };
        }
        const baseDiscount = product.price > 0 ? ((product.price - product.wholesale) / product.price) * 100 : 0;
        const brandDiscount = s.brandDiscounts.find((d) => d.brand === product.manufacturer);
        return { cart: [...s.cart, { product, quantity: 1, discountPercent: brandDiscount?.percent ?? baseDiscount }] };
      }),
      removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((i) => i.product.id !== id) })),
      updateQuantity: (id, qty) => set((s) => ({
        cart: qty <= 0
          ? s.cart.filter((i) => i.product.id !== id)
          : s.cart.map((i) => i.product.id === id ? { ...i, quantity: Math.min(qty, i.product.stock) } : i),
      })),
      setItemDiscount: (id, percent) => set((s) => {
        const next = { ...s.productDiscounts };
        if (percent === undefined) {
          delete next[id];
        } else {
          next[id] = percent;
        }
        return {
          productDiscounts: next,
          cart: s.cart.map((i) => i.product.id === id ? { ...i, manualDiscountPercent: percent } : i),
        };
      }),
      clearCart: () => set({ cart: [] }),

      dealCart: {},
      setDealItemQty: (dealId, productId, qty) => set((s) => {
        const deal = { ...(s.dealCart[dealId] ?? {}) };
        if (qty <= 0) {
          delete deal[productId];
        } else {
          deal[productId] = qty;
        }
        return { dealCart: { ...s.dealCart, [dealId]: deal } };
      }),
      addDealItem: (dealId, productId) => set((s) => {
        const deal = { ...(s.dealCart[dealId] ?? {}) };
        deal[productId] = (deal[productId] ?? 0) + 1;
        return { dealCart: { ...s.dealCart, [dealId]: deal } };
      }),
      removeDealItem: (dealId, productId) => set((s) => {
        const deal = { ...(s.dealCart[dealId] ?? {}) };
        delete deal[productId];
        return { dealCart: { ...s.dealCart, [dealId]: deal } };
      }),
      clearDealCart: (dealId) => set((s) => {
        const next = { ...s.dealCart };
        delete next[dealId];
        return { dealCart: next };
      }),

      productDiscounts: {},
      setProductDiscount: (id, percent) => set((s) => {
        const next = { ...s.productDiscounts };
        if (percent === undefined) {
          delete next[id];
        } else {
          next[id] = percent;
        }
        // Also sync to cart item if present
        return {
          productDiscounts: next,
          cart: s.cart.map((i) => i.product.id === id ? { ...i, manualDiscountPercent: percent } : i),
        };
      }),

      brandDiscounts: [],
      setBrandDiscount: (brand, percent) => set((s) => {
        const existing = s.brandDiscounts.find((d) => d.brand === brand);
        const newDiscounts = existing
          ? s.brandDiscounts.map((d) => d.brand === brand ? { ...d, percent } : d)
          : [...s.brandDiscounts, { brand, percent }];
        return { brandDiscounts: newDiscounts };
      }),
      removeBrandDiscount: (brand) => set((s) => ({
        brandDiscounts: s.brandDiscounts.filter((d) => d.brand !== brand),
      })),
      clearAllAdminDiscounts: () => set((s) => ({
        brandDiscounts: [],
        productDiscounts: {},
        cart: s.cart.map((i) => ({ ...i, manualDiscountPercent: undefined })),
      })),

      cartOpen: false,
      setCartOpen: (v) => set({ cartOpen: v }),
      sidebarOpen: false,
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      gatewayOpen: false,
      setGatewayOpen: (v) => set({ gatewayOpen: v }),

      // Filter state
      search: '',
      setSearch: (v) => set({ search: v }),
      selectedBrands: [],
      setSelectedBrands: (v) => set({ selectedBrands: v }),
      selectedCategory: null,
      setSelectedCategory: (v) => set({ selectedCategory: v }),
      stockOnly: false,
      setStockOnly: (v) => set({ stockOnly: v }),
      minDiscount: 0,
      setMinDiscount: (v) => set({ minDiscount: v }),
      selectedGenders: [],
      setSelectedGenders: (v) => set({ selectedGenders: v }),
      selectedParams: {},
      setSelectedParams: (v) => set({ selectedParams: v }),

      // Sales mode
      salesCustomer: null,
      salesBrandDiscounts: [],
      salesProductDiscounts: {},
      setSalesMode: (customer, brandDiscounts, productDiscounts) => set({
        salesCustomer: customer,
        salesBrandDiscounts: brandDiscounts,
        salesProductDiscounts: productDiscounts,
      }),
      clearSalesMode: () => set({
        salesCustomer: null,
        salesBrandDiscounts: [],
        salesProductDiscounts: {},
      }),
      setSalesBrandDiscount: (brand, percent) => set((s) => {
        const existing = s.salesBrandDiscounts.find((d) => d.brand === brand);
        return {
          salesBrandDiscounts: existing
            ? s.salesBrandDiscounts.map((d) => d.brand === brand ? { ...d, percent } : d)
            : [...s.salesBrandDiscounts, { brand, percent }],
        };
      }),
      removeSalesBrandDiscount: (brand) => set((s) => ({
        salesBrandDiscounts: s.salesBrandDiscounts.filter((d) => d.brand !== brand),
      })),
      setSalesProductDiscount: (productId, percent) => set((s) => {
        const next = { ...s.salesProductDiscounts };
        if (percent === undefined) {
          delete next[productId];
        } else {
          next[productId] = percent;
        }
        return { salesProductDiscounts: next };
      }),
    }),
    {
      name: 'app-store',
      version: 2,
      partialize: (state) => ({
        lang: state.lang,
        isAdmin: state.isAdmin,
        cart: state.cart,
        dealCart: state.dealCart,
        brandDiscounts: state.brandDiscounts,
        productDiscounts: state.productDiscounts,
        // Filters intentionally NOT persisted — start fresh each session
      }),
    }
  )
);
