import { Injectable } from '@angular/core';

export interface TableProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class TableService {
  constructor() {}
  getProductsForTable(tableId: number): TableProduct[] {
    // Simulated API response
    const mockProducts: TableProduct[] = [
      {
        id: 1,
        name: 'Pizza Margarita',
        category: 'Comida',
        price: 12.99,
        quantity: 1,
      },
      {
        id: 2,
        name: 'Coca-Cola',
        category: 'Bebestible',
        price: 2.99,
        quantity: 2,
      },
      {
        id: 3,
        name: 'Postre de Chocolate',
        category: 'Comida',
        price: 5.5,
        quantity: 1,
      },
    ];
    return mockProducts;
  }
}
