package com.expensetracker.config;

import com.expensetracker.model.Expense;
import com.expensetracker.model.User;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Configuration
public class DemoDataSeeder {

    @Bean
    public CommandLineRunner seedDemoData(UserRepository userRepository, ExpenseRepository expenseRepository,
                                         @Value("${app.seed-demo:false}") boolean seedDemo) {
        return args -> {
            if (!seedDemo) return; // do nothing unless enabled

            List<User> users = userRepository.findAll();
            if (users.isEmpty()) return;

            String[] categories = new String[]{"Food", "Travel", "Utilities", "Entertainment", "Other"};
            Random rnd = new Random(12345);

            for (User user : users) {
                // If user already has expenses, skip seeding for them
                var existing = expenseRepository.findByUserId(user.getId());
                if (existing != null && !existing.isEmpty()) continue;

                // Create sample expenses across the last 6 years
                int currentYear = LocalDate.now().getYear();
                for (int year = currentYear - 5; year <= currentYear; year++) {
                    // Create a few expenses per year (6-12)
                    int count = 6 + rnd.nextInt(7);
                    for (int i = 0; i < count; i++) {
                        int month = 1 + rnd.nextInt(12);
                        int day = 1 + rnd.nextInt(28);
                        LocalDate date = LocalDate.of(year, month, day);

                        Expense e = new Expense();
                        e.setUser(user);
                        e.setDate(date);
                        e.setCategory(categories[rnd.nextInt(categories.length)]);
                        e.setDescription("Demo expense");
                        // amount between 5 and 200
                        double amount = Math.round((5 + rnd.nextDouble() * 195) * 100.0) / 100.0;
                        e.setAmount(amount);
                        expenseRepository.save(e);
                    }
                }
            }
        };
    }
}
