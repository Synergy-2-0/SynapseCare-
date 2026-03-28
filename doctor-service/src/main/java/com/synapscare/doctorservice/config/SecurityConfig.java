package com.synapscare.doctorservice.config;

import com.synapscare.doctorservice.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)  // CORS handled by API Gateway
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // OPTIONS requests for CORS preflight
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        // Public endpoints
                        .requestMatchers(
                                "/api/doctors/search",
                                "/api/doctors/all",
                                "/api/doctors/{id}",
                                "/api/doctors/{id}/available-slots",
                                "/actuator/**"
                        ).permitAll()
                        // Doctor endpoints
                        .requestMatchers("/api/doctors/profile/**").hasRole("DOCTOR")
                        .requestMatchers("/api/doctors/availability/**").hasRole("DOCTOR")
                        .requestMatchers("/api/doctors/schedule/**").hasRole("DOCTOR")
                        .requestMatchers("/api/doctors/status").hasRole("DOCTOR")
                        .requestMatchers("/api/doctors/cases/**").hasRole("DOCTOR")
                        // Admin endpoints
                        .requestMatchers("/api/doctors/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/doctors/pending").hasRole("ADMIN")
                        .requestMatchers("/api/doctors/{id}/verify").hasRole("ADMIN")
                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CORS configuration is handled by the API Gateway, not by individual services
    // This bean is kept for reference but not used
    /*
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    */
}
