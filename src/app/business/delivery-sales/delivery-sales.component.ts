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
  selector: 'app-delivery-sales',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    ConfirmDeleteModalComponent,
    SaleFormModalComponent,
  ],
  templateUrl: './delivery-sales.component.html',
  styleUrl: './delivery-sales.component.css',
})
export class DeliverySalesComponent {
  sales: Sale[] = [];
  filteredSales: Sale[] = [];
  newSale!: Sale;

  // pagination
  currentPage = 1;
  pageSize = 6; // rows per page
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
      tableNumber: null,
      isDelivery: true,
      status: 'abierta',
      products: [],
      customerNickname: '',
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
    this.salesService.getSalesByClientId('isDelivery').subscribe((sales) => {
      this.sales = this.sortByNewest(sales ?? []);
      this.filteredSales = [...this.sales];
    });
  }

  get paginatedSales(): Sale[] {
    return paginate(this.filteredSales, this.currentPage, this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  filterStatus(status: string): void {
    let result =
      status === 'all'
        ? [...this.sales]
        : this.sales.filter((s) => s.status === status);

    this.filteredSales = result;
    this.currentPage = 1;
  }

  navegateToSaleDetails(saleNumber?: number) {
    if (saleNumber) this.router.navigate(['/ventas', saleNumber]);
  }

  sortByNewest(sales: any[]) {
    return sales.sort((a, b) => {
      // 1. Status priority: abierta first
      if (a.status !== b.status) {
        if (a.status === 'abierta') return -1;
        if (b.status === 'abierta') return 1;
      }

      // 2. Newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  addSale(): void {
    try {
      this.salesService
        .createSale(
          0, // no table
          true, // always delivery
          this.newSale.customerNickname || ''
        )
        .subscribe((createdSale) => {
          const newSale = {
            ...this.newSale,
            createdAt: createdSale.createdAt,
            id: createdSale.id,
            isDelivery: true,
          };

          this.sales = this.sortByNewest([...this.sales, newSale]);
          this.filteredSales = [...this.sales];
          this.currentPage = 1;

          this.closeCreateModal();
          this.resetNewSale();
        });
    } catch (error) {
      console.log('Error creating sale:', error);
    }
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
