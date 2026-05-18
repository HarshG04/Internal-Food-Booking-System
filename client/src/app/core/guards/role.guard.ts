import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    const role = auth.getRole();
    if (role && allowedRoles.includes(role)) {
      return true;
    }

    // Redirect to appropriate dashboard based on role
    if (role === 'VENDOR') router.navigate(['/vendor/dashboard']);
    else if (role === 'ADMIN') router.navigate(['/manager/dashboard']);
    else router.navigate(['/home']);
    return false;
  };
};
