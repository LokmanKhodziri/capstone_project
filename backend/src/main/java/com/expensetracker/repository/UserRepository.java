package com.expensetracker.repository;

import com.expensetracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Keep if needed for other queries, otherwise can remove
import org.springframework.data.repository.query.Param; // Keep if needed for other queries, otherwise can remove

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}