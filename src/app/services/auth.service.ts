import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  picture_profile: string;
  created_at: string;
  updated_at: string;
  roles: Role[];
}

export interface Role {
  id: string;
  name: string;
  authorized_sections: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in on service initialization
    this.checkAuthStatus();
  }

  /**
   * Check authentication status from localStorage
   */
  private checkAuthStatus(): void {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        this.currentUserSubject.next(parsedUser);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.logout();
      }
    }
  }

  /**
   * Login user with credentials
   */
  login(username: string, password: string): Observable<boolean> {
    return this.http.post<any>('http://localhost:8000/api/login', { username, password }).pipe(
      map(response => {
        // Assuming response contains { token: string, user: { ... } }
        if (response && response.token && response.user) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
          return true;
        }
        return false;
      }),
      catchError(() => {
        return of(false);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Get current authentication status
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   *  Check if user has access to a specific section
   *  based on their roles and authorized sections.
   * @param section name of the section to check access for
   * @returns boolean indicating if user has access to the section
   */
  hasSectionAccess(section: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.roles.some(role => role.authorized_sections.includes(section));
  }
}
