import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  paymentGrandTotal,
  paymentSaleTotal,
  SalePayment,
} from '../../models/payments';
import { formatPriceClp, getPrimaryPayment, Sale } from '../../models/sales';

@Component({
  selector: 'app-sale-payments-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sale-payments-summary.component.html',
})
export class SalePaymentsSummaryComponent {
  @Input({ required: true }) sale!: Sale;
  @Input() compact = false;

  get payment(): SalePayment | null {
    return getPrimaryPayment(this.sale);
  }

  get hasPayment(): boolean {
    return !!this.payment;
  }

  formatPrice(price: number): string {
    return formatPriceClp(price);
  }

  paymentTotal(payment: SalePayment): number {
    return paymentSaleTotal(payment);
  }

  paymentWithTip(payment: SalePayment): number {
    return paymentGrandTotal(payment);
  }

  paymentRows(payment: SalePayment): { label: string; amount: number }[] {
    const rows: { label: string; amount: number }[] = [];

    if (payment.cashPaid > 0) {
      rows.push({ label: 'Efectivo', amount: payment.cashPaid });
    }
    if (payment.cardPaid > 0) {
      rows.push({ label: 'Tarjeta', amount: payment.cardPaid });
    }
    if (payment.transferPaid > 0) {
      rows.push({ label: 'Transferencia', amount: payment.transferPaid });
    }
    if (payment.tipPaid > 0) {
      rows.push({ label: 'Propina', amount: payment.tipPaid });
    }

    return rows;
  }
}
