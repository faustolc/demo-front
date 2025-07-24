import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  code: string;
  name: string;
  brand: string;
  price: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8000/api/v1/products';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    // Ensure 'description' is not sent
    const { code, name, brand, price } = product;
    return this.http.post<Product>(this.apiUrl, { code, name, brand, price }, {
      headers: this.getAuthHeaders()
    });
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    // Ensure 'description' is not sent
    const { code, name, brand, price } = product;
    return this.http.put<Product>(`${this.apiUrl}/${id}`, { code, name, brand, price }, {
      headers: this.getAuthHeaders()
    });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  exportToPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/pdf`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  exportToExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/excel`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }
}
