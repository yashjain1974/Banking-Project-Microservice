import { Injectable } from '@angular/core';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';
import { filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
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
        };

        this.oauthService.configure(authConfig);
        this.oauthService.setupAutomaticSilentRefresh();

        console.log('AuthService: Attempting to load discovery document and try login...');
        try {
            await this.oauthService.loadDiscoveryDocumentAndTryLogin();
            console.log('AuthService: loadDiscoveryDocumentAndTryLogin completed.');

            if (this.oauthService.hasValidAccessToken()) {
                console.log('AuthService: User HAS a valid access token. Claims:', this.oauthService.getIdentityClaims());
            } else {
                console.log('AuthService: No valid access token found AFTER tryLogin. User not logged in.');
            }
        } catch (error) {
            console.error('AuthService: Error during discovery document load or login attempt:', error);
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
            });

        console.log('AuthService: Initialization complete.');
    }

    public login(): void {
        console.log('AuthService: Initiating login flow...');
        this.oauthService.initLoginFlow();
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
    public getUserRoles(): string[] {
        const accessToken = this.oauthService.getAccessToken();
        if (!accessToken) return [];

        const decodedToken = this.decodeToken(accessToken);
        return decodedToken?.realm_access?.roles || [];
    }

    private decodeToken(token: string): any {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        } catch (e) {
            console.error('Failed to decode access token:', e);
            return null;
        }
    }
}