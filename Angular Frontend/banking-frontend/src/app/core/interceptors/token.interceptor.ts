import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core'; // Import Injector
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector); // Inject the Injector service

  
  const authService = injector.get(AuthService);

  const accessToken = authService.getAccessToken();

 
  if (accessToken && req.url.startsWith(environment.apiUrl)) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
    });
    return next(cloned);
  }

  return next(req);
};
