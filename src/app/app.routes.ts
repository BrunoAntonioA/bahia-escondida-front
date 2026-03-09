import { Routes } from '@angular/router';
import { ProductsComponent } from './business/products/products.component';
import { SalesComponent } from './business/sales/sales.component';
import { SalesDetailComponent } from './business/sales-detail/sales-detail.component';
import { HomeComponent } from './business/home/home.component';
import { DailyReportComponent } from './business/reports/daily-report/daily-report.component';
import { DeliverySalesComponent } from './business/delivery-sales/delivery-sales.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component'),
    children: [
      {
        path: 'ventas',
        loadComponent: () => SalesComponent,
      },
      {
        path: 'delivery',
        loadComponent: () => DeliverySalesComponent,
      },
      {
        path: 'productos',
        loadComponent: () => ProductsComponent,
      },
      {
        path: 'ventas/:id',
        loadComponent: () => SalesDetailComponent,
      },
      {
        path: '',
        redirectTo: 'ventas',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        loadComponent: () => HomeComponent,
      },
      {
        path: 'reporte-diario',
        loadComponent: () => DailyReportComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'ventas',
  },
];
