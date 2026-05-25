import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Sale, SaleProductLine, saleLineTotal } from '../../shared/models/sales';
import { SalesService } from '../../shared/services/sales/sales.service';

@Component({
  selector: 'app-open-sales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './open-sales.component.html',
})
export class OpenSalesComponent implements OnInit {
  loading = true;
  tableSales: Sale[] = [];
  deliverySales: Sale[] = [];

  constructor(
    private salesService: SalesService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadOpenSales();
  }

  get totalOpen(): number {
    return this.tableSales.length + this.deliverySales.length;
  }

  loadOpenSales(): void {
    this.loading = true;

    this.salesService.getSalesByClientId('all').subscribe({
      next: (sales) => {
        const openSales = (sales ?? [])
          .filter((sale) => sale.status === 'abierta')
          .sort(
            (a, b) =>
              new Date(b.createdAt ?? 0).getTime() -
              new Date(a.createdAt ?? 0).getTime(),
          );

        this.tableSales = openSales.filter((sale) => !sale.isDelivery);
        this.deliverySales = openSales.filter((sale) => sale.isDelivery);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  saleTitle(sale: Sale): string {
    if (sale.isDelivery) {
      return sale.customerNickname?.trim() || 'Delivery sin nombre';
    }

    return `Mesa ${sale.tableNumber ?? '—'}`;
  }

  saleBadge(sale: Sale): string {
    return sale.isDelivery ? 'Delivery' : 'Mesa';
  }

  productCount(sale: Sale): number {
    return (sale.products ?? []).reduce(
      (sum, line) => sum + line.quantity,
      0,
    );
  }

  lineTotal(line: SaleProductLine): number {
    return saleLineTotal(line);
  }

  saleTotal(sale: Sale): number {
    return (sale.products ?? []).reduce(
      (sum, line) => sum + saleLineTotal(line),
      0,
    );
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price);
  }

  viewSale(sale: Sale): void {
    if (!sale.id) return;

    const path = sale.isDelivery
      ? ['/delivery', sale.id]
      : ['/ventas', sale.id];

    this.router.navigate(path);
  }

  goHome(): void {
    this.router.navigate(['/inicio']);
  }
}
