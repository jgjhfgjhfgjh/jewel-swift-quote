export interface Product {
  id: string;
  name: string;
  manufacturer: string;
  sku: string;
  ean: string;
  description: string;
  category: string;
  img: string;
  price: number;
  wholesale: number;
  stock: number;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercent: number;
}

export interface BrandDiscount {
  brand: string;
  percent: number;
}
