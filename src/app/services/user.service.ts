import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface User {
  id: string;
  name: string;
  username: string;
  roles: Array<string>;
  email: string;
  phone: string;
  picture_profile: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8000/api/v1/users';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  addUser(user: { name: string; username: string; password: string }): Observable<User> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, user, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  editUser(id: string, user: { name: string; username: string; password?: string }): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}`, user, {
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

  /*   * Subir una foto de perfil para un usuario específico.
   * @param userId ID del usuario al que se le subirá la foto.
   * @param file Archivo de imagen a subir.
   * @returns Observable<User> que contiene los datos del usuario actualizado.
   */
  uploadProfilePhoto(userId: string, file: File): Observable<User> {
    const formData = new FormData();
    // La clave 'photo' debe coincidir con la que espera tu backend
    formData.append('photo', file, file.name);

    // IMPORTANTE: No establezcas 'Content-Type'.
    // El navegador lo hará automáticamente a 'multipart/form-data' con el boundary correcto.
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/${userId}/photo`, formData, { headers })
      .pipe(
        map(response => response.data)
      );
  }
}
