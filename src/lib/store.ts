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
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      lang: 'cs',
      setLang: (lang) => set({ lang }),
      isAdmin: false,
      setAdmin: (v) => set({ isAdmin: v }),

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
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        lang: state.lang,
        isAdmin: state.isAdmin,
        cart: state.cart,
        brandDiscounts: state.brandDiscounts,
        productDiscounts: state.productDiscounts,
        search: state.search,
        selectedBrands: state.selectedBrands,
        selectedCategory: state.selectedCategory,
        stockOnly: state.stockOnly,
        minDiscount: state.minDiscount,
      }),
    }
  )
);
