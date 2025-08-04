import { Injectable } from '@angular/core';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private initialized = false;

  constructor(private oauthService: OAuthService) { }

  public async init(): Promise<void> {
    if (this.initialized) {
      console.log('AuthService already initialized.');
      return;
    }
    this.initialized = true;

    console.log('AuthService: Starting initialization...');

    const authConfig: AuthConfig = {
      issuer: environment.keycloak.issuer,
      redirectUri: environment.keycloak.redirectUri,
      clientId: environment.keycloak.clientId,
      scope: environment.keycloak.scope,
      responseType: environment.keycloak.responseType,
      strictDiscoveryDocumentValidation: environment.keycloak.strictDiscoveryDocumentValidation,
      clearHashAfterLogin: environment.keycloak.clearHashAfterLogin,
      nonceStateSeparator: environment.keycloak.nonceStateSeparator,
      // Temporarily disable for debugging if discovery fails, but re-enable for prod
      // strictDiscoveryDocumentValidation: false,
      // skipIssuerCheck: true,
    };

    this.oauthService.configure(authConfig);
    this.oauthService.setupAutomaticSilentRefresh();

    console.log('AuthService: Attempting to load discovery document and try login...');
    try {
      // loadDiscoveryDocumentAndTryLogin returns a Promise
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();
      console.log('AuthService: loadDiscoveryDocumentAndTryLogin completed.');

      if (this.oauthService.hasValidAccessToken()) {
        console.log('AuthService: User HAS a valid access token. Claims:', this.oauthService.getIdentityClaims());
      } else {
        console.log('AuthService: No valid access token found AFTER tryLogin. User not logged in.');
        // This is the message you are seeing. We need to find out why it's still here.
      }
    } catch (error) {
      console.error('AuthService: Error during discovery document load or login attempt:', error);
      // Look for errors here: CORS, network, invalid discovery document.
    }

    this.oauthService.events
      .pipe(filter((e) => e.type === 'token_received'))
      .subscribe((e) => {
        console.log('AuthService: Event - Access Token Received!', e);
        console.log('AuthService: Claims after token_received:', this.oauthService.getIdentityClaims());
      });

    this.oauthService.events
      .pipe(filter((e) => e.type === 'session_terminated'))
      .subscribe((e) => {
        console.log('AuthService: Event - Session terminated!', e);
        this.oauthService.logOut();
      });

    this.oauthService.events
      .pipe(filter((e) => e.type === 'discovery_document_load_error'))
      .subscribe((e) => {
        console.error('AuthService: Event - Discovery Document Load Error!', e);
      });

    this.oauthService.events
      .pipe(filter((e) => e.type === 'token_error'))
      .subscribe((e) => {
        console.error('AuthService: Event - Token Error!', e);
        // This event would fire if the POST /token request fails.
      });

    console.log('AuthService: Initialization complete.');
  }

  public login(): void {
    console.log('AuthService: Initiating login flow...');
    this.oauthService.initLoginFlow(); // Redirects to Keycloak login page
  }

  public logout(): void {
    console.log('AuthService: Logging out...');
    this.oauthService.logOut();
  }

  public isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  public getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }

  public getIdentityClaims(): any {
    return this.oauthService.getIdentityClaims();
  }
}