import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core'; // Import Injector
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector); // Inject the Injector service

  // Lazily get AuthService from the injector
  // This breaks the circular dependency by delaying the instantiation of AuthService
  // until it's actually requested, after HttpClient and interceptors are set up.
  const authService = injector.get(AuthService);

  const accessToken = authService.getAccessToken();

  // Only add the token if it's available and the request is to your API Gateway
  if (accessToken && req.url.startsWith(environment.apiUrl)) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
    });
    return next(cloned);
  }

  return next(req);
};
