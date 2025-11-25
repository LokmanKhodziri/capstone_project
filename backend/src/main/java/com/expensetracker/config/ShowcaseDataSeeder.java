package com.expensetracker.config;

import com.expensetracker.model.Expense;
import com.expensetracker.model.RecurringExpense;
import com.expensetracker.model.User;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.RecurringExpenseRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Configuration
public class ShowcaseDataSeeder {

    private static final String SHOWCASE_PREFIX = "[Showcase]";
    private static final String SHOWCASE_RECURRING_PREFIX = "[Showcase Recurring]";
    private static final Map<Integer, List<ExpenseSample>> YEARLY_SAMPLES = buildSamples();

    @Bean
    public CommandLineRunner showcaseDataRunner(
            UserRepository userRepository,
            ExpenseRepository expenseRepository,
            RecurringExpenseRepository recurringExpenseRepository,
            @Value("${app.seed-showcase:false}") boolean seedShowcase,
            @Value("${app.showcase-username:user1}") String showcaseUsername
    ) {
        return args -> {
            if (!seedShowcase) {
                return;
            }

            User demoUser = userRepository.findByUsername(showcaseUsername)
                    .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));

            if (demoUser == null) {
                return;
            }

            List<Expense> existingExpenses = expenseRepository.findByUserId(demoUser.getId());
            boolean alreadySeeded = existingExpenses.stream()
                    .anyMatch(expense -> expense.getDescription() != null && expense.getDescription().startsWith(SHOWCASE_PREFIX));

            if (!alreadySeeded) {
                YEARLY_SAMPLES.forEach((year, samples) -> samples.forEach(sample -> {
                    Expense expense = new Expense();
                    expense.setUser(demoUser);
                    expense.setCategory(sample.category());
                    expense.setDescription(SHOWCASE_PREFIX + " " + sample.description());
                    expense.setAmount(sample.amount());
                    expense.setDate(LocalDate.of(year, sample.month(), sample.day()));
                    expenseRepository.save(expense);
                }));
            }

            List<RecurringExpense> recurringExpenses = recurringExpenseRepository.findByUserId(demoUser.getId());
            boolean recurringSeeded = recurringExpenses.stream()
                    .anyMatch(recurringExpense -> recurringExpense.getDescription() != null &&
                            recurringExpense.getDescription().startsWith(SHOWCASE_RECURRING_PREFIX));

            if (!recurringSeeded) {
                seedRecurringExpenses(recurringExpenseRepository, demoUser);
            }
        };
    }

    private void seedRecurringExpenses(RecurringExpenseRepository recurringExpenseRepository, User user) {
        List<RecurringExpense> showcaseRecurring = List.of(
                createRecurring("[Showcase Recurring] City Loft Rent", 1450.00, "Housing", 1, user),
                createRecurring("[Showcase Recurring] Premium Internet & Utilities", 185.50, "Utilities", 10, user),
                createRecurring("[Showcase Recurring] Fitness & Wellness Membership", 68.00, "Health", 5, user),
                createRecurring("[Showcase Recurring] Streaming Bundle", 32.00, "Entertainment", 18, user)
        );

        recurringExpenseRepository.saveAll(showcaseRecurring);
    }

    private static RecurringExpense createRecurring(String description, double amount, String category,
                                                    int dayOfMonth, User user) {
        RecurringExpense recurringExpense = new RecurringExpense();
        recurringExpense.setDescription(description);
        recurringExpense.setAmount(amount);
        recurringExpense.setCategory(category);
        recurringExpense.setRecurrenceDayOfMonth(dayOfMonth);
        recurringExpense.setUser(user);
        return recurringExpense;
    }

    private static Map<Integer, List<ExpenseSample>> buildSamples() {
        Map<Integer, List<ExpenseSample>> samples = new LinkedHashMap<>();
        for (int year = 2020; year <= 2025; year++) {
            int offset = year - 2020;
            samples.put(year, List.of(
                    new ExpenseSample(1, 12, 320 + offset * 12.5, "Groceries reset", "Food"),
                    new ExpenseSample(3, 4, 190 + offset * 9.0, "Quarterly utilities tune-up", "Utilities"),
                    new ExpenseSample(5, 18, 260 + offset * 11.0, "Co-working + transit pass", "Transportation"),
                    new ExpenseSample(8, 9, 410 + offset * 14.0, "Summer experiences", "Entertainment"),
                    new ExpenseSample(10, 3, 285 + offset * 10.5, "Health & wellness check", "Health"),
                    new ExpenseSample(12, 20, 540 + offset * 15.0, "Holiday travel stash", "Travel")
            ));
        }
        return samples;
    }

    private record ExpenseSample(int month, int day, double amount, String description, String category) {}
}

