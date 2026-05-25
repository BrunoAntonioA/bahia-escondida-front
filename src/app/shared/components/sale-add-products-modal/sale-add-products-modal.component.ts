import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Product,
  ProductOption,
  getProductOptions,
  productHasOptions,
} from '../../models/product';
import {
  PendingSaleProduct,
  pendingSaleProductKey,
  pendingSaleProductTotal,
} from '../../models/sales';
import { CategoryLabelPipe } from '../../pipes/category-label.pipe';

@Component({
  selector: 'app-sale-add-products-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CategoryLabelPipe],
  templateUrl: './sale-add-products-modal.component.html',
})
export class SaleAddProductsModalComponent {
  @Input() open = false;
  @Input() filteredProducts: Product[] = [];
  @Input() pendingProducts: PendingSaleProduct[] = [];

  @Output() searchChange = new EventEmitter<string>();
  @Output() addPending = new EventEmitter<PendingSaleProduct>();
  @Output() removePending = new EventEmitter<string>();
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  searchTerm = '';
  optionPickerOpen = false;
  optionPickerProduct: Product | null = null;
  selectedOptionIds = new Set<number>();
  pickerQuantity = 1;
  pickerObservation = '';
  pickerError = '';

  get pendingTotal(): number {
    return this.pendingProducts.reduce(
      (sum, product) => sum + pendingSaleProductTotal(product),
      0,
    );
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price);
  }

  hasOptions(product: Product): boolean {
    return productHasOptions(product);
  }

  optionCountLabel(product: Product): string {
    const count = getProductOptions(product).length;
    return count === 1 ? '1 opción' : `${count} opciones`;
  }

  onSearchInput(): void {
    this.searchChange.emit(this.searchTerm);
  }

  onProductClick(product: Product): void {
    if (productHasOptions(product)) {
      this.openOptionPicker(product);
      return;
    }

    this.addPending.emit(this.buildPendingItem(product, [], 1, ''));
  }

  openOptionPicker(product: Product): void {
    this.optionPickerProduct = product;
    this.selectedOptionIds = new Set();
    this.pickerQuantity = 1;
    this.pickerObservation = '';
    this.pickerError = '';
    this.optionPickerOpen = true;
  }

  closeOptionPicker(): void {
    this.optionPickerOpen = false;
    this.optionPickerProduct = null;
    this.selectedOptionIds = new Set();
    this.pickerQuantity = 1;
    this.pickerObservation = '';
    this.pickerError = '';
  }

  toggleOption(optionId: number): void {
    if (this.selectedOptionIds.has(optionId)) {
      this.selectedOptionIds.delete(optionId);
    } else {
      this.selectedOptionIds.add(optionId);
    }
    this.selectedOptionIds = new Set(this.selectedOptionIds);
    this.pickerError = '';
  }

  isOptionSelected(optionId: number): boolean {
    return this.selectedOptionIds.has(optionId);
  }

  pickerOptions(): ProductOption[] {
    return this.optionPickerProduct
      ? getProductOptions(this.optionPickerProduct)
      : [];
  }

  pickerSubtotal(): number {
    if (!this.optionPickerProduct) return 0;

    const selected = this.pickerOptions().filter((option) =>
      this.selectedOptionIds.has(option.id),
    );

    return pendingSaleProductTotal({
      productId: this.optionPickerProduct.id ?? 0,
      name: this.optionPickerProduct.name,
      price: this.optionPickerProduct.price,
      quantity: this.pickerQuantity,
      selectedOptionIds: selected.map((option) => option.id),
      selectedOptions: selected.map((option) => ({
        id: option.id,
        name: option.name,
        price: option.price,
      })),
    });
  }

  confirmOptionPicker(): void {
    if (!this.optionPickerProduct) return;

    if (this.selectedOptionIds.size === 0) {
      this.pickerError = 'Selecciona al menos una opción.';
      return;
    }

    const selectedOptions = this.pickerOptions().filter((option) =>
      this.selectedOptionIds.has(option.id),
    );

    this.addPending.emit(
      this.buildPendingItem(
        this.optionPickerProduct,
        selectedOptions,
        this.pickerQuantity,
        this.pickerObservation.trim(),
      ),
    );
    this.closeOptionPicker();
  }

  onRemovePending(key: string): void {
    this.removePending.emit(key);
  }

  pendingKey(item: PendingSaleProduct): string {
    return pendingSaleProductKey(item);
  }

  pendingItemTotal(item: PendingSaleProduct): number {
    return pendingSaleProductTotal(item);
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.closeOptionPicker();
    this.searchTerm = '';
    this.cancel.emit();
  }

  private buildPendingItem(
    product: Product,
    selectedOptions: ProductOption[],
    quantity: number,
    observation: string,
  ): PendingSaleProduct {
    return {
      productId: product.id ?? 0,
      name: product.name,
      price: product.price,
      quantity,
      category: product.category,
      selectedOptionIds: selectedOptions.map((option) => option.id),
      selectedOptions: selectedOptions.map((option) => ({
        id: option.id,
        name: option.name,
        price: option.price,
      })),
      observation: observation || undefined,
    };
  }
}
