package com.bank.apigateway.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebFluxSecurity // Enables Spring Security for WebFlux applications
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
            .csrf(ServerHttpSecurity.CsrfSpec::disable) // Disable CSRF for stateless REST APIs, common for JWT-based authentication
            .cors(Customizer.withDefaults()) // Enable CORS using the configuration defined in corsConfigurationSource()
            .authorizeExchange(exchanges -> exchanges
                // Public endpoints that do not require authentication
                .pathMatchers("/auth/register").permitAll() // Allow user registration endpoint to be publicly accessible
                .pathMatchers("/h2-console/**").permitAll() // Allow H2 console access. IMPORTANT: In production, restrict this heavily or remove it.
                .pathMatchers("/actuator/**").permitAll() // Allow actuator endpoints for monitoring. IMPORTANT: In production, secure these endpoints.
                .anyExchange().authenticated() // All other requests require a valid authentication token
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwtSpec -> jwtSpec // Configure JWT as the resource server token type
                    // FIX: Wrap the JwtAuthenticationConverter with ReactiveJwtAuthenticationConverterAdapter
                    .jwtAuthenticationConverter(new ReactiveJwtAuthenticationConverterAdapter(jwtAuthenticationConverter()))
                )
            );
        return http.build();
    }

    /**
     * Configures CORS (Cross-Origin Resource Sharing) for the API Gateway.
     * This allows your Angular frontend (or other specified origins) to make requests to this gateway.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Set allowed origins. For production, replace "http://localhost:4200" with your actual frontend domain(s).
        // ADD http://localhost:4300 here for the Admin Dashboard
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200", "http://localhost:4300")); // <--- UPDATED LINE
        // Set allowed HTTP methods (e.g., GET, POST, PUT, DELETE, OPTIONS for preflight requests)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Set allowed headers that can be sent in the request
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        // Allow sending of credentials (like cookies or Authorization headers) with the request
        configuration.setAllowCredentials(true);
        // How long the results of a preflight request can be cached (in seconds)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this CORS configuration to all incoming paths ("/**")
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Configures a custom JwtAuthenticationConverter to extract roles (authorities) from the JWT.
     * This is crucial for role-based access control.
     * It typically maps claims from the JWT (e.g., "realm_access.roles" from Keycloak) to Spring Security authorities.
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        // Specify the claim name in the JWT that contains the roles/authorities.
        // For Keycloak, this is often "realm_access.roles" or "resource_access.<client-id>.roles".
        grantedAuthoritiesConverter.setAuthoritiesClaimName("realm_access.roles");
        // Add a prefix to the extracted roles (e.g., "admin" becomes "ROLE_admin").
        // This is a common Spring Security convention.
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        // Set the configured JwtGrantedAuthoritiesConverter to the main JwtAuthenticationConverter
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }
}