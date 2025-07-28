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
  ): Observable<boolean> {
    return this.checkAccess(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAccess(state.url);
  }

  /**
   * Revisa si el usuario está autenticado y si tiene acceso a la sección
   * especificada por el último segmento de la URL.
   * @param url La URL a la que se intenta acceder.
   * @returns Un observable que emite `true` si se permite el acceso, `false` si no.
   */
  private checkAccess(url: string): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        // 1. Primero, verificar si el usuario está autenticado
        if (!isAuthenticated) {
          localStorage.setItem('redirectUrl', url);
          this.router.navigate(['/public/login']);
          return false;
        }

        // 2. Extraer el nombre de la sección de la URL
        const urlSegments = url.split('/').filter(segment => segment); // Elimina segmentos vacíos
        const section = urlSegments[urlSegments.length - 1];

        // Si la URL es la base '/auth', se permite el paso al layout principal.
        if (section === 'auth' || !section) {
          return true;
        }

        // 3. Usar el servicio para verificar si el usuario tiene acceso a esta sección.
        // El método hasSectionAccess ya contiene la lógica de revisar roles.
        const hasAccess = this.authService.hasSectionAccess(section);

        if (hasAccess) {
          return true; // 4. Si tiene acceso, permitir la navegación
        } else {
          // 5. Si no tiene acceso, redirigir y denegar
          this.router.navigate(['/auth'], {
            queryParams: { error: 'access-denied' }
          });
          return false;
        }
      })
    );
  }
}
