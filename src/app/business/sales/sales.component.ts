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
    isDelivery: false, // ALWAYS false (dine-in)
    clientId: 'bahia-escondida',
    status: 'abierta',
    products: [],
  };

  currentPage = 1;
  pageSize = 8;

  showDeleteModal = false;
  saleToDeleteId: number | null = null;

  constructor(
    private router: Router,
    private salesService: SalesService,
  ) {}

  ngOnInit() {
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
        '', // no nickname
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

        this.newSale = {
          tableNumber: 0,
          isDelivery: false,
          clientId: 'bahia-escondida',
          status: 'abierta',
          products: [],
        };
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

  get paginatedSales() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSales.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredSales.length / this.pageSize);
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

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  navegateToSaleDetails(saleNumber?: number) {
    if (saleNumber) this.router.navigate(['/ventas', saleNumber]);
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
