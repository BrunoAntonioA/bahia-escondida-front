import { Component } from '@angular/core';
import { Sale } from '../../shared/models/sales';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../shared/services/sales/sales.service';

@Component({
  selector: 'app-delivery-sales',
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-sales.component.html',
  styleUrl: './delivery-sales.component.css',
})
export class DeliverySalesComponent {
  sales: Sale[] = [];
  filteredSales: Sale[] = [];
  newSale: Sale = {
    tableNumber: null,
    isDelivery: true, // ALWAYS true
    clientId: 'bahia-escondida',
    status: 'abierta',
    products: [],
    customerNickname: '',
  };

  // pagination
  currentPage = 1;
  pageSize = 8; // rows per page
  // modal state
  showDeleteModal = false;
  saleToDeleteId: number | null = null;

  constructor(
    private router: Router,
    private salesService: SalesService,
  ) {}

  ngOnInit() {
    this.loadSales();
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredSales.length,
    );
  }

  loadSales() {
    this.salesService.getSalesByClientId('isDelivery').subscribe((sales) => {
      this.sales = this.sortByNewest(sales ?? []);
      this.filteredSales = [...this.sales];
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredSales.length / this.pageSize);
  }

  get paginatedSales() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredSales.slice(start, end);
  }

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
          this.newSale.customerNickname || '',
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

          // reset form
          this.newSale = {
            tableNumber: null,
            isDelivery: true,
            clientId: 'bahia-escondida',
            status: 'abierta',
            products: [],
            customerNickname: '',
          };
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
      0,
    );
  }

  deleteSale(saleId: number) {
    this.salesService.deleteSale(saleId).subscribe(() => {
      this.sales = this.sales.filter((sale) => sale.id !== saleId);
      this.filteredSales = this.filteredSales.filter(
        (sale) => sale.id !== saleId,
      );
    });
  }

  openDeleteModal(saleId: number) {
    this.saleToDeleteId = saleId;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.saleToDeleteId = null;
  }

  confirmDelete() {
    if (!this.saleToDeleteId) return;

    this.deleteSale(this.saleToDeleteId);
    this.closeDeleteModal();
  }
}
