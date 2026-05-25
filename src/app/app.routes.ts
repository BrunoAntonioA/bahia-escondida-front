import { Routes } from '@angular/router';
import { ProductsComponent } from './business/products/products.component';
import { SalesComponent } from './business/sales/sales.component';
import { SalesDetailComponent } from './business/sales-detail/sales-detail.component';
import { HomeComponent } from './business/home/home.component';
import { DailyReportComponent } from './business/reports/daily-report/daily-report.component';
import { DeliverySalesComponent } from './business/delivery-sales/delivery-sales.component';
import { LoginComponent } from './business/login/login.component';
import { authGuard } from './auth/guards/auth.guard';
import { loginGuard } from './auth/guards/login.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard],
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component'),
    canActivate: [authGuard],
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
        path: 'delivery/:id',
        loadComponent: () => SalesDetailComponent,
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
      {
        path: 'ventas-abiertas',
        loadComponent: () =>
          import('./business/open-sales/open-sales.component').then(
            (m) => m.OpenSalesComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
