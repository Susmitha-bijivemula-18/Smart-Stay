package com.staynest.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class AuthTokenFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String uri = request.getRequestURI();
        if (!uri.equals("/favicon.ico")) {
            System.out.println("AuthTokenFilter: Incoming " + request.getMethod() + " request to: " + uri);
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null) {
                System.out.println("AuthTokenFilter: Authorization Header found: " + (authHeader.length() > 15 ? authHeader.substring(0, 15) + "..." : authHeader));
            } else {
                System.out.println("AuthTokenFilter: NO Authorization Header found for " + uri);
            }
        }
        try {
            String jwt = parseJwt(request);
            if (jwt != null) {
                System.out.println("AuthTokenFilter: Found JWT in request. Validating...");
                if (jwtUtils.validateJwtToken(jwt)) {
                    String email = jwtUtils.getUserNameFromJwtToken(jwt);
                    System.out.println("AuthTokenFilter: JWT is valid for user: " + email);

                    try {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        System.out.println("AuthTokenFilter: Authentication set in SecurityContext");
                    } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
                        System.err.println("AuthTokenFilter: UsernameNotFoundException for: " + email);
                    }
                } else {
                    System.err.println("AuthTokenFilter: JWT VALIDATION FAILED for token in " + uri);
                }
            } else {
                // System.out.println("AuthTokenFilter: No JWT found in request headers.");
            }
        } catch (Exception e) {
            System.err.println("Cannot set user authentication: " + e.getMessage());
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}
