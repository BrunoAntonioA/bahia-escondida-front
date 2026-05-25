import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { SalesService } from '../../../shared/services/sales/sales.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { paymentGrandTotal } from '../../../shared/models/payments';
import { SalesPaymentSummary } from '../../../shared/models/payment-summary';
import { formatPriceClp } from '../../../shared/models/sales';

@Component({
  selector: 'app-daily-report',
  standalone: true,
  templateUrl: './daily-report.component.html',
  imports: [CommonModule, FormsModule],
})
export class DailyReportComponent implements OnInit, OnDestroy {
  summary: SalesPaymentSummary | null = null;
  loading = false;
  errorMessage = '';

  startDate = '';
  endDate = '';

  private paymentMethodsChart?: Chart;
  private salesTypeChart?: Chart;
  private activityChart?: Chart;

  constructor(
    private salesService: SalesService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const today = this.todayDateString();
    this.startDate = today;
    this.endDate = today;
    this.loadReport();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  get deliveryCount(): number {
    return this.summary?.sales.filter((sale) => sale.isDelivery).length ?? 0;
  }

  get tableCount(): number {
    return this.summary?.sales.filter((sale) => !sale.isDelivery).length ?? 0;
  }

  get avgTicket(): number {
    const totals = this.summary?.totals;
    if (!totals?.paymentCount) return 0;

    const salesTotal = totals.totalPaid - totals.tipPaid;
    return salesTotal / totals.paymentCount;
  }

  get isSingleDayRange(): boolean {
    return this.startDate === this.endDate;
  }

  formatPrice(price: number): string {
    return formatPriceClp(price);
  }

  applyFilter(): void {
    this.loadReport();
  }

  loadReport(): void {
    if (!this.startDate || !this.endDate) return;

    this.loading = true;
    this.errorMessage = '';
    this.destroyCharts();

    this.salesService.getPaymentSummary(this.startDate, this.endDate).subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loading = false;
        this.scheduleChartBuild();
      },
      error: () => {
        this.loading = false;
        this.errorMessage =
          'No se pudo cargar el reporte. Revisa las fechas e intenta de nuevo.';
        this.cdr.detectChanges();
      },
    });
  }

  private scheduleChartBuild(): void {
    this.cdr.detectChanges();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.buildCharts());
    });
  }

  private buildCharts(): void {
    if (!this.summary) return;

    this.destroyCharts();

    this.paymentMethodsChart = this.createChart(
      'paymentMethodsChart',
      this.paymentMethodsConfig(),
    );
    this.salesTypeChart = this.createChart(
      'salesTypeChart',
      this.salesTypeConfig(),
    );
    this.activityChart = this.createChart(
      'activityChart',
      this.activityConfig(),
    );
  }

  private createChart(
    canvasId: string,
    config: ChartConfiguration,
  ): Chart | undefined {
    const canvas = document.getElementById(canvasId);

    if (!(canvas instanceof HTMLCanvasElement)) {
      return undefined;
    }

    return new Chart(canvas, config);
  }

  private paymentMethodsConfig(): ChartConfiguration {
    const totals = this.summary!.totals;

    return {
      type: 'doughnut',
      data: {
        labels: ['Efectivo', 'Tarjeta', 'Transferencia', 'Propinas'],
        datasets: [
          {
            data: [
              totals.cashPaid,
              totals.cardPaid,
              totals.transferPaid,
              totals.tipPaid,
            ],
            backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
            borderWidth: 0,
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
    };
  }

  private salesTypeConfig(): ChartConfiguration {
    return {
      type: 'bar',
      data: {
        labels: ['Mesas', 'Delivery'],
        datasets: [
          {
            label: 'Ventas cerradas',
            data: [this.tableCount, this.deliveryCount],
            backgroundColor: ['#f59e0b', '#3b82f6'],
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, precision: 0 },
          },
        },
      },
    };
  }

  private activityConfig(): ChartConfiguration {
    const payments = this.collectPayments();

    if (this.isSingleDayRange) {
      const byHour = this.initHourlyBuckets();

      payments.forEach((payment) => {
        if (!payment.createdAt) return;
        const hour = new Date(payment.createdAt).getHours();
        const key = `${hour.toString().padStart(2, '0')}:00`;
        byHour[key] += paymentGrandTotal(payment);
      });

      return {
        type: 'line',
        data: {
          labels: Object.keys(byHour),
          datasets: [
            {
              label: 'Cobrado por hora',
              data: Object.values(byHour),
              borderColor: '#0ea5e9',
              backgroundColor: 'rgba(14,165,233,0.15)',
              fill: true,
              tension: 0.35,
            },
          ],
        },
        options: this.lineChartOptions('Cobrado por hora del día'),
      };
    }

    const byDay = this.initDailyBuckets();

    payments.forEach((payment) => {
      if (!payment.createdAt) return;
      const day = new Date(payment.createdAt).toLocaleDateString('es-CL');
      byDay[day] = (byDay[day] ?? 0) + paymentGrandTotal(payment);
    });

    const sortedDays = Object.keys(byDay).sort((a, b) => {
      const [da, ma, ya] = a.split('-').map(Number);
      const [db, mb, yb] = b.split('-').map(Number);
      return (
        new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime()
      );
    });

    return {
      type: 'bar',
      data: {
        labels: sortedDays,
        datasets: [
          {
            label: 'Total cobrado',
            data: sortedDays.map((day) => byDay[day]),
            backgroundColor: '#6366f1',
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Cobros por día',
          },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    };
  }

  private lineChartOptions(title: string) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: title },
      },
      scales: {
        y: { beginAtZero: true },
      },
    };
  }

  private collectPayments() {
    return (this.summary?.sales ?? []).flatMap((sale) => sale.payments ?? []);
  }

  private initHourlyBuckets(): Record<string, number> {
    const buckets: Record<string, number> = {};
    for (let hour = 0; hour < 24; hour++) {
      buckets[`${hour.toString().padStart(2, '0')}:00`] = 0;
    }
    return buckets;
  }

  private initDailyBuckets(): Record<string, number> {
    const buckets: Record<string, number> = {};
    const start = new Date(`${this.startDate}T00:00:00`);
    const end = new Date(`${this.endDate}T00:00:00`);

    for (
      let cursor = new Date(start);
      cursor <= end;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      buckets[cursor.toLocaleDateString('es-CL')] = 0;
    }

    return buckets;
  }

  private destroyCharts(): void {
    this.paymentMethodsChart?.destroy();
    this.salesTypeChart?.destroy();
    this.activityChart?.destroy();

    this.paymentMethodsChart = undefined;
    this.salesTypeChart = undefined;
    this.activityChart = undefined;
  }

  private todayDateString(): string {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60_000)
      .toISOString()
      .slice(0, 10);
  }
}
