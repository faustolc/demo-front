import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/public/login',
    pathMatch: 'full'
  },
  {
    path: 'public',
    loadChildren: () => import('./public/public.module').then(m => m.PublicModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/public/login'
  }
];
