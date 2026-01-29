import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class PrinterService {
  private apiUrl = `${environment.apiUrl}/print`; // backend endpoint

  constructor(private http: HttpClient) {}


}
