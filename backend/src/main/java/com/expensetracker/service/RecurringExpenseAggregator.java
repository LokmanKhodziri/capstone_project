package com.expensetracker.service;

import com.expensetracker.model.Expense;
import com.expensetracker.model.RecurringExpense;
import com.expensetracker.model.User;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

/**
 * Helper to generate Expense instances from recurring rules for a given user
 * within a date range. Centralizes recurring expansion logic so callers
 * can reuse the same behavior consistently.
 *
 * CHANGE NOTE:
 * - This component was introduced to centralize the logic that expands
 *   recurring expense rules (RecurringExpense) into concrete Expense
 *   instances for a user over a date range. Callers (services/controllers)
 *   should use this to ensure consistent behavior across the codebase and
 *   to avoid duplication of the expansion algorithm.
 * - Typical usages: `ExpenseServiceImpl.generateRecurringExpenses(...)`
 *   and the debug endpoint in `ExpenseController`.
 */
@Component
public class RecurringExpenseAggregator {

    @Autowired
    private RecurringExpenseService recurringExpenseService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Generate Expense objects from recurring rules owned by the user for the
     * inclusive date range [start, end]. If category is non-null, only rules
     * matching that category are considered.
     */
    public List<Expense> generateRecurringExpensesForUserBetween(Long userId, LocalDate start, LocalDate end, String category) {
        var userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return List.of();
        User user = userOpt.get();

        List<RecurringExpense> recurringExpenses = recurringExpenseService.getRecurringExpenses(user.getUsername());
        List<Expense> generated = new ArrayList<>();

        for (RecurringExpense r : recurringExpenses) {
            if (category != null && !category.equals(r.getCategory())) continue;

            // iterate months between start and end
            YearMonth startYm = YearMonth.from(start);
            YearMonth endYm = YearMonth.from(end);
            YearMonth cur = startYm;
            int idx = 0;
            while (!cur.isAfter(endYm)) {
                if (r.getRecurrenceDayOfMonth() <= cur.lengthOfMonth()) {
                    LocalDate expenseDate = LocalDate.of(cur.getYear(), cur.getMonth(), r.getRecurrenceDayOfMonth());
                    if (!expenseDate.isBefore(start) && !expenseDate.isAfter(end)) {
                        Expense e = new Expense();
                        e.setAmount(r.getAmount());
                        e.setCategory(r.getCategory());
                        e.setDescription(r.getDescription());
                        e.setDate(expenseDate);
                        e.setUser(user);
                        // temporary unique id to help front-end keys (not persisted)
                        e.setId((r.getId() == null ? 0L : r.getId()) * 10000 + idx);
                        generated.add(e);
                    }
                }
                cur = cur.plusMonths(1);
                idx++;
            }
        }

        return generated;
    }
}
