import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Sale } from '../../models/sales';
import { SalePaymentsSummaryComponent } from '../sale-payments-summary/sale-payments-summary.component';

@Component({
  selector: 'app-sale-payment-modal',
  standalone: true,
  imports: [CommonModule, SalePaymentsSummaryComponent],
  templateUrl: './sale-payment-modal.component.html',
})
export class SalePaymentModalComponent {
  @Input() open = false;
  @Input({ required: true }) sale!: Sale;

  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
