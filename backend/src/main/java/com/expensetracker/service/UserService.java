package com.expensetracker.service;

import com.expensetracker.model.Role;
import com.expensetracker.model.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> getAllUsers();
    Optional<User> findById(Long id);
    User save(User user);
    void deleteById(Long id);
    Optional<User> findByUsername(String username);

    // used by AuthController — implement in UserServiceImpl
    User registerUser(User user);

    User updateUserRole(Long userId, Role role);
}