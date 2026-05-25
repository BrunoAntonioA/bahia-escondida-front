export interface Payment {
  id?: number;
  saleId: number;
  cashPaid: number;
  cardPaid: number;
  transferPaid: number;
  tipPaid: number;
  createdAt?: string;
}

export interface SalePayment extends Payment {}

export function paymentSaleTotal(payment: Payment): number {
  return payment.cashPaid + payment.cardPaid + payment.transferPaid;
}

export function paymentGrandTotal(payment: Payment): number {
  return paymentSaleTotal(payment) + payment.tipPaid;
}
