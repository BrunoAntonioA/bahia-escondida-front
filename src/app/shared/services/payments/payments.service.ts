import { Injectable } from '@angular/core';
import { environment } from '../../../../enviroments/enviroment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../../models/payments';

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  create(
    cashPaid: number,
    cardPaid: number,
    transferPaid: number,
    tipPaid: number,
    saleId: number,
  ): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}`, {
      cashPaid,
      cardPaid,
      transferPaid,
      tipPaid,
      saleId,
    });
  }
}
