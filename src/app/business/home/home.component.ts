import { Component } from '@angular/core';
import { PrinterService } from '../../shared/services/printer/printer.service';
import { SalesService } from '../../shared/services/sales/sales.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  message: string | null = null;
  printing = false;

  constructor(
    private printerService: PrinterService,
    private salesService: SalesService,
    private router: Router,
  ) {}

  viewDailySalesReport() {
    this.navigateToDailyReport();
  }

  viewOpenSales() {
    this.router.navigate(['/ventas-abiertas']);
  }

  navigateToDailyReport() {
    this.router.navigate(['/reporte-diario']);
  }

  printOpenSales() {
    if (this.printing) return;

    this.printing = true;

    this.salesService.getSalesByClientId('all').subscribe({
      next: (sales) => {
        const openSales = (sales ?? []).filter((sale) => sale.status === 'abierta');

        if (!openSales.length) {
          this.showMessage('No hay ventas abiertas para imprimir.');
          this.printing = false;
          return;
        }

        this.printerService.printOpenSales(openSales);
        this.printing = false;
      },
      error: () => {
        this.showMessage('No se pudieron cargar las ventas abiertas.');
        this.printing = false;
      },
    });
  }

  private showMessage(text: string) {
    this.message = text;

    setTimeout(() => {
      this.message = null;
    }, 3000);
  }
}
