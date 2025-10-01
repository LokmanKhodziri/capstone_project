package com.expensetracker.controller;

import com.expensetracker.model.User;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.UserService;
import com.expensetracker.payload.MessageResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000") // adjust if needed
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    /**
     * Get logged-in user profile
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Hide sensitive data
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    /**
     * Update profile (name, monthly income, etc.)
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Principal principal, @RequestBody User userUpdate) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(userUpdate.getName());
        user.setMonthlyIncome(userUpdate.getMonthlyIncome());

        User updatedUser = userService.save(user);

        // Hide sensitive data
        updatedUser.setPassword(null);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Simple endpoint to return the current Principal (username)
     */
    @GetMapping
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        return ResponseEntity.ok(new MessageResponse("Logged in as: " + principal.getName()));
    }
}
