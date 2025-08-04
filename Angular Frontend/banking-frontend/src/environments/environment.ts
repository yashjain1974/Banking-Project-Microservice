export const environment = {
    production: false,
    apiUrl: 'http://localhost:9010', // Your API Gateway URL
    keycloak: {
        issuer: 'http://localhost:8080/realms/bank-realm', // Keycloak Realm URL
        redirectUri: 'http://localhost:4200', // Your Angular app's base URL
        clientId: 'bank-frontend', // Client ID for your Angular app in Keycloak

        scope: 'openid profile email', // Scopes requested from Keycloak
        responseType: 'code', // Authorization Code Flow
        strictDiscoveryDocumentValidation: true, // Recommended for production
        clearHashAfterLogin: true, // Clears hash fragment after login
        nonceStateSeparator: 'auth', // Separator for nonce and state
    }
};