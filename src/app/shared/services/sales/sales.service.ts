import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AddProductToSalePayload,
  Sale,
} from '../../models/sales';
import { SalesPaymentSummary } from '../../models/payment-summary';
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

  getPaymentSummary(
    startDate: string,
    endDate: string,
  ): Observable<SalesPaymentSummary> {
    return this.http.get<SalesPaymentSummary>(`${this.apiUrl}/summary`, {
      params: { startDate, endDate },
    });
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

  addProductToSale(payload: AddProductToSalePayload): Observable<SaleProductLineResponse> {
    return this.http.post<SaleProductLineResponse>(
      `${this.apiUrl}/add-product`,
      payload,
    );
  }

  createSale(
    tableNumber: number | null | undefined,
    isDelivery: boolean,
    customerNickname: string,
  ): Observable<Sale> {
    const body: Record<string, unknown> = {
      isDelivery,
    };

    if (isDelivery) {
      if (customerNickname.trim()) {
        body['customerNickname'] = customerNickname.trim();
      }
    } else if (tableNumber != null && tableNumber >= 1) {
      body['tableNumber'] = tableNumber;
    }

    return this.http.post<Sale>(this.apiUrl, body);
  }

  closeSale(saleId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/close/${saleId}`, {});
  }

  deleteSale(saleNumber: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${saleNumber}`);
  }

  deleteSaleProductLine(saleId: number, saleProductId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${saleId}/lines/${saleProductId}`,
    );
  }
}

interface SaleProductLineResponse {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
}
