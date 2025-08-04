import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';

import { routes } from './app.routes';
import { provideOAuthClient, OAuthModuleConfig } from 'angular-oauth2-oidc';
import { environment } from '../environments/environment';
import { AuthService } from './core/services/auth.service';
import { tokenInterceptor } from './core/interceptors/token.interceptor';


// Define the OAuth configuration
export const authConfig: OAuthModuleConfig = {
  resourceServer: {
    allowedUrls: [environment.apiUrl], // Your API Gateway URL
    sendAccessToken: true,
  },
};

// Function to initialize AuthService
function initializeAuthService(authService: AuthService): () => Promise<void> {
  return () => Promise.resolve(authService.init());
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    provideOAuthClient(authConfig),
    AuthService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuthService,
      deps: [AuthService],
      multi: true,
    },
  ],
};
