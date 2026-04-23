export interface ProductParam {
  nazev: string;
  hodnota: string;
}

export interface Product {
  id: string;
  name: string;
  manufacturer: string;
  sku: string;
  ean: string;
  description: string;
  short_description?: string;
  category: string;
  img: string;
  image_urls?: string[];
  price: number;
  wholesale: number;
  stock: number;
  inStock: boolean;
  params?: ProductParam[];
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
