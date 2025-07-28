import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Role {
  id: string;
  name: string;
  authorized_sections: string[];
  updated_at: string;
  created_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = 'http://localhost:8000/api/v1/roles';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<ApiResponse<Role[]>>(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  addRole(role: Role): Observable<Role> {
    return this.http.post<ApiResponse<Role>>(this.apiUrl, role, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  editRole(id: string, role:Role): Observable<Role> {
    return this.http.put<ApiResponse<Role>>(`${this.apiUrl}/${id}`, role, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data)
    );
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
