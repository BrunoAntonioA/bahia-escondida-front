import { SalePayment } from './payments';

export interface SaleSelectedOption {
  id: number;
  productOptionId: number;
  optionName: string;
  price: number;
}

export interface SaleProductLine {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  observation?: string;
  category?: string;
  selectedOptions: SaleSelectedOption[];
}

export interface PendingSaleProduct {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  selectedOptionIds: number[];
  selectedOptions: { id: number; name: string; price: number }[];
  observation?: string;
}

export interface AddProductToSalePayload {
  saleId: number;
  productId: number;
  quantity: number;
  selectedOptionIds?: number[];
  observation?: string;
}

export interface Sale {
  id?: number;
  clientId?: string | number;
  isDelivery: boolean;
  tableNumber?: number | null;
  customerNickname?: string;
  partySize?: number;
  status: string;
  products?: SaleProductLine[];
  payments?: SalePayment[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  closedAt?: Date | string;
}

export function pendingSaleProductKey(item: PendingSaleProduct): string {
  const optionIds = [...item.selectedOptionIds].sort((a, b) => a - b).join('-');
  return `${item.productId}:${optionIds}`;
}

export function saleLineTotal(line: SaleProductLine): number {
  const optionsTotal = (line.selectedOptions ?? []).reduce(
    (sum, option) => sum + option.price,
    0,
  );
  return (line.price + optionsTotal) * line.quantity;
}

export function pendingSaleProductTotal(item: PendingSaleProduct): number {
  const optionsTotal = item.selectedOptions.reduce(
    (sum, option) => sum + option.price,
    0,
  );
  return (item.price + optionsTotal) * item.quantity;
}

export function saleProductsTotal(sale: Sale): number {
  return (sale.products ?? []).reduce(
    (sum, line) => sum + saleLineTotal(line),
    0,
  );
}

export function getPrimaryPayment(sale: Sale): SalePayment | null {
  return sale.payments?.[0] ?? null;
}

export function formatPriceClp(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price);
}
