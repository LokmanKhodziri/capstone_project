package com.expensetracker.config;

import com.expensetracker.model.Role;
import com.expensetracker.model.User;
import com.expensetracker.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    @ConfigurationProperties(prefix = "app")
    public InitialUsersProperties initialUsersProperties() {
        return new InitialUsersProperties();
    }

    @Bean
    public CommandLineRunner initializer(UserRepository userRepository, PasswordEncoder passwordEncoder, InitialUsersProperties initialUsersProperties) {
        return args -> {
            if (initialUsersProperties.getInitialUsers() != null) {
                initialUsersProperties.getInitialUsers().forEach(userProps -> {
                    userRepository.findByUsername(userProps.getUsername()).ifPresentOrElse(
                        user -> {
                            // If user exists, update role if specified
                            if (userProps.getRole() != null && !user.getRole().equals(userProps.getRole())) {
                                user.setRole(userProps.getRole());
                                userRepository.save(user);
                            }
                        },
                        () -> {
                            // If user does not exist, create a new one
                            User user = new User();
                            user.setUsername(userProps.getUsername());
                            user.setEmail(userProps.getEmail());
                            user.setPassword(passwordEncoder.encode(userProps.getPassword()));
                            user.setRole(userProps.getRole());
                            userRepository.save(user);
                        }
                    );
                });
            }
        };
    }

    public static class InitialUsersProperties {
        private List<UserProperties> initialUsers = new ArrayList<>();

        public List<UserProperties> getInitialUsers() {
            return initialUsers;
        }

        public void setInitialUsers(List<UserProperties> initialUsers) {
            this.initialUsers = initialUsers;
        }
    }

    public static class UserProperties {
        private String username;
        private String email;
        private String password;
        private Role role;

        // Getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
    }
}
