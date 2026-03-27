package com.healthcare.appointment.config;

import com.healthcare.appointment.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

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
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/appointments/doctors/search").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/v1/appointments/book").hasAnyRole("PATIENT", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/appointments/*/reschedule").hasAnyRole("PATIENT", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/appointments/*/cancel").hasAnyRole("PATIENT", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/appointments/*/accept").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/appointments/*/reject").hasAnyRole("DOCTOR", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/v1/appointments/patient/**").hasAnyRole("PATIENT", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/appointments/doctor/**").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/appointments/*/status").hasAnyRole("DOCTOR", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/v1/appointments/*").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
