package com.expensetracker.service;

import com.expensetracker.model.Expense;
import com.expensetracker.model.User;
import com.expensetracker.payload.ExpenseSummaryDTO;
import com.expensetracker.payload.MonthlyExpenseSummaryDTO;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import com.expensetracker.model.RecurringExpense;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
 

/**
 * Service implementation that handles business logic for expenses.
 *
 * Responsibilities:
 * - persist and retrieve expenses
 * - combine persisted expenses with generated instances for recurring expenses
 * - produce expense summaries used by the API
 */
@Service
public class ExpenseServiceImpl implements ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecurringExpenseService recurringExpenseService;

    

    @Autowired
    // Centralized recurring-expansion component.
    // NOTE: This aggregator was added so that all summary and listing
    // code paths can generate recurring instances using a single, tested
    // implementation. It is injected when available; tests may leave it
    // null and the compatibility helper below will fall back to the
    // previous in-class generation logic.
    private RecurringExpenseAggregator recurringExpenseAggregator;

    /**
     * Compatibility helper: generate recurring expenses for the user between start and end.
     * If the Aggregator component is available use it, otherwise fall back to the
     * older in-class generation using RecurringExpenseService (helps tests and bootstrapping).
    *
    * CHANGE NOTE:
    * - Callers should use this helper rather than duplicating the expansion logic.
    * - The helper prefers `RecurringExpenseAggregator` (single source of truth).
     */
    private List<Expense> generateRecurringExpenses(Long userId, LocalDate start, LocalDate end, String category) {
        if (recurringExpenseAggregator != null) {
            return recurringExpenseAggregator.generateRecurringExpensesForUserBetween(userId, start, end, category);
        }
        var userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return List.of();
        User user = userOpt.get();
        List<RecurringExpense> rules = recurringExpenseService.getRecurringExpenses(user.getUsername());
        List<Expense> generated = new ArrayList<>();
        YearMonth startYm = YearMonth.from(start);
        YearMonth endYm = YearMonth.from(end);
        for (RecurringExpense r : rules) {
            if (category != null && !category.equals(r.getCategory())) continue;
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

    /**
     * Persist a new expense and associate it with the user identified by username.
     * @param expense Expense to save
     * @param username username of the owner
     * @return saved Expense entity
     */
    @Override
    public Expense addExpense(Expense expense, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        expense.setUser(user);
        return expenseRepository.save(expense);
    }

    /**
     * Retrieve all persisted expenses for the given user and append generated
     * instances for recent recurring expenses so the UI can display them.
     * @param username owner's username
     * @return combined list of persisted and generated Expense objects
     */
    @Override
    public List<Expense> getAllExpenses(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        List<Expense> expenses = expenseRepository.findByUserId(user.getId());
        // generate recurring instances for the last 12 months using central helper
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusMonths(11).withDayOfMonth(1);
        LocalDate end = today;
    List<Expense> generatedExpenses = generateRecurringExpenses(user.getId(), start, end, null);

        // merge persisted and generated (persisted wins if same date+category)
        java.util.Set<String> persistedKeys = expenses.stream()
                .map(p -> p.getDate() == null ? "" : (p.getDate().toString() + "|" + (p.getCategory() == null ? "" : p.getCategory())))
                .collect(Collectors.toSet());
        List<Expense> merged = new ArrayList<>(expenses);
        for (Expense g : generatedExpenses) {
            String key = g.getDate() == null ? "" : (g.getDate().toString() + "|" + (g.getCategory() == null ? "" : g.getCategory()));
            if (!persistedKeys.contains(key)) merged.add(g);
        }
        return merged;
    }

    /**
     * Get an expense by id ensuring the expense belongs to the specified user.
     * @param id expense id
     * @param username owner's username
     * @return Expense if found and owned by user
     */
    @Override
    public Expense getExpenseById(Long id, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        return expenseRepository.findById(id)
                .filter(expense -> expense.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Expense not found"));
    }

    /**
     * Update an existing expense (owner-checked) with new values.
     * @param id expense id
     * @param expense new expense data
     * @param username owner's username
     * @return updated Expense
     */
    @Override
    public Expense updateExpense(Long id, Expense expense, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Expense existingExpense = expenseRepository.findById(id)
                .filter(exp -> exp.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        existingExpense.setDescription(expense.getDescription());
        existingExpense.setAmount(expense.getAmount());
        existingExpense.setDate(expense.getDate());
        existingExpense.setCategory(expense.getCategory());

        return expenseRepository.save(existingExpense);
    }

    /**
     * Delete an expense if it belongs to the user.
     * @param id expense id to delete
     * @param username owner's username
     */
    @Override
    public void deleteExpense(Long id, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not a found"));
        Expense expense = expenseRepository.findById(id)
                .filter(exp -> exp.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        expenseRepository.delete(expense);
    }

    /**
     * Save an expense entity. Used internally by controllers to persist updates.
     * @param expense expense to save
     * @return saved Expense
     */
    @Override
    public Expense save(Expense expense) { // This method is used by the controller's update method
        return expenseRepository.save(expense);
    }

    /**
     * Find expense by id.
     * @param id expense id
     * @return Optional Expense
     */
    @Override
    public Optional<Expense> findById(Long id) { // This method is used by the controller's update method
        return expenseRepository.findById(id);
    }

    

    /**
     * Return expense summary grouped by category for the requested month and year.
     */
    @Override
    public List<ExpenseSummaryDTO> getExpenseSummaryByCategory(Long userId, int month, int year, boolean includeRecurring) {
        // start with persisted category aggregates
        List<ExpenseSummaryDTO> persisted = expenseRepository.findExpenseSummaryByCategory(userId, month, year);
        java.util.Map<String, Double> totals = new java.util.HashMap<>();
        for (ExpenseSummaryDTO dto : persisted) {
            if (dto != null) totals.put(dto.getCategory(), dto.getTotal() != null ? dto.getTotal() : 0.0);
        }

        if (includeRecurring) {
            // generate recurring instances for the requested month/year and merge them
            LocalDate start = LocalDate.of(year, month, 1);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
            List<Expense> generated = generateRecurringExpenses(userId, start, end, null);

            // collect persisted categories to avoid double-counting categories already present
            java.util.Set<String> persistedCats = persisted.stream().map(ExpenseSummaryDTO::getCategory).collect(Collectors.toSet());
            for (Expense g : generated) {
                String cat = g.getCategory();
                if (!persistedCats.contains(cat)) {
                    totals.put(cat, totals.getOrDefault(cat, 0.0) + (g.getAmount() != null ? g.getAmount() : 0.0));
                }
            }
        }

        // convert back to list preserving persisted ordering where possible
        java.util.List<ExpenseSummaryDTO> result = new java.util.ArrayList<>();
        for (var entry : totals.entrySet()) {
            result.add(new ExpenseSummaryDTO(entry.getKey(), entry.getValue()));
        }
        return result;
    }

    /**
     * Return monthly totals for the specified year for a user.
     */
        @Override
        public List<MonthlyExpenseSummaryDTO> getMonthlyExpenseSummary(Long userId, int year, String category, boolean includeRecurring) {
        // start with persisted monthly aggregates
        List<MonthlyExpenseSummaryDTO> persisted = expenseRepository.findMonthlyExpenseSummary(userId, year, category);

        // map month -> total
        double[] totals = new double[13]; // 1..12
        for (MonthlyExpenseSummaryDTO dto : persisted) {
            if (dto != null) {
                totals[dto.month()] = dto.totalAmount();
            }
        }

        // include recurring expenses (generated instances) up to today using helper
        if (includeRecurring) {
            LocalDate yearStart = LocalDate.of(year, 1, 1);
            LocalDate yearEnd = LocalDate.of(year, 12, 31);
            List<Expense> generated = generateRecurringExpenses(userId, yearStart, yearEnd, category);
            // build a set of persisted expense dates for this user/year (and category if provided)
            List<Expense> persistedExpenses = expenseRepository.findByUserId(userId);
            java.util.Set<LocalDate> persistedDates = new java.util.HashSet<>();
            for (Expense e : persistedExpenses) {
                if (e.getDate() != null && e.getDate().getYear() == year) {
                    if (category == null || category.equals(e.getCategory())) {
                        persistedDates.add(e.getDate());
                    }
                }
            }
            for (Expense g : generated) {
                if (!persistedDates.contains(g.getDate())) {
                    int m = g.getDate().getMonthValue();
                    totals[m] += g.getAmount() != null ? g.getAmount() : 0.0;
                }
            }
        }

        List<MonthlyExpenseSummaryDTO> result = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            result.add(new MonthlyExpenseSummaryDTO(m, totals[m]));
        }
        return result;
    }

    @Override
    public List<com.expensetracker.payload.YearlyExpenseSummaryDTO> getYearlyExpenseSummary(Long userId, String category, boolean includeRecurring) {
        // get persisted yearly aggregates
        List<com.expensetracker.payload.YearlyExpenseSummaryDTO> persisted = expenseRepository.findYearlyExpenseSummary(userId, category);

        // build map year -> total
        java.util.Map<Integer, Double> yearTotals = new java.util.HashMap<>();
        int maxYear = LocalDate.now().getYear();
        for (var ydto : persisted) {
            yearTotals.put(ydto.year(), ydto.totalAmount());
            if (ydto.year() > maxYear) maxYear = ydto.year();
        }

        if (includeRecurring) {
            // include recurring contributions for years that may be missing or to add to persisted totals
            java.util.Set<Integer> yearsToConsider = new java.util.HashSet<>(yearTotals.keySet());
            int currentYear = LocalDate.now().getYear();
            yearsToConsider.add(currentYear);
            for (int y = currentYear - 5; y <= currentYear; y++) {
                yearsToConsider.add(y);
            }

            // collect persisted expense dates to avoid double-counting
            List<Expense> persistedExpenses = expenseRepository.findByUserId(userId);
            java.util.Set<LocalDate> persistedDates = new java.util.HashSet<>();
            for (Expense e : persistedExpenses) {
                if (e.getDate() != null) {
                    if (category == null || category.equals(e.getCategory())) {
                        persistedDates.add(e.getDate());
                    }
                }
            }

            for (int year : new java.util.ArrayList<>(yearsToConsider)) {
                LocalDate start = LocalDate.of(year, 1, 1);
                LocalDate end = LocalDate.of(year, 12, 31);
                List<Expense> generated = generateRecurringExpenses(userId, start, end, category);
                double add = 0.0;
                for (Expense g : generated) {
                    if (!persistedDates.contains(g.getDate())) {
                        add += g.getAmount() != null ? g.getAmount() : 0.0;
                    }
                }
                yearTotals.put(year, yearTotals.getOrDefault(year, 0.0) + add);
            }
        }

        // produce list sorted by year ascending (keep previous behaviour)
        List<com.expensetracker.payload.YearlyExpenseSummaryDTO> result = new ArrayList<>();
        java.util.List<Integer> years = new java.util.ArrayList<>(yearTotals.keySet());
        java.util.Collections.sort(years);
        for (int y : years) {
            result.add(new com.expensetracker.payload.YearlyExpenseSummaryDTO(y, yearTotals.getOrDefault(y, 0.0)));
        }
        return result;
    }

    @Override
    public List<String> getDistinctCategories(Long userId) {
        return expenseRepository.findDistinctCategoriesByUserId(userId);
    }

    @Override
    public List<com.expensetracker.model.Expense> getExpensesByUserId(Long userId) {
        return expenseRepository.findByUserId(userId);
    }
}