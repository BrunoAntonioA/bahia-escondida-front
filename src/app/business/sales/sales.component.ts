import { Component } from '@angular/core';
import { Sale } from '../../shared/models/sales';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../shared/services/sales/sales.service';

@Component({
  selector: 'app-sales',
  imports: [CommonModule, FormsModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css',
})
export class SalesComponent {
  sales: Sale[] = [];
  filteredSales: Sale[] = [];
  newSale: Sale = {
    tableNumber: 0,
    isDelivery: false,
    clientId: 'bahia-escondida',
    status: 'abierta',
    products: [],
  };
  // pagination
  currentPage = 1;
  pageSize = 5; // rows per page
  // modal state
  showDeleteModal = false;
  saleToDeleteId: number | null = null;

  constructor(private router: Router, private salesService: SalesService) {}

  ngOnInit() {
    this.loadSales();
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredSales.length
    );
  }

  loadSales() {
    this.salesService.getSalesByClientId().subscribe((sales) => {
      this.sales = (sales ?? []).sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
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
    this.filteredSales =
      status === 'all'
        ? [...this.sales]
        : this.sales.filter((m) => m.status === status);
    this.currentPage = 1;
  }

  navegateToSaleDetails(saleNumber?: number) {
    if (saleNumber) this.router.navigate(['/ventas', saleNumber]);
  }

  private sortByNewest(sales: any[]) {
    return sales.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  addSale(): void {
    try {
      this.salesService
        .createSale(
          this.newSale.tableNumber || 0,
          this.newSale.isDelivery,
          this.newSale.customerNickname || ''
        )
        .subscribe((newTable) => {
          const newSale = {
            ...this.newSale,
            createdAt: newTable.createdAt,
            id: newTable.id,
          };

          this.sales = this.sortByNewest([...this.sales, newSale]);
          this.filteredSales = [...this.sales];

          // reset pagination so the new sale is visible
          this.currentPage = 1;

          // reset form
          this.newSale = {
            tableNumber: 0,
            isDelivery: false,
            clientId: 'bahia-escondida',
            status: 'abierta',
            products: [],
          };
        });
    } catch (error) {
      console.log('Error creating sale:', error);
    }
  }

  checkExistingSale(): boolean {
    return this.sales.some(
      (sale) =>
        sale.tableNumber === this.newSale.tableNumber &&
        sale.status === 'abierta'
    );
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

  toggleDelivery() {
    this.newSale.isDelivery = !this.newSale.isDelivery;

    if (this.newSale.isDelivery) {
      this.newSale.tableNumber = null;
    } else {
      this.newSale.customerNickname = '';
    }
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
