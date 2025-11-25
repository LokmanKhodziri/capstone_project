package com.expensetracker.controller;

import com.expensetracker.model.User;
import com.expensetracker.payload.AuthRequest;
import com.expensetracker.payload.AuthResponse;
import com.expensetracker.payload.MessageResponse;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.config.JwtUtil;
import com.expensetracker.service.CustomUserDetailsService;
import com.expensetracker.service.UserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller responsible for user registration, login and logout.
 *
 * Endpoints:
 * - POST /api/auth/register : register a new user
 * - POST /api/auth/login    : authenticate and obtain JWT token
 * - POST /api/auth/logout   : simple logout acknowledgement (client-side should remove token)
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // Adjust if needed
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired private UserRepository userRepository;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired @Qualifier("customUserDetailsService")
    private CustomUserDetailsService userDetailsService;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserService userService;

    /**
     * Register a new user. Validates that the username is not already taken
     * and delegates to UserService for persistence.
     * @param user user payload (username, password, etc.)
     * @return 200 OK with message on success or 400 with error message
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            if (userRepository.findByUsername(user.getUsername()).isPresent()) {
                return ResponseEntity.badRequest().body("Username already registered");
            }

            User registeredUser = userService.registerUser(user);

            logger.debug("User registered successfully: {}", registeredUser.getUsername());
            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (Exception e) {
            logger.error("Registration error for user: {}", user.getUsername(), e);
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    /**
     * Authenticate user credentials and return a JWT on success.
     * @param authRequest credential payload (username, password)
     * @return AuthResponse with token or 401/500 on failure
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        logger.debug("Login attempt for user: {}", authRequest.getUsername());

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    authRequest.getUsername(), 
                    authRequest.getPassword()
                )
            );

            UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getUsername());
            String token = jwtUtil.generateToken(userDetails);

            logger.debug("Login successful for user: {}", authRequest.getUsername());
            return ResponseEntity.ok(new AuthResponse(token, "User logged in successfully!"));

        } catch (BadCredentialsException e) {
            logger.error("Authentication failed for user: {}", authRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        } catch (Exception e) {
            logger.error("Login error for user: {}", authRequest.getUsername(), e);
            return ResponseEntity.internalServerError().body("An error occurred during authentication");
        }
    }
    
    /**
     * Logout endpoint. For stateless JWT auth this is mainly a client-side operation
     * (this endpoint returns a success message; token revocation would require server-side storage).
     * @return 200 OK message
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        return ResponseEntity.ok(new MessageResponse("User logged out successfully!"));
    }
}