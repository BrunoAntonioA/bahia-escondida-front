import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product, SaleProduct } from '../../models/product';
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
  @Input() pendingProducts: SaleProduct[] = [];

  @Output() searchChange = new EventEmitter<string>();
  @Output() addProduct = new EventEmitter<Product>();
  @Output() removePending = new EventEmitter<string>();
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  searchTerm = '';

  get pendingTotal(): number {
    return this.pendingProducts.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0,
    );
  }

  onSearchInput(): void {
    this.searchChange.emit(this.searchTerm);
  }

  onAddProduct(product: Product): void {
    this.addProduct.emit(product);
  }

  onRemovePending(name: string): void {
    this.removePending.emit(name);
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.searchTerm = '';
    this.cancel.emit();
  }
}
