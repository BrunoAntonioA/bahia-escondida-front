import { SalePayment } from './payments';

export interface PaymentTotals {
  cashPaid: number;
  cardPaid: number;
  transferPaid: number;
  tipPaid: number;
  totalPaid: number;
  paymentCount: number;
}

export interface SaleSummaryItem {
  isDelivery: boolean;
  tableNumber?: number | null;
  customerNickname?: string;
  closedAt?: string;
  createdAt?: string;
  payments: SalePayment[];
}

export interface SalesPaymentSummary {
  startDate: string;
  endDate: string;
  totals: PaymentTotals;
  sales: SaleSummaryItem[];
}
