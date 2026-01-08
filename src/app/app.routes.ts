import { Routes } from '@angular/router';
import { ProductsComponent } from './business/products/products.component';
import TablesComponent from './business/tables/tables.component';
import DashboardComponent from './business/dashboard/dashboard.component';
import { TableDetailComponent } from './business/table-detail/table-detail.component';
import { SalesComponent } from './business/sales/sales.component';
import { SalesDetailComponent } from './business/sales-detail/sales-detail.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component'),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => DashboardComponent,
      },
      {
        path: 'tables',
        loadComponent: () => TablesComponent,
      },
      {
        path: 'tables/:id',
        loadComponent: () => TableDetailComponent,
      },
      {
        path: 'sales',
        loadComponent: () => SalesComponent,
      },
      {
        path: 'products',
        loadComponent: () => ProductsComponent,
      },
      {
        path: 'sales/:id',
        loadComponent: () => SalesDetailComponent,
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
