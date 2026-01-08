import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Sale } from '../../models/sales';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private apiUrl = `${environment.apiUrl}/sales`; // backend endpoint
  private clientId = 'bahia-escondida';

  constructor(private http: HttpClient) {}

  getSaleById(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/${id}`);
  }

  getSalesByClientId(): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.apiUrl}/client/${this.clientId}`);
  }

  addProductToSale(
    productId: number,
    saleId: number,
    quantity: number
  ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-product`, {
      productId,
      saleId,
      quantity,
    });
  }

  createSale(tableNumber: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, {
      tableNumber,
      clientId: this.clientId,
      status: 'abierta',
    });
  }

  closeSale(saleId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/close/${saleId}`, {});
  }
}
