import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { SalesService } from '../../../shared/services/sales/sales.service';
import { Sale } from '../../../shared/models/sales';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getCategoryLabel } from '../../../shared/constants/product-categories';

@Component({
  selector: 'app-daily-report',
  templateUrl: './daily-report.component.html',
  imports: [CommonModule, FormsModule],
})
export class DailyReportComponent implements OnInit {
  sales: Sale[] = [];
  filteredSales: Sale[] = [];

  totalRevenue = 0;
  totalSales = 0;
  avgTicket = 0;
  deliveryCount = 0;
  tableCount = 0;

  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD

  // Chart instances
  salesByDayChart?: Chart;
  revenueByCategoryChart?: Chart;

  constructor(private salesService: SalesService) {}

  ngOnInit() {
    this.salesService.getSalesByClientId().subscribe((sales) => {
      this.sales = sales;
      this.filteredSales = [...this.sales];
      this.calculateMetrics();
      this.buildCharts();
    });
  }

  filterByDate() {
    this.filteredSales = this.sales.filter((sale) => {
      if (!sale.createdAt) return false;
      const saleDate = new Date(sale.createdAt).setHours(0, 0, 0, 0);

      const from = this.startDate
        ? new Date(this.startDate).setHours(0, 0, 0, 0)
        : null;
      const to = this.endDate
        ? new Date(this.endDate).setHours(0, 0, 0, 0)
        : null;

      if (from && saleDate < from) return false;
      if (to && saleDate > to) return false;
      return true;
    });

    this.calculateMetrics();
    this.buildCharts();
  }

  private calculateMetrics() {
    const sales = this.filteredSales;

    this.totalSales = sales.length;

    this.totalRevenue = sales.reduce((sum, sale) => {
      return (
        sum +
        sale.products.reduce(
          (pSum: number, p: any) => pSum + p.price * p.quantity,
          0
        )
      );
    }, 0);

    this.avgTicket = this.totalRevenue / (this.totalSales || 1);

    this.deliveryCount = sales.filter((s) => s.isDelivery).length;
    this.tableCount = this.totalSales - this.deliveryCount;
  }

  private buildCharts() {
    this.buildSalesByDayChart();
    this.buildRevenueByCategoryChart();
  }

  private buildSalesByDayChart() {
    // Destroy old chart if exists
    this.salesByDayChart?.destroy();

    const salesByDay: Record<string, number> = {};
    this.filteredSales.forEach((sale) => {
      if (!sale.createdAt) return;
      const day = new Date(sale.createdAt).toLocaleDateString('es-CL');
      salesByDay[day] = (salesByDay[day] || 0) + 1;
    });

    this.salesByDayChart = new Chart('salesByDayChart', {
      type: 'line',
      data: {
        labels: Object.keys(salesByDay),
        datasets: [
          {
            label: 'Ventas',
            data: Object.values(salesByDay),
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14,165,233,0.2)',
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
        },
      },
    });
  }

  private buildRevenueByCategoryChart() {
    // Destroy old chart if exists
    this.revenueByCategoryChart?.destroy();

    const revenueByCategory: Record<string, number> = {};
    this.filteredSales.forEach((sale) => {
      sale.products.forEach((p: any) => {
        const label = getCategoryLabel(p.category);
        revenueByCategory[label] =
          (revenueByCategory[label] || 0) + p.price * p.quantity;
      });
    });

    this.revenueByCategoryChart = new Chart('revenueByCategoryChart', {
      type: 'doughnut',
      data: {
        labels: Object.keys(revenueByCategory),
        datasets: [
          {
            data: Object.values(revenueByCategory),
            backgroundColor: ['#22c55e', '#f97316', '#6366f1'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }
}
