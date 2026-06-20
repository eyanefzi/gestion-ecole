package com.microservices.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * API Gateway Security Configuration
 *
 * Role-based access control via Keycloak JWT tokens:
 *
 *  PUBLIC  (no token required):
 *    - POST /api/auth/**          → login, register, refresh
 *    - GET  /api/courses/**       → browse courses
 *    - GET  /api/quizzes/**       → browse quizzes
 *    - /actuator/**               → health checks
 *
 *  STUDENT / TUTOR / ADMIN  (any authenticated user):
 *    - GET  /api/students/**      → own profile
 *    - POST /api/enrollments/**   → enroll in a course
 *
 *  TUTOR or ADMIN:
 *    - POST /api/courses/**       → create a course
 *    - PUT  /api/courses/**       → update a course
 *    - DELETE /api/courses/**     → delete a course
 *    - POST /api/quizzes/**       → create a quiz
 *    - PUT  /api/quizzes/**       → update a quiz
 *
 *  ADMIN only:
 *    - /api/students/admin/**     → manage all students
 *    - DELETE /api/students/**    → delete a student
 *    - DELETE /api/quizzes/**     → delete a quiz
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    // ─── Security Filter Chain ────────────────────────────────────────────────

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeExchange(exchanges -> exchanges

                // ── Public endpoints ──────────────────────────────────────────
                .pathMatchers("/actuator/**").permitAll()
                .pathMatchers("/api/auth/**").permitAll()
                
                // Swagger UI and API docs (public access)
                .pathMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/webjars/**").permitAll()
                .pathMatchers("/*/v3/api-docs").permitAll()

                // Public read-only access
                .pathMatchers("GET", "/api/courses/**").permitAll()
                .pathMatchers("GET", "/api/quizzes/**").permitAll()

                // ── ADMIN-only endpoints ──────────────────────────────────────
                .pathMatchers("/api/students/admin/**").hasRole("ADMIN")
                .pathMatchers("DELETE", "/api/students/**").hasRole("ADMIN")
                .pathMatchers("DELETE", "/api/quizzes/**").hasRole("ADMIN")

                // ── TUTOR or ADMIN endpoints ──────────────────────────────────
                .pathMatchers("POST", "/api/courses/**").hasAnyRole("TUTOR", "ADMIN")
                .pathMatchers("PUT", "/api/courses/**").hasAnyRole("TUTOR", "ADMIN")
                .pathMatchers("DELETE", "/api/courses/**").hasAnyRole("TUTOR", "ADMIN")
                .pathMatchers("POST", "/api/quizzes/**").hasAnyRole("TUTOR", "ADMIN")
                .pathMatchers("PUT", "/api/quizzes/**").hasAnyRole("TUTOR", "ADMIN")

                // ── Any authenticated user ────────────────────────────────────
                .pathMatchers("/api/students/**").authenticated()
                .pathMatchers("/api/enrollments/**").authenticated()

                // Deny everything else by default
                .anyExchange().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakJwtConverter()))
            );

        return http.build();
    }

    // ─── Keycloak JWT Role Converter ──────────────────────────────────────────

    /**
     * Keycloak stores roles inside realm_access.roles in the JWT payload.
     * Spring Security expects authorities prefixed with "ROLE_".
     * This converter bridges the two.
     */
    @Bean
    public Converter<Jwt, Mono<AbstractAuthenticationToken>> keycloakJwtConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new KeycloakRoleConverter());
        return new ReactiveJwtAuthenticationConverterAdapter(converter);
    }

    /**
     * Extracts roles from Keycloak JWT claims:
     *   - realm_access.roles  → realm-level roles (ADMIN, TUTOR, STUDENT)
     *   - resource_access.<clientId>.roles → client-level roles (optional)
     */
    static class KeycloakRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

        private static final String REALM_ACCESS  = "realm_access";
        private static final String RESOURCE_ACCESS = "resource_access";
        private static final String ROLES          = "roles";
        private static final String CLIENT_ID      = "microservices-client";

        @Override
        public Collection<GrantedAuthority> convert(Jwt jwt) {
            Collection<GrantedAuthority> authorities = extractRealmRoles(jwt);
            authorities.addAll(extractClientRoles(jwt));
            return authorities;
        }

        /** Extracts realm-level roles from realm_access.roles */
        private Collection<GrantedAuthority> extractRealmRoles(Jwt jwt) {
            Map<String, Object> realmAccess = jwt.getClaimAsMap(REALM_ACCESS);
            if (realmAccess == null || !realmAccess.containsKey(ROLES)) {
                return Collections.emptyList();
            }
            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) realmAccess.get(ROLES);
            return roles.stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                    .collect(Collectors.toList());
        }

        /** Extracts client-level roles from resource_access.<clientId>.roles */
        private Collection<GrantedAuthority> extractClientRoles(Jwt jwt) {
            Map<String, Object> resourceAccess = jwt.getClaimAsMap(RESOURCE_ACCESS);
            if (resourceAccess == null || !resourceAccess.containsKey(CLIENT_ID)) {
                return Collections.emptyList();
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> clientAccess = (Map<String, Object>) resourceAccess.get(CLIENT_ID);
            if (clientAccess == null || !clientAccess.containsKey(ROLES)) {
                return Collections.emptyList();
            }
            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) clientAccess.get(ROLES);
            return roles.stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                    .collect(Collectors.toList());
        }
    }

    // ─── CORS Configuration ───────────────────────────────────────────────────

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:4200",
                "http://localhost:8080"
        ));
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
