import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  TableService,
  TableProduct,
} from '../../shared/services/tables/table.service';
import { Product } from '../../shared/models/product';
import { ProductsService } from '../../shared/services/products.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table-detail',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './table-detail.component.html',
  styleUrl: './table-detail.component.css',
})
export class TableDetailComponent {
  mesaId: number | null = null;
  products: TableProduct[] = [];
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  pendingProducts: TableProduct[] = [];
  loading: boolean = true;
  searchTerm = '';

  mesa = {
    numero: 0,
    comensales: 0,
    estado: '',
    monto: 0,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tableService: TableService,
    private productService: ProductsService
  ) {}

  ngOnInit(): void {
    // Get mesa ID from URL
    this.mesaId = Number(this.route.snapshot.paramMap.get('id'));

    // Example: here you’d fetch mesa details from an API/service
    this.mesa = {
      numero: this.mesaId,
      comensales: 4,
      estado: 'abierta',
      monto: 45.5,
    };
    this.products = [];
    this.loading = true;

    // Fetch products
    if (this.mesaId) {
      this.products = this.tableService.getProductsForTable(this.mesaId);
      this.loading = false;
    }

    //const allProducts = this.productService.getProducts();
    const allProducts: Product[] = [];
    this.allProducts = allProducts;
    this.filteredProducts = allProducts;
  }

  get totalProductsPrice(): number {
    return this.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  }

  navigateToTables() {
    this.router.navigate(['/tables']);
  }

  printTable() {
    console.log('Acción de imprimir mesa');
  }

  closeTable() {
    console.log('Table closed');
    this.mesa.estado = 'cerrada';
  }

  searchProducts(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.allProducts.filter((p) =>
      p.name.toLowerCase().includes(term)
    );
  }

  addProductToTable(product: Product): void {
    const existing = this.products.find((p) => p.name === product.name);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.products.push({
        id: 0,
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: 1,
      });
    }
  }

  get pendingProductsTotal(): number {
    return this.pendingProducts.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );
  }

  addProductToPending(product: Product): void {
    const existing = this.pendingProducts.find((p) => p.name === product.name);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.pendingProducts.push({
        id: 0,
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: 1,
      });
    }
  }

  commitProducts(): void {
    if (this.pendingProducts.length === 0) return;

    console.log('Products added:', this.pendingProducts);

    // Merge into mesa’s products
    this.pendingProducts.forEach((pending) => {
      const existing = this.products.find((p) => p.name === pending.name);
      if (existing) {
        existing.quantity += pending.quantity;
      } else {
        this.products.push({ ...pending });
      }
    });

    // Clear staging area
    this.pendingProducts = [];
  }

  removePendingProduct(name: string): void {
    const existing = this.pendingProducts.find((p) => p.name === name);

    if (existing) {
      if (existing.quantity > 1) {
        existing.quantity -= 1; // ✅ decrease quantity
      } else {
        this.pendingProducts = this.pendingProducts.filter(
          (p) => p.name !== name
        );
      }
    }
  }
}
