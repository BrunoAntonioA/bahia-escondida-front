import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product, ProductOptionInput } from '../models/product';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  addProduct(
    product: Product,
    options: ProductOptionInput[] = [],
  ): Observable<Product> {
    const body: Record<string, unknown> = {
      name: product.name,
      price: product.price,
      category: product.category,
    };

    if (options.length > 0) {
      body['options'] = options;
    }

    return this.http.post<Product>(this.apiUrl, body);
  }

  addProductOptions(
    productId: number,
    options: ProductOptionInput[],
  ): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${productId}/options`, {
      options,
    });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
