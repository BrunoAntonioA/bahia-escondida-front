import { Component } from '@angular/core';
import { PrinterService } from '../../shared/services/printer/printer.service';
import { SalesService } from '../../shared/services/sales/sales.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  message: string | null = null;

  constructor(
    private printerService: PrinterService,
    private salesService: SalesService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  viewDailySalesReport() {
    this.navigateToDailyReport();
  }

  navigateToDailyReport() {
    this.router.navigate(['/reporte-diario']);
  }

  printOpenSales() {
    this.salesService.getSalesByClientId('isDelivery').subscribe((sales) => {
      const filteredSales = sales.filter((sale) => sale.status === 'abierta');
      console.log(filteredSales);

      if (!filteredSales.length) {
        this.showMessage('No hay ventas abiertas para imprimir.');
        console.log('entra al if');
        return;
      }

      this.printerService.printKitchenSales(filteredSales, {
        sections: ['COMIDA'],
      });
    });
  }

  private showMessage(text: string) {
    this.message = text;

    setTimeout(() => {
      this.message = null;
    }, 3000); // disappears after 3 seconds
  }
}
