package com.staynest.controller;

import com.staynest.controller.dto.AuthDtos;
import com.staynest.model.AuthProvider;
import com.staynest.model.Role;
import com.staynest.model.User;
import com.staynest.repository.UserRepository;
import com.staynest.model.RefreshToken;
import com.staynest.security.JwtUtils;
import com.staynest.security.RefreshTokenService;
import com.staynest.security.TokenRefreshException;
import com.staynest.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthDtos.LoginRequest loginRequest) {
        System.out.println("AuthController: Incoming login attempt for email: " + loginRequest.getEmail());
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();    
            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .orElse("ROLE_USER");

            RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

            return ResponseEntity.ok(new AuthDtos.JwtResponse(jwt,
                    refreshToken.getToken(),
                    userDetails.getId(), 
                    userDetails.getName(), 
                    userDetails.getEmail(), 
                    role));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthDtos.MessageResponse("Error: Login failed! " + e.getMessage()));
        }
    }

    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshtoken(@RequestBody AuthDtos.TokenRefreshRequest request) {
        try {
            String requestRefreshToken = request.getRefreshToken();

            return refreshTokenService.findByToken(requestRefreshToken)
                    .map(refreshTokenService::verifyExpiration)
                    .map(RefreshToken::getUser)
                    .map(user -> {
                        String token = jwtUtils.generateJwtTokenFromUser(user);
                        return ResponseEntity.ok(new AuthDtos.TokenRefreshResponse(token, requestRefreshToken));
                    })
                    .orElseThrow(() -> new TokenRefreshException(requestRefreshToken,
                            "Refresh token is not in database!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthDtos.MessageResponse("Error: Token refresh failed! " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody AuthDtos.SignupRequest signUpRequest) {
        System.out.println("AuthController: Incoming registration attempt for email: " + signUpRequest.getEmail());
        try {
            if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                return ResponseEntity
                        .badRequest()
                        .body(new AuthDtos.MessageResponse("Error: Email is already in use!"));
            }

            // Create new user's account
            User user = new User();
            user.setName(signUpRequest.getName());
            user.setEmail(signUpRequest.getEmail());
            user.setPassword(encoder.encode(signUpRequest.getPassword()));
            user.setPhone(signUpRequest.getPhone());
            if ("admin@staynest.com".equals(signUpRequest.getEmail())) {
                user.setRole(Role.ADMIN);
            } else {
                user.setRole(Role.USER);
            }
            user.setProvider(AuthProvider.LOCAL);

            userRepository.save(user);
            System.out.println("AuthController: User registered successfully in MySQL: " + user.getEmail());

            // AUTO-LOGIN after registration
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(signUpRequest.getEmail(), signUpRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();    
            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .orElse("ROLE_USER");

            RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

            return ResponseEntity.ok(new AuthDtos.JwtResponse(jwt,
                    refreshToken.getToken(),
                    userDetails.getId(), 
                    userDetails.getName(), 
                    userDetails.getEmail(), 
                    role));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthDtos.MessageResponse("Error: Registration failed! " + e.getMessage()));
        }
    }

    @GetMapping("/users")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/users")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminCreateUser(@RequestBody User userDetails) {
        if (userRepository.existsByEmail(userDetails.getEmail())) {
             return ResponseEntity.badRequest().body(new AuthDtos.MessageResponse("Error: Email is already in use!"));
        }
        User user = new User();
        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        user.setPhone(userDetails.getPhone());
        user.setPassword(encoder.encode(userDetails.getPassword() != null ? userDetails.getPassword() : "default123")); // fallback default
        user.setRole(userDetails.getRole() != null ? userDetails.getRole() : Role.USER);
        user.setProvider(com.staynest.model.AuthProvider.LOCAL);

        userRepository.save(user);
        return ResponseEntity.ok(new AuthDtos.MessageResponse("User created successfully by Admin!"));
    }

    @PutMapping("/users/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminUpdateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return userRepository.findById(id).map(user -> {
            user.setName(userDetails.getName());
            user.setPhone(userDetails.getPhone());
            if (userDetails.getRole() != null) {
                user.setRole(userDetails.getRole());
            }
            userRepository.save(user);
            return ResponseEntity.ok(new AuthDtos.MessageResponse("User updated successfully!"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminDeleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok(new AuthDtos.MessageResponse("User deleted successfully!"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/changePassword/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody java.util.Map<String, String> request) {
         String newPassword = request.get("newPassword");
         if (newPassword == null || newPassword.trim().isEmpty()) {
             return ResponseEntity.badRequest().body(new AuthDtos.MessageResponse("Error: Password cannot be empty!"));
         }
         return userRepository.findById(id).map(user -> {
              user.setPassword(encoder.encode(newPassword));
              userRepository.save(user);
              return ResponseEntity.ok(new AuthDtos.MessageResponse("Password updated successfully!"));
         }).orElse(ResponseEntity.notFound().build());
    }
}
