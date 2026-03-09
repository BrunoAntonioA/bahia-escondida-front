import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, SaleProduct } from '../../shared/models/product';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sale } from '../../shared/models/sales';
import { ProductsService } from '../../shared/services/products.service';
import { SalesService } from '../../shared/services/sales/sales.service';
import { PaymentsService } from '../../shared/services/payments/payments.service';
import { PrinterService } from '../../shared/services/printer/printer.service';
import { switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-sales-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-detail.component.html',
  styleUrl: './sales-detail.component.css',
})
export class SalesDetailComponent {
  saleId: number | null = null;
  saleProducts: SaleProduct[] = [];
  pendingProducts: SaleProduct[] = [];
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  showCloseModal = false;

  payment = {
    efectivo: 0,
    tarjeta: 0,
    transferencia: 0,
    propinas: 0,
  };

  sale: Sale = {
    tableNumber: 0,
    isDelivery: false,
    clientId: '',
    status: '',
    products: [],
  };

  loading: boolean = true;
  searchTerm = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private salesService: SalesService,
    private paymentsService: PaymentsService,
    private printerService: PrinterService,
  ) {}

  ngOnInit(): void {
    this.saleId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.saleId) {
      this.getSaleById(this.saleId);
    }
    this.loadProducts();
  }

  getSaleById(id: number) {
    this.salesService.getSaleById(id).subscribe((sale) => {
      this.sale = sale ?? [];
      this.loading = false;
      if (this.sale?.products) {
        this.saleProducts = this.sale.products;
      }
    });
  }

  loadProducts() {
    this.productsService.getProducts().subscribe((products) => {
      this.allProducts = products ?? [];
      this.filteredProducts = [...this.allProducts];
    });
  }

  commitProducts(): void {
    if (this.pendingProducts.length === 0) return;
    try {
      this.pendingProducts.forEach((pending) => {
        this.salesService
          .addProductToSale(pending.id ?? 0, this.saleId!, pending.quantity)
          .subscribe(() => {
            const existing = this.saleProducts.find(
              (p) => p.name === pending.name,
            );
            if (existing) {
              existing.quantity += pending.quantity;
            } else {
              this.saleProducts.push({ ...pending });
            }
          });
      });
      this.pendingProducts = [];
    } catch (error) {
      console.log('Error adding products to sale:', error);
    }
  }

  deleteProductFromSale(productId: number) {
    this.salesService.deleteProductSale(this.saleId ?? 0, productId).subscribe({
      next: () => {
        this.saleProducts = this.saleProducts.filter((p) => p.id !== productId);
      },
      error: (err) => {
        console.error('Error deleting product from sale:', err);
      },
    });
  }

  addProductToPending(product: Product): void {
    const existing = this.pendingProducts.find((p) => p.name === product.name);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.pendingProducts.push({
        id: product.id,
        saleId: this.saleId || 0,
        name: product.name,
        price: product.price,
        category: product.category,
        quantity: 1,
        clientId: 'bahia-escondida',
      });
    }
  }

  removePendingProduct(name: string): void {
    const existing = this.pendingProducts.find((p) => p.name === name);

    if (existing) {
      if (existing.quantity > 1) {
        existing.quantity -= 1;
      } else {
        this.pendingProducts = this.pendingProducts.filter(
          (p) => p.name !== name,
        );
      }
    }
  }

  searchProducts(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.allProducts.filter((p) =>
      p.name.toLowerCase().includes(term),
    );
  }

  navigateToSales() {
    console.log('this.sale: ', this.sale);
    const path = this.sale.isDelivery ? '/delivery' : '/ventas';
    this.router.navigate([path]);
  }

  pendingProductsTotal(): number {
    return this.pendingProducts.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0,
    );
  }

  totalProductsPrice(): number {
    return this.saleProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  }

  printSale() {
    this.printerService.printSale(this.sale);
  }

  printKitchen() {
    this.printerService.printKitchenSale(this.sale);
  }

  openCloseModal() {
    this.payment = { efectivo: 0, tarjeta: 0, transferencia: 0, propinas: 0 };
    this.showCloseModal = true;
  }

  closeTable() {
    this.salesService.closeSale(this.saleId!).subscribe(() => {
      this.navigateToSales();
    });
  }

  cancelCloseSale() {
    this.showCloseModal = false;
  }

  confirmCloseSale() {
    const total = this.totalProductsPrice();

    // Sum only efectivo + tarjeta + transferencia
    const paid =
      (this.payment.efectivo || 0) +
      (this.payment.tarjeta || 0) +
      (this.payment.transferencia || 0);

    if (paid < total) {
      alert('El monto pagado es menor al total');
      return;
    }

    this.paymentsService
      .create(
        this.payment.efectivo,
        this.payment.tarjeta,
        this.payment.transferencia,
        this.payment.propinas,
        this.saleId ?? 0,
      )
      .pipe(
        switchMap(() => this.salesService.closeSale(this.saleId ?? 0)),
        tap(() => {
          this.showCloseModal = false;
          this.navigateToSales();
        }),
      )
      .subscribe({
        error: (err) => console.error(err),
      });
  }
}
