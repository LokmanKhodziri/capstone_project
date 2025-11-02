package com.expensetracker.controller;

import com.expensetracker.model.Expense;
import com.expensetracker.model.User;
import com.expensetracker.model.Role;
import com.expensetracker.service.ExpenseService;
import com.expensetracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Administrative controller exposing endpoints restricted to users with ADMIN role.
 *
 * Endpoints:
 * - GET  /api/admin/users                    : list all users (ADMIN only)
 * - PUT  /api/admin/users/{userId}/role      : update a user's role (ADMIN only)
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private ExpenseService expenseService;

    /**
     * Return a list of all registered users. Restricted to ADMIN role.
     * @return list of User
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    /**
     * Return expenses for a specific user. Restricted to ADMIN role.
     * This endpoint is used by admin tests and admin UI.
     * @param userId id of the user whose expenses to retrieve
     * @return list of Expense
     */
    @GetMapping("/expenses")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Expense> getExpensesByUserId(@RequestParam Long userId) {
        // CHANGE NOTE: Added to provide an admin-facing endpoint for
        // retrieving a user's expenses. This method is intentionally
        // simple and delegates to ExpenseService. Tests rely on this
        // mapping to validate role-based access control.
        return expenseService.getExpensesByUserId(userId);
    }

    

    record RoleUpdateRequest(Role role) {}

    /**
     * Update the role of a user. Only accessible by ADMIN.
     * @param userId id of the user to update
     * @param request payload containing the new Role
     * @return updated User on success or 400 with error message
     */
    @PutMapping("/users/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId, @RequestBody RoleUpdateRequest request) {
        try {
            User updatedUser = userService.updateUserRole(userId, request.role());
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
