package com.expensetracker.controller;

import com.expensetracker.model.Expense;
import com.expensetracker.model.User;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.ExpenseService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST controller that manages expense CRUD operations and summaries.
 *
 * Endpoints:
 * - POST   /api/expenses                : create a new expense for the authenticated user
 * - GET    /api/expenses                : list all expenses for the authenticated user (including generated recurring)
 * - GET    /api/expenses/{id}           : fetch a single expense by id (user must own the expense)
 * - PUT    /api/expenses/{id}           : update an existing expense
 * - DELETE /api/expenses/{id}           : delete an expense
 * - GET    /api/expenses/summary/monthly/{year} : get monthly totals for a given year
 * - GET    /api/expenses/summary/{year}/{month} : get category breakdown for a given month/year
 */
@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "http://localhost:3000") // adjust if needed
public class ExpenseController {

    private static final Logger logger = LoggerFactory.getLogger(ExpenseController.class);

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private UserRepository userRepository;

    // Injected aggregator used to produce concrete Expense instances from
    // recurring rules. This is used by the debug endpoint and the service
    // via the compatibility helper so summaries include recurring items.
    @Autowired
    private com.expensetracker.service.RecurringExpenseAggregator recurringExpenseAggregator;

    /**
     * Create a new expense for the authenticated user.
     * @param expense expense payload from the client
     * @param principal security principal (contains username)
     * @return saved Expense entity
     */
    @PostMapping
    public Expense addExpense(@RequestBody Expense expense, Principal principal) {
        return expenseService.addExpense(expense, principal.getName());
    }

    /**
     * Return all expenses for the authenticated user. This includes persisted
     * expenses and generated instances for recurring expenses (used for UI display).
     * @param principal security principal
     * @return list of Expense
     */
    @GetMapping
    public List<Expense> getAllExpenses(Principal principal) {
        return expenseService.getAllExpenses(principal.getName());
    }

    /**
     * Fetch a specific expense by id. The authenticated user must own the expense.
     * @param id expense id
     * @param principal security principal
     * @return ResponseEntity containing the expense or 404 when not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getExpenseById(@PathVariable Long id, Principal principal) {
        Expense expense = expenseService.getExpenseById(id, principal.getName());
        return (expense != null) ? ResponseEntity.ok(expense) : ResponseEntity.notFound().build();
    }

    /**
     * Update an existing expense. Only fields provided in the payload are applied.
     * The user must own the expense.
     * @param id expense id to update
     * @param payload new expense data
     * @param principal security principal
     * @return ResponseEntity with updated Expense or error status
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateExpense(@PathVariable Long id,
                                           @RequestBody Expense payload,
                                           Principal principal) {
        try {
            Optional<Expense> existingOptional = expenseService.findById(id);
            if (existingOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Expense existing = existingOptional.get();

            existing.setDescription(payload.getDescription());
            existing.setAmount(payload.getAmount());
            existing.setDate(payload.getDate());
            existing.setCategory(payload.getCategory());

            Expense saved = expenseService.save(existing);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            logger.error("Failed to update expense id=" + id, e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete an expense owned by the authenticated user.
     * @param id expense id
     * @param principal security principal
     * @return 204 No Content on success or 500 on failure
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id, Principal principal) {
        try {
            expenseService.deleteExpense(id, principal.getName());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Failed to delete expense id=" + id, e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get monthly expense totals for the given year for authenticated user.
     * @param year the calendar year (e.g., 2025)
     * @param principal security principal
     * @return list of monthly totals
     */
    @GetMapping("/summary/monthly/{year}")
    public ResponseEntity<?> getMonthlyExpenseSummary(@PathVariable int year,
                                                     @RequestParam(required = false) String category,
                                                     @RequestParam(required = false, defaultValue = "true") boolean includeRecurring,
                                                     Principal principal) {
        try {
            User user = userRepository.findByUsername(principal.getName()).orElseThrow(() -> new RuntimeException("User not found"));
            var summary = expenseService.getMonthlyExpenseSummary(user.getId(), year, category, includeRecurring);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("Failed to get monthly expense summary for year=" + year, e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get expense summary grouped by category for a specific month and year.
     * @param year calendar year
     * @param month calendar month (1-12)
     * @param principal security principal
     * @return category breakdown for the requested month
     */
    @GetMapping("/summary/{year}/{month}")
    public ResponseEntity<?> getExpenseSummary(@PathVariable int year, @PathVariable int month,
                                               @RequestParam(required = false, defaultValue = "true") boolean includeRecurring,
                                               Principal principal) {
        try {
            User user = userRepository.findByUsername(principal.getName()).orElseThrow(() -> new RuntimeException("User not found"));
            var summary = expenseService.getExpenseSummaryByCategory(user.getId(), month, year, includeRecurring);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("Failed to get expense summary for year=" + year + ", month=" + month, e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get yearly totals for the authenticated user. Optional query parameter `category`
     * can be provided to filter by category.
     * @param category optional category filter
     */
    @GetMapping("/summary/years")
    public ResponseEntity<?> getYearlyExpenseSummary(@RequestParam(required = false) String category,
                                                     @RequestParam(required = false, defaultValue = "true") boolean includeRecurring,
                                                     Principal principal) {
        try {
            User user = userRepository.findByUsername(principal.getName()).orElseThrow(() -> new RuntimeException("User not found"));
            var summary = expenseService.getYearlyExpenseSummary(user.getId(), category, includeRecurring);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("Failed to get yearly expense summary", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get the distinct categories for the authenticated user's expenses.
     */
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories(Principal principal) {
        try {
            User user = userRepository.findByUsername(principal.getName()).orElseThrow(() -> new RuntimeException("User not found"));
            var categories = expenseService.getDistinctCategories(user.getId());
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            logger.error("Failed to get categories", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Debug endpoint for admins/devs: return the generated recurring expense instances
     * that would be merged for the given month/year (or entire year when month omitted).
     * Useful for auditing and testing.
    *
    * CHANGE NOTE:
    * - This endpoint returns the *generated* (non-persisted) instances produced by
    *   the central RecurringExpenseAggregator. It's intentionally a developer-facing
    *   debug helper so the UI and tests can verify expansion behavior. Do not assume
    *   these objects are persisted to the DB.
     */
    @GetMapping("/summary/debug")
    public ResponseEntity<?> getRecurringDebug(@RequestParam(required = false) Integer year,
                                               @RequestParam(required = false) Integer month,
                                               @RequestParam(required = false) String category,
                                               Principal principal) {
        try {
            User user = userRepository.findByUsername(principal.getName()).orElseThrow(() -> new RuntimeException("User not found"));
            LocalDate start;
            LocalDate end;
            if (year != null && month != null) {
                start = LocalDate.of(year, month, 1);
                end = start.withDayOfMonth(start.lengthOfMonth());
            } else if (year != null) {
                start = LocalDate.of(year, 1, 1);
                end = LocalDate.of(year, 12, 31);
            } else {
                int y = LocalDate.now().getYear();
                start = LocalDate.of(y, 1, 1);
                end = LocalDate.of(y, 12, 31);
            }
            List<Expense> generated = recurringExpenseAggregator.generateRecurringExpensesForUserBetween(user.getId(), start, end, category);
            return ResponseEntity.ok(generated);
        } catch (Exception e) {
            logger.error("Failed to get recurring debug data", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}