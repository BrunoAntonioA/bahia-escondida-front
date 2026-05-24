import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PRODUCT_CATEGORY_OPTIONS } from '../../constants/product-categories';
import { Product, ProductOptionInput } from '../../models/product';

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form-modal.component.html',
})
export class ProductFormModalComponent implements OnChanges {
  @Input() open = false;
  @Input({ required: true }) product!: Product;
  @Input() saving = false;

  readonly categoryOptions = PRODUCT_CATEGORY_OPTIONS;

  @Output() submitForm = new EventEmitter<ProductOptionInput[]>();
  @Output() cancel = new EventEmitter<void>();

  draftOptions: ProductOptionInput[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === true) {
      this.draftOptions = [];
    }
  }

  addOptionRow(): void {
    this.draftOptions.push({ name: '', price: 0 });
  }

  removeOptionRow(index: number): void {
    this.draftOptions.splice(index, 1);
  }

  onCancel(): void {
    this.draftOptions = [];
    this.cancel.emit();
  }

  onSubmit(): void {
    const options = this.draftOptions
      .map((option) => ({
        name: option.name.trim(),
        price: Number(option.price) || 0,
      }))
      .filter((option) => option.name.length > 0);

    this.submitForm.emit(options);
  }
}
