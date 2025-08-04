import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core'; // Import APP_INITIALIZER

import { routes } from './app.routes';
import { provideOAuthClient, OAuthModuleConfig } from 'angular-oauth2-oidc';
import { environment } from '../environments/environment';
import { tokenInterceptor } from './core/interceptors/token.interceptor';
import { AuthService } from './core/services/auth.service';


// Define the OAuth configuration
export const authConfig: OAuthModuleConfig = {
  resourceServer: {
    allowedUrls: [environment.apiUrl],
    sendAccessToken: true,
  },
};

// Function to initialize AuthService
function initializeAuthService(authService: AuthService): () => Promise<void> {
  return () => Promise.resolve(authService.init()); // Ensure a Promise is returned
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    provideOAuthClient(authConfig),
    AuthService, // Provide AuthService so it can be injected
    {
      provide: APP_INITIALIZER, // Use APP_INITIALIZER to run code on app startup
      useFactory: initializeAuthService,
      deps: [AuthService], // Inject AuthService into the factory function
      multi: true, // Allow multiple APP_INITIALIZER tokens
    },
  ],
};
