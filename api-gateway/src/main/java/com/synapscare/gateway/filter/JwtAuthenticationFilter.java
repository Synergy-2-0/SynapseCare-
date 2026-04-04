package com.synapscare.gateway.filter;

import com.synapscare.gateway.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Global JWT Authentication Filter for the API Gateway.
 *
 * Flow:
 *   1. If the request targets a public/auth path → pass through without JWT check.
 *   2. Otherwise, extract the Bearer token from the Authorization header.
 *   3. Validate the token signature and expiration using the shared secret.
 *   4. If valid, extract userId, role, and email from the claims and forward them
 *      as custom request headers (X-User-Id, X-User-Role, X-User-Email) to the
 *      downstream service.
 *   5. If invalid or missing, return 401 Unauthorized immediately.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    /**
     * Paths that are publicly accessible — no JWT required.
     * Supports Ant-style patterns.
     */
    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/**",
            "/actuator/**",
            "/api/doctors/search",
            "/api/doctors/all",
            "/api/doctors/*",
            "/api/appointments/doctor/*/available-slots",
            "/api/payments/payhere/notify"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        // ── Step 0: bypass filter for CORS preflight requests ─────────────────
        if ("OPTIONS".equalsIgnoreCase(request.getMethod().name())) {
            log.debug("OPTIONS preflight '{}' — bypassing JWT validation", path);
            return chain.filter(exchange);
        }

        // ── Step 1: bypass filter for public paths ────────────────────────────
        if (isPublicPath(path)) {
            log.debug("Public path '{}' — bypassing JWT validation", path);
            return chain.filter(exchange);
        }

        // ── Step 2: extract token ─────────────────────────────────────────────
        String token = extractToken(request);
        if (!StringUtils.hasText(token)) {
            log.warn("Missing or malformed Authorization header for path: {}", path);
            return unauthorizedResponse(exchange, "Missing Authorization header");
        }

        // ── Step 3: validate token ────────────────────────────────────────────
        if (!jwtUtil.validateToken(token)) {
            log.warn("Invalid JWT for path: {}", path);
            return unauthorizedResponse(exchange, "Invalid or expired token");
        }

        // ── Step 4: extract claims and forward as headers ─────────────────────
        try {
            String userId = jwtUtil.extractUserId(token);
            String role   = jwtUtil.extractRole(token);
            String email  = jwtUtil.extractSubject(token);

            log.debug("JWT valid — userId={}, role={}, forwarding to {}", userId, role, path);

            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-User-Id",    userId != null ? userId : "")
                    .header("X-User-Role",  role   != null ? role   : "")
                    .header("X-User-Email", email  != null ? email  : "")
                    // Strip the original Authorization header so downstream
                    // services still do their own full RabbitMQ-based validation
                    // (the header is kept; downstream services re-validate via AMQP)
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());

        } catch (Exception e) {
            log.error("Error extracting JWT claims: {}", e.getMessage());
            return unauthorizedResponse(exchange, "Token processing error");
        }
    }

    @Override
    public int getOrder() {
        // Run before any other gateway filters
        return Ordered.HIGHEST_PRECEDENCE;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private boolean isPublicPath(String path) {
        if (path.startsWith("/api/doctors/profile")) return false; // Explicitly NOT public
        if (path.startsWith("/api/doctors/availability")) return false; 
        if (path.startsWith("/api/doctors/schedule")) return false;

        if (pathMatcher.match("/api/doctors/*", path)) return true;
        if (pathMatcher.match("/api/doctors/*/available-slots", path)) return true;
        
        return PUBLIC_PATHS.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    private String extractToken(ServerHttpRequest request) {
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private Mono<Void> unauthorizedResponse(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json");
        response.getHeaders().add("Access-Control-Allow-Origin", "http://localhost:3000");
        response.getHeaders().add("Access-Control-Allow-Credentials", "true");
        byte[] body = ("{\"error\": \"Unauthorized\", \"message\": \"" + message + "\"}").getBytes();
        return response.writeWith(
                Mono.just(response.bufferFactory().wrap(body))
        );
    }
}
