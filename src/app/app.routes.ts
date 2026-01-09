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
        path: 'ventas',
        loadComponent: () => SalesComponent,
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
    ],
  },
  {
    path: '**',
    redirectTo: 'ventas',
  },
];
