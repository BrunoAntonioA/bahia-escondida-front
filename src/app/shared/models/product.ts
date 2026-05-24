import { ProductCategory } from '../constants/product-categories';

export interface ProductOption {
  id: number;
  productId: number;
  name: string;
  price: number;
}

export interface ProductOptionInput {
  name: string;
  price: number;
}

export type ProductStatus = 'active' | 'inactive' | string;

export interface Product {
  id?: number;
  name: string;
  price: number;
  category: ProductCategory | string;
  status?: ProductStatus;
  clientId?: string | number;
  options?: ProductOption[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SaleProduct extends Product {
  saleId: number;
  quantity: number;
}

export function getProductOptions(product: Product): ProductOption[] {
  return product.options ?? [];
}

export function productHasOptions(product: Product): boolean {
  return getProductOptions(product).length > 0;
}
