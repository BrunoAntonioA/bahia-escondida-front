import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  Product,
  ProductOptionInput,
  productHasOptions,
} from '../../shared/models/product';
import { ProductsService } from '../../shared/services/products.service';
import { ConfirmDeleteModalComponent } from '../../shared/components/confirm-delete-modal/confirm-delete-modal.component';
import { ProductFormModalComponent } from '../../shared/components/product-form-modal/product-form-modal.component';
import { ProductOptionsModalComponent } from '../../shared/components/product-options-modal/product-options-modal.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { CategoryLabelPipe } from '../../shared/pipes/category-label.pipe';
import { paginate } from '../../shared/utils/pagination.utils';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmDeleteModalComponent,
    ProductFormModalComponent,
    ProductOptionsModalComponent,
    PaginationComponent,
    CategoryLabelPipe,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  products: Product[] = [];
  expandedProductIds = new Set<number>();

  currentPage = 1;
  pageSize = 5;

  newProduct!: Product;
  productToDeleteId: number | null = null;
  showCreateModal = false;
  savingProduct = false;

  selectedProductForOptions: Product | null = null;
  showOptionsModal = false;
  savingOptions = false;

  constructor(private productService: ProductsService) {}

  openCreateModal(): void {
    this.resetNewProduct();
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.savingProduct = false;
  }

  openOptionsModal(product: Product): void {
    this.selectedProductForOptions = product;
    this.showOptionsModal = true;
  }

  closeOptionsModal(): void {
    this.showOptionsModal = false;
    this.selectedProductForOptions = null;
    this.savingOptions = false;
  }

  saveProductOptions(options: ProductOptionInput[]): void {
    const productId = this.selectedProductForOptions?.id;
    if (!productId) return;

    this.savingOptions = true;

    this.productService.addProductOptions(productId, options).subscribe({
      next: (updatedProduct) => {
        this.products = this.products.map((product) =>
          product.id === updatedProduct.id
            ? { ...updatedProduct, options: updatedProduct.options ?? [] }
            : product,
        );
        this.expandedProductIds.add(productId);
        this.closeOptionsModal();
      },
      error: (err) => {
        this.savingOptions = false;
        console.error('Error adding product options:', err);
      },
    });
  }

  private createEmptyProduct(): Product {
    return {
      name: '',
      category: '',
      price: null as any,
    };
  }

  private resetNewProduct(): void {
    this.newProduct = this.createEmptyProduct();
  }

  ngOnInit(): void {
    this.resetNewProduct();
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe((products) => {
      this.products = products ?? [];
    });
  }

  get paginatedProducts(): Product[] {
    return paginate(this.products, this.currentPage, this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  hasOptions(product: Product): boolean {
    return productHasOptions(product);
  }

  optionsCount(product: Product): number {
    return product.options?.length ?? 0;
  }

  isExpanded(productId?: number): boolean {
    return productId != null && this.expandedProductIds.has(productId);
  }

  toggleOptions(productId?: number): void {
    if (productId == null) return;

    if (this.expandedProductIds.has(productId)) {
      this.expandedProductIds.delete(productId);
    } else {
      this.expandedProductIds.add(productId);
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price);
  }

  private clampCurrentPage(): void {
    const totalPages = Math.max(
      1,
      Math.ceil(this.products.length / this.pageSize),
    );
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }
  }

  addProduct(options: ProductOptionInput[] = []): void {
    const productToCreate: Product = { ...this.newProduct };

    this.savingProduct = true;

    this.productService.addProduct(productToCreate, options).subscribe({
      next: (createdProduct) => {
        this.products.push({
          ...createdProduct,
          options: createdProduct.options ?? [],
        });

        if (createdProduct.id && (createdProduct.options?.length ?? 0) > 0) {
          this.expandedProductIds.add(createdProduct.id);
        }

        this.currentPage = Math.max(
          1,
          Math.ceil(this.products.length / this.pageSize),
        );

        this.closeCreateModal();
        this.resetNewProduct();
      },
      error: (err) => {
        this.savingProduct = false;
        console.error('Error creating product:', err);
      },
    });
  }

  openDeleteModal(productId?: number): void {
    if (!productId) return;
    this.productToDeleteId = productId;
  }

  closeDeleteModal(): void {
    this.productToDeleteId = null;
  }

  onDeleteConfirmed(): void {
    if (this.productToDeleteId == null) return;

    this.deleteProduct(this.productToDeleteId);
    this.closeDeleteModal();
  }

  deleteProduct(productId: number): void {
    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.expandedProductIds.delete(productId);
        this.products = this.products.filter(
          (product) => product.id !== productId,
        );
        this.clampCurrentPage();
      },
      error: (err) => {
        console.error('Error deleting product:', err);
      },
    });
  }
}
