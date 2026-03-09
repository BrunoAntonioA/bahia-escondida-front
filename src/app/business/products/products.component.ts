import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../shared/models/product';
import { ProductsService } from '../../shared/services/products.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  products: Product[] = [];
  categories: string[] = ['Bebestible', 'Comida'];

  // pagination config
  currentPage = 1;
  pageSize = 5;

  newProduct: Product = {
    clientId: 'bahia-escondida',
    name: '',
    category: '',
    price: null as any,
  };

  constructor(private productService: ProductsService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe((products) => {
      this.products = products ?? [];
    });
  }

  // derived data
  get totalPages(): number {
    return Math.ceil(this.products.length / this.pageSize);
  }

  get paginatedProducts() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.products.slice(start, end);
  }

  // range text
  get startItem(): number {
    return this.products.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.products.length ? this.products.length : end;
  }

  // navigation
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  addProduct() {
    const productToCreate: Product = { ...this.newProduct };

    this.productService.addProduct(productToCreate).subscribe({
      next: (createdProduct) => {
        this.products.push(createdProduct);

        this.newProduct = {
          clientId: 'bahia-escondida',
          name: '',
          category: '',
          price: null as any,
        };
      },
      error: (err) => {
        console.error('Error creating product:', err);
      },
    });
  }

  deleteProduct(index: number, productId?: number) {
    if (!productId) return;

    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.products.splice(index, 1);
      },
      error: (err) => {
        console.error('Error creating product:', err);
      },
    });
  }
}
