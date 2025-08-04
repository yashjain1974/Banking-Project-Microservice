package com.userMicroservice.config;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for the Keycloak Admin Client.
 * This client is used by the User Microservice to programmatically interact
 * with Keycloak's Admin REST API (e.g., creating users, assigning roles).
 */
@Configuration
public class KeycloakAdminClientConfig {

    @Value("${keycloak.admin.url}")
    private String keycloakAdminUrl;

    @Value("${keycloak.admin.realm}")
    private String keycloakAdminRealm;

    @Value("${keycloak.admin.client-id}")
    private String keycloakAdminClientId; // e.g., 'admin-cli' or a custom service account client

    @Value("${keycloak.admin.client-secret}")
    private String keycloakAdminClientSecret; // Client secret for the admin client

    @Value("${keycloak.admin.username}")
    private String keycloakAdminUsername; // Admin user for direct login (less secure for prod)

    @Value("${keycloak.admin.password}")
    private String keycloakAdminPassword; // Password for admin user

    /**
     * Provides a Keycloak Admin Client instance.
     * This client will be used to interact with Keycloak's Admin REST API.
     *
     * IMPORTANT: For production, it's highly recommended to use a Service Account
     * (client credentials grant) instead of direct admin username/password for security.
     * The example below shows both, prefer client credentials.
     */
    @Bean
    public Keycloak keycloakAdminClient() {
        // Option 1: Using Client Credentials Grant (Recommended for production)
        // Ensure your 'keycloakAdminClientId' is a confidential client with 'Service accounts enabled' in Keycloak.
        // And assign it 'manage-users' role in Keycloak's 'Client roles' for 'realm-management'.
        try {
            return KeycloakBuilder.builder()
                .serverUrl(keycloakAdminUrl)
                .realm(keycloakAdminRealm)
                .clientId(keycloakAdminClientId)
                .clientSecret(keycloakAdminClientSecret)
                .grantType("client_credentials") // Use client credentials grant
                .build();
        } catch (Exception e) {
            System.err.println("Failed to build Keycloak Admin Client with client credentials, falling back to admin user/pass: " + e.getMessage());
            // Option 2: Fallback to direct admin username/password (for development/simplicity)
            // Less secure for production as it stores admin credentials directly.
            return KeycloakBuilder.builder()
                .serverUrl(keycloakAdminUrl)
                .realm(keycloakAdminRealm)
                .username(keycloakAdminUsername)
                .password(keycloakAdminPassword)
                .clientId("admin-cli") // Standard Keycloak admin client
                .grantType("password") // Use password grant for admin user
                .build();
        }
    }
}
