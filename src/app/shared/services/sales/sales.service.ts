import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Sale } from '../../models/sales';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviroments/enviroment';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private apiUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  getSaleById(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/${id}`);
  }

  getSalesByClientId(filter = 'all'): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.apiUrl).pipe(
      map((sales: Sale[]) => {
        switch (filter) {
          case 'isDelivery':
            return sales.filter((s) => s.isDelivery);

          case 'isTable':
            return sales.filter((s) => !s.isDelivery);

          case 'all':
          case '':
          case null:
          case undefined:
          default:
            return sales;
        }
      }),
    );
  }

  addProductToSale(
    productId: number,
    saleId: number,
    quantity: number,
  ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-product`, {
      productId,
      saleId,
      quantity,
    });
  }

  createSale(
    tableNumber: number,
    isDelivery: boolean,
    customerNickname: string,
  ): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      tableNumber,
      isDelivery,
      customerNickname,
    });
  }

  closeSale(saleId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/close/${saleId}`, {});
  }

  deleteSale(saleNumber: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${saleNumber}`);
  }

  deleteProductSale(saleId: number, productId: number) {
    return this.http.delete<any>(
      `${this.apiUrl}/${saleId}/product/${productId}`,
    );
  }
}
