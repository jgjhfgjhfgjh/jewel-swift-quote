import { create } from 'zustand';
import type { CartItem, BrandDiscount, Product } from './types';
import type { Lang } from './i18n';

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  isAdmin: boolean;
  setAdmin: (v: boolean) => void;

  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;

  brandDiscounts: BrandDiscount[];
  setBrandDiscount: (brand: string, percent: number) => void;
  removeBrandDiscount: (brand: string) => void;

  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  lang: 'cs',
  setLang: (lang) => set({ lang }),
  isAdmin: false,
  toggleAdmin: () => set((s) => ({ isAdmin: !s.isAdmin })),

  cart: [],
  addToCart: (product) => set((s) => {
    const existing = s.cart.find((i) => i.product.id === product.id);
    if (existing) {
      return { cart: s.cart.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) };
    }
    const discount = s.brandDiscounts.find((d) => d.brand === product.manufacturer);
    return { cart: [...s.cart, { product, quantity: 1, discountPercent: discount?.percent || 0 }] };
  }),
  removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((i) => i.product.id !== id) })),
  updateQuantity: (id, qty) => set((s) => ({
    cart: qty <= 0 ? s.cart.filter((i) => i.product.id !== id) : s.cart.map((i) => i.product.id === id ? { ...i, quantity: qty } : i),
  })),
  clearCart: () => set({ cart: [] }),

  brandDiscounts: [],
  setBrandDiscount: (brand, percent) => set((s) => {
    const existing = s.brandDiscounts.find((d) => d.brand === brand);
    const newDiscounts = existing
      ? s.brandDiscounts.map((d) => d.brand === brand ? { ...d, percent } : d)
      : [...s.brandDiscounts, { brand, percent }];
    // Update cart items for this brand
    const newCart = s.cart.map((i) => i.product.manufacturer === brand ? { ...i, discountPercent: percent } : i);
    return { brandDiscounts: newDiscounts, cart: newCart };
  }),
  removeBrandDiscount: (brand) => set((s) => ({
    brandDiscounts: s.brandDiscounts.filter((d) => d.brand !== brand),
    cart: s.cart.map((i) => i.product.manufacturer === brand ? { ...i, discountPercent: 0 } : i),
  })),

  cartOpen: false,
  setCartOpen: (v) => set({ cartOpen: v }),
  sidebarOpen: false,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
}));
