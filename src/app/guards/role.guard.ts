import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkRole(route, state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkRole(childRoute, state.url);
  }

  private checkRole(route: ActivatedRouteSnapshot, url: string): Observable<boolean> {
    const expectedRoles = route.data['roles'] as string[];
    
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          // Store the attempted URL for redirecting after login
          localStorage.setItem('redirectUrl', url);
          this.router.navigate(['/public/login']);
          return false;
        }

        // If no roles are specified, just check authentication
        if (!expectedRoles || expectedRoles.length === 0) {
          return true;
        }

        // Check if user has required roles
        const hasRequiredRole = this.authService.hasAnyRole(expectedRoles);
        
        if (!hasRequiredRole) {
          // Navigate to access denied page or back to dashboard
          this.router.navigate(['/auth'], { 
            queryParams: { error: 'access-denied' }
          });
          return false;
        }

        return true;
      })
    );
  }
}
