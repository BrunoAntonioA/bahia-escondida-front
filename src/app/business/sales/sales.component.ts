import { Component } from '@angular/core';
import { Sale } from '../../shared/models/sales';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SalesService } from '../../shared/services/sales/sales.service';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ConfirmDeleteModalComponent } from '../../shared/components/confirm-delete-modal/confirm-delete-modal.component';
import { SaleFormModalComponent } from '../../shared/components/sale-form-modal/sale-form-modal.component';
import { paginate } from '../../shared/utils/pagination.utils';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    ConfirmDeleteModalComponent,
    SaleFormModalComponent,
  ],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css',
})
export class SalesComponent {
  sales: Sale[] = [];
  filteredSales: Sale[] = [];

  newSale!: Sale;

  currentPage = 1;
  pageSize = 6;

  saleToDeleteId: number | null = null;
  showCreateModal = false;

  constructor(
    private router: Router,
    private salesService: SalesService,
  ) {}

  openCreateModal(): void {
    this.resetNewSale();
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  private createEmptySale(): Sale {
    return {
      tableNumber: 0,
      isDelivery: false,
      status: 'abierta',
      products: [],
    };
  }

  private resetNewSale(): void {
    this.newSale = this.createEmptySale();
  }

  ngOnInit() {
    this.resetNewSale();
    this.loadSales();
  }

  loadSales() {
    this.salesService.getSalesByClientId('isTable').subscribe((sales) => {
      this.sales = this.sortByNewest(sales ?? []);
      this.filteredSales = [...this.sales];
    });
  }

  filterStatus(status: string): void {
    this.filteredSales =
      status === 'all'
        ? [...this.sales]
        : this.sales.filter((s) => s.status === status);

    this.currentPage = 1;
  }

  addSale(): void {
    this.salesService
      .createSale(
        this.newSale.tableNumber || 0,
        false, // ALWAYS dine-in
        '' // no nickname
      )
      .subscribe((createdSale) => {
        const newSale = {
          ...this.newSale,
          createdAt: createdSale.createdAt,
          id: createdSale.id,
          isDelivery: false,
        };

        this.sales = this.sortByNewest([...this.sales, newSale]);
        this.filteredSales = [...this.sales];
        this.currentPage = 1;

        this.closeCreateModal();
        this.resetNewSale();
      });
  }

  sortByNewest(sales: any[]) {
    return sales.sort((a, b) => {
      if (a.status !== b.status) {
        if (a.status === 'abierta') return -1;
        if (b.status === 'abierta') return 1;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  get paginatedSales(): Sale[] {
    return paginate(this.filteredSales, this.currentPage, this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  navegateToSaleDetails(saleNumber?: number) {
    if (saleNumber) this.router.navigate(['/ventas', saleNumber]);
  }

  getSaleTotal(sale: any): number {
    if (!sale?.products?.length) return 0;

    return sale.products.reduce(
      (total: number, product: any) =>
        total + product.price * (product.quantity ?? 1),
      0
    );
  }

  deleteSale(saleId: number) {
    this.salesService.deleteSale(saleId).subscribe(() => {
      this.sales = this.sales.filter((sale) => sale.id !== saleId);
      this.filteredSales = this.filteredSales.filter(
        (sale) => sale.id !== saleId
      );
    });
  }

  openDeleteModal(saleId: number): void {
    this.saleToDeleteId = saleId;
  }

  closeDeleteModal(): void {
    this.saleToDeleteId = null;
  }

  onDeleteConfirmed(): void {
    if (this.saleToDeleteId == null) return;

    this.deleteSale(this.saleToDeleteId);
    this.closeDeleteModal();
  }
}
