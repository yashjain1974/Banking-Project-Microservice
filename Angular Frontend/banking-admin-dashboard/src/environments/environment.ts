export const environment = {
    production: false,
    apiUrl: 'http://localhost:9010', // Your API Gateway URL
    keycloak: {
        issuer: 'http://localhost:8080/realms/bank-realm', // Keycloak Realm URL
        clientId: 'bank-admin-frontend', // Client ID for your Admin Angular app in Keycloak
        redirectUri: 'http://localhost:4300', // Your Admin Angular app's base URL
        scope: 'openid profile email', // Scopes requested
        responseType: 'code', // Authorization Code Flow
        strictDiscoveryDocumentValidation: true,
        clearHashAfterLogin: true,
        nonceStateSeparator: 'auth',
    },
};