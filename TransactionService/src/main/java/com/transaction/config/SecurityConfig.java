package com.transaction.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity // Enables Spring Security's web security support
@EnableMethodSecurity(prePostEnabled = true) // Enables method-level security annotations like @PreAuthorize
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for stateless REST APIs. JWTs provide protection against CSRF.
            .csrf(csrf -> csrf.disable())
            // Configure authorization rules for HTTP requests
            .authorizeHttpRequests(authorize -> authorize
                // Allow H2 console for development (if exposed directly, which is not recommended for prod)
                .requestMatchers("/h2-console/**").permitAll()
                // All other requests must be authenticated.
                // This is the crucial line that ensures all other endpoints require a valid JWT.
                .anyRequest().authenticated()
            )
            // Configure OAuth2 Resource Server for JWT validation
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    // Use a custom JWT converter to extract roles from Keycloak JWT claims
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            )
            // Configure session management to be stateless, as JWTs handle authentication per request
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        return http.build();
    }

    /**
     * Configures a custom JwtAuthenticationConverter to extract roles (authorities) from the JWT.
     * Keycloak typically puts roles in a custom claim (e.g., "realm_access.roles" for realm roles).
     * @return A configured JwtAuthenticationConverter.
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        // Set the claim name where Keycloak stores the roles.
        // For realm roles, it's commonly "realm_access.roles".
        // For client roles, it might be "resource_access.<client-id>.roles".
        grantedAuthoritiesConverter.setAuthoritiesClaimName("realm_access.roles"); // Or "resource_access.<client-id>.roles"
        // Add a prefix to the extracted roles (e.g., "ADMIN" becomes "ROLE_ADMIN")
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }
}