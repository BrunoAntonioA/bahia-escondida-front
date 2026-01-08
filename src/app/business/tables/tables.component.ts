import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Table {
  numero: number;
  comensales: number;
  estado: 'abierta' | 'cerrada' | 'sin pagar';
  monto: number;
}

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.css',
})
export default class TablesComponent {
  tables: Table[] = [];
  filteredTables: Table[] = [];
  newTable: Table = { numero: 0, comensales: 0, estado: 'abierta', monto: 0 };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.tables = [
      { numero: 1, comensales: 4, estado: 'abierta', monto: 45.5 },
      { numero: 2, comensales: 2, estado: 'cerrada', monto: 32.0 },
      { numero: 3, comensales: 5, estado: 'sin pagar', monto: 60.0 },
    ];
    this.filteredTables = [...this.tables];
  }

  filterStatus(status: string): void {
    this.filteredTables =
      status === 'all'
        ? [...this.tables]
        : this.tables.filter((m) => m.estado === status);
  }

  addMesa(): void {
    this.tables.push({ ...this.newTable });
    this.filteredTables = [...this.tables];
    this.newTable = { numero: 0, comensales: 0, estado: 'abierta', monto: 0 };
  }

  navegateToTableDetails(tableNumber: number) {
    this.router.navigate(['/tables', tableNumber]);
  }
}
