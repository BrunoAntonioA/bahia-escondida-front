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
    clientId: 'bahia-escondida',
    status: 'abierta',
    products: [],
  };

  constructor(private router: Router, private salesService: SalesService) {}

  ngOnInit() {
    this.loadSales();
  }

  loadSales() {
    this.salesService.getSalesByClientId().subscribe((sales) => {
      this.sales = sales ?? [];
      this.filteredSales = [...this.sales];
    });
  }

  filterStatus(status: string): void {
    this.filteredSales =
      status === 'all'
        ? [...this.sales]
        : this.sales.filter((m) => m.status === status);
  }

  navegateToSaleDetails(saleNumber?: number) {
    if (saleNumber) this.router.navigate(['/sales', saleNumber]);
  }

  addSale(): void {
    try {
      this.salesService
        .createSale(this.newSale.tableNumber)
        .subscribe((newTable) => {
          this.sales.push({
            ...this.newSale,
            createdAt: new Date(),
            id: newTable.id,
          });
          this.filteredSales = [...this.sales];
          this.newSale = {
            tableNumber: 0,
            clientId: 'bahia-escondida',
            status: 'abierta',
            products: [],
          };
        });
    } catch (error) {
      console.log('Error creating sale sale:', error);
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
}
