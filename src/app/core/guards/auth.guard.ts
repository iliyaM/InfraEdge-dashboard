import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth: AuthService = inject(AuthService);
  const router: Router = inject(Router);
  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
