package com.synapscare.doctorservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            // The API Gateway validates the JWT statelessly and injects these headers
            String userIdParam = request.getHeader("X-User-Id");
            String userRole = request.getHeader("X-User-Role");
            String userEmail = request.getHeader("X-User-Email");

            if (StringUtils.hasText(userIdParam) && StringUtils.hasText(userRole)) {
                Long userId = Long.parseLong(userIdParam);
                Set<String> roles = new HashSet<>();
                roles.add(userRole);

                UserPrincipal userPrincipal = new UserPrincipal(
                        userId,
                        userEmail != null ? userEmail : "User",
                        userEmail,
                        roles
                );

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userPrincipal,
                                null,
                                userPrincipal.getAuthorities()
                        );

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                log.debug("Authenticated user {} with role {} from Gateway headers", userId, userRole);
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication from headers: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
