package com.staynest.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

public class AuthDtos {

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class SignupRequest {
        private String name;
        private String email;
        private String password;
        private String phone;
        // Role is assigned as USER by default
    }

    @Data
    @AllArgsConstructor
    public static class JwtResponse {
        private String token;
        private String refreshToken;
        private Long id;
        private String name;
        private String email;
        private String role;
    }

    @Data
    public static class TokenRefreshRequest {
        private String refreshToken;
    }

    @Data
    @AllArgsConstructor
    public static class TokenRefreshResponse {
        private String token;
        private String refreshToken;
    }

    @Data
    @AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }
}
