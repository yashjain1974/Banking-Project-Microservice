import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { OAuthService } from 'angular-oauth2-oidc'; // Import OAuthService
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const oauthService = inject(OAuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const claims = oauthService.getIdentityClaims();
    console.log('AuthGuard: Identity Claims:', claims);

    const roles = authService.getUserRoles();
    console.log('AuthGuard: Roles:', roles);

    if (roles.includes('ADMIN')) {
      return true;
    } else {
      console.warn('AuthGuard: Not an ADMIN. Redirecting.');
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  try {
    await oauthService.loadDiscoveryDocumentAndTryLogin();

    if (oauthService.hasValidAccessToken()) {
      const claims = oauthService.getIdentityClaims();
      console.log('AuthGuard (Post-login): Claims:', claims);

      const roles = claims?.['realm_access']?.roles || [];
      if (roles.includes('ADMIN')) {
        return true;
      } else {
        console.warn('AuthGuard: Logged in but not ADMIN.');
        router.navigate(['/unauthorized']);
        return false;
      }
    } else {
      router.navigate(['/login']);
      return false;
    }
  } catch (err) {
    console.error('AuthGuard: Error during login attempt:', err);
    router.navigate(['/login']);
    return false;
  }
};
