import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Sale } from '../../models/sales';

export type SaleFormMode = 'table' | 'delivery';

@Component({
  selector: 'app-sale-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sale-form-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleFormModalComponent {
  @Input() open = false;
  @Input({ required: true }) sale!: Sale;
  @Input() mode: SaleFormMode = 'table';

  @Output() submitForm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  get title(): string {
    return this.mode === 'delivery'
      ? 'Nueva venta (Para llevar)'
      : 'Nueva venta (Para servir)';
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    this.submitForm.emit();
  }
}
