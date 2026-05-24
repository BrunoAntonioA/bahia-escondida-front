import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductOptionInput } from '../../models/product';

@Component({
  selector: 'app-product-options-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-options-modal.component.html',
})
export class ProductOptionsModalComponent implements OnChanges {
  @Input() open = false;
  @Input() productName = '';
  @Input() saving = false;

  @Output() submitOptions = new EventEmitter<ProductOptionInput[]>();
  @Output() cancel = new EventEmitter<void>();

  draftOptions: ProductOptionInput[] = [this.createEmptyOption()];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === true) {
      this.resetDraft();
    }
  }

  addRow(): void {
    this.draftOptions.push(this.createEmptyOption());
  }

  removeRow(index: number): void {
    if (this.draftOptions.length === 1) {
      this.draftOptions[0] = this.createEmptyOption();
      return;
    }
    this.draftOptions.splice(index, 1);
  }

  onSubmit(): void {
    const options = this.draftOptions
      .map((option) => ({
        name: option.name.trim(),
        price: Number(option.price) || 0,
      }))
      .filter((option) => option.name.length > 0);

    if (options.length === 0) return;

    this.submitOptions.emit(options);
  }

  onCancel(): void {
    this.resetDraft();
    this.cancel.emit();
  }

  get canSubmit(): boolean {
    return this.draftOptions.some((option) => option.name.trim().length > 0);
  }

  private resetDraft(): void {
    this.draftOptions = [this.createEmptyOption()];
  }

  private createEmptyOption(): ProductOptionInput {
    return { name: '', price: 0 };
  }
}
