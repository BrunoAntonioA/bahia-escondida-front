import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../shared/models/product';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PendingSaleProduct,
  Sale,
  SaleProductLine,
  formatPriceClp,
  getPrimaryPayment,
  pendingSaleProductKey,
  saleLineTotal,
} from '../../shared/models/sales';
import { ProductsService } from '../../shared/services/products.service';
import { SalesService } from '../../shared/services/sales/sales.service';
import { PaymentsService } from '../../shared/services/payments/payments.service';
import { PrinterService } from '../../shared/services/printer/printer.service';
import { SaleAddProductsModalComponent } from '../../shared/components/sale-add-products-modal/sale-add-products-modal.component';
import { SalePaymentModalComponent } from '../../shared/components/sale-payment-modal/sale-payment-modal.component';
import { forkJoin, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-sales-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, SaleAddProductsModalComponent, SalePaymentModalComponent],
  templateUrl: './sales-detail.component.html',
  styleUrl: './sales-detail.component.css',
})
export class SalesDetailComponent implements OnInit {
  saleId: number | null = null;
  saleProducts: SaleProductLine[] = [];
  pendingProducts: PendingSaleProduct[] = [];
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  showCloseModal = false;
  showAddProductsModal = false;
  showPaymentModal = false;
  addingProducts = false;

  payment = {
    efectivo: 0,
    tarjeta: 0,
    transferencia: 0,
    propinas: 0,
  };

  sale: Sale = {
    tableNumber: 0,
    isDelivery: false,
    status: '',
    products: [],
  };

  loading = true;
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

  getSaleById(id: number): void {
    this.loading = true;
    this.salesService.getSaleById(id).subscribe({
      next: (sale) => {
        this.sale = sale;
        this.saleProducts = sale.products ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadProducts(): void {
    this.productsService.getProducts().subscribe((products) => {
      this.allProducts = products ?? [];
      this.filteredProducts = [...this.allProducts];
    });
  }

  commitProducts(): void {
    if (this.pendingProducts.length === 0 || !this.saleId || this.addingProducts) {
      return;
    }

    this.addingProducts = true;

    const requests = this.pendingProducts.map((pending) =>
      this.salesService.addProductToSale({
        saleId: this.saleId!,
        productId: pending.productId,
        quantity: pending.quantity,
        selectedOptionIds: pending.selectedOptionIds.length
          ? pending.selectedOptionIds
          : undefined,
        observation: pending.observation,
      }),
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.pendingProducts = [];
        this.addingProducts = false;
        this.closeAddProductsModal();
        this.getSaleById(this.saleId!);
      },
      error: (error) => {
        console.error('Error adding products to sale:', error);
        this.addingProducts = false;
      },
    });
  }

  deleteProductFromSale(saleProductId: number): void {
    if (!this.saleId) return;

    this.salesService.deleteSaleProductLine(this.saleId, saleProductId).subscribe({
      next: () => {
        this.getSaleById(this.saleId!);
      },
      error: (err) => {
        console.error('Error deleting product from sale:', err);
      },
    });
  }

  addPendingProduct(item: PendingSaleProduct): void {
    const key = pendingSaleProductKey(item);
    const existing = this.pendingProducts.find(
      (pending) => pendingSaleProductKey(pending) === key,
    );

    if (existing) {
      existing.quantity += item.quantity;
      if (item.observation && !existing.observation) {
        existing.observation = item.observation;
      }
    } else {
      this.pendingProducts.push({ ...item });
    }
  }

  removePendingProduct(key: string): void {
    this.pendingProducts = this.pendingProducts.filter(
      (pending) => pendingSaleProductKey(pending) !== key,
    );
  }

  searchProducts(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.allProducts.filter((product) =>
      product.name.toLowerCase().includes(term),
    );
  }

  onProductSearch(term: string): void {
    this.searchTerm = term;
    this.searchProducts();
  }

  openAddProductsModal(): void {
    this.searchTerm = '';
    this.filteredProducts = [...this.allProducts];
    this.showAddProductsModal = true;
  }

  closeAddProductsModal(): void {
    this.showAddProductsModal = false;
    this.searchTerm = '';
    this.filteredProducts = [...this.allProducts];
  }

  navigateToSales(): void {
    const path = this.sale.isDelivery ? '/delivery' : '/ventas';
    this.router.navigate([path]);
  }

  lineTotal(line: SaleProductLine): number {
    return saleLineTotal(line);
  }

  totalProductsPrice(): number {
    return this.saleProducts.reduce(
      (sum, product) => sum + saleLineTotal(product),
      0,
    );
  }

  formatPrice(price: number): string {
    return formatPriceClp(price);
  }

  get isOpen(): boolean {
    return this.sale.status === 'abierta';
  }

  get hasPayment(): boolean {
    return !!getPrimaryPayment(this.sale);
  }

  openPaymentModal(): void {
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
  }

  printSale(): void {
    this.printerService.printSale(this.sale);
  }

  printKitchen(): void {
    this.printerService.printKitchenSale(this.sale);
  }

  openCloseModal(): void {
    this.payment = { efectivo: 0, tarjeta: 0, transferencia: 0, propinas: 0 };
    this.showCloseModal = true;
  }

  cancelCloseSale(): void {
    this.showCloseModal = false;
  }

  confirmCloseSale(): void {
    const total = this.totalProductsPrice();
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
