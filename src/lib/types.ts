export interface Product {
  id: string;
  name: string;
  manufacturer: string;
  sku: string;
  ean: string;
  description: string;
  category: string;
  img: string;
  /** Optional additional product images. When present, gallery shows them as carousel slides. */
  images?: string[];
  price: number;
  wholesale: number;
  stock: number;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercent: number;
  /** @deprecated Use productDiscounts in store instead */
  manualDiscountPercent?: number;
}

export interface BrandDiscount {
  brand: string;
  percent: number;
}
