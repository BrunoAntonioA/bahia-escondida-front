export interface Product {
  id?: number;
  name: string;
  price: number;
  category: string;
  clientId: string;
}

export interface SaleProduct extends Product {
  saleId: number;
  quantity: number;
}
