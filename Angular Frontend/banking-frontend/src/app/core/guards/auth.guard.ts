import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // User is logged in, allow access
  } else {
    // User is not logged in, redirect to login page or initiate login flow
    router.navigate(['/login']); // Or authService.login();
    return false;
  }
};