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
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "http://localhost:3000") // adjust if needed
public class ExpenseController {

    private static final Logger logger = LoggerFactory.getLogger(ExpenseController.class);

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private UserRepository userRepository;

    // CREATE
    @PostMapping
    public Expense addExpense(@RequestBody Expense expense, Principal principal) {
        return expenseService.addExpense(expense, principal.getName());
    }

    // READ ALL for logged-in user
    @GetMapping
    public List<Expense> getAllExpenses(Principal principal) {
        return expenseService.getAllExpenses(principal.getName());
    }

    // READ BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getExpenseById(@PathVariable Long id, Principal principal) {
        Expense expense = expenseService.getExpenseById(id, principal.getName());
        return (expense != null) ? ResponseEntity.ok(expense) : ResponseEntity.notFound().build();
    }

    // UPDATE
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

    // DELETE
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

    @GetMapping("/summary/monthly/{year}")
    public ResponseEntity<?> getMonthlyExpenseSummary(@PathVariable int year, Principal principal) {
        try {
            User user = userRepository.findByUsername(principal.getName()).orElseThrow(() -> new RuntimeException("User not found"));
            var summary = expenseService.getMonthlyExpenseSummary(user.getId(), year);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("Failed to get monthly expense summary for year=" + year, e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/summary/{year}/{month}")
    public ResponseEntity<?> getExpenseSummary(@PathVariable int year, @PathVariable int month, Principal principal) {
        try {
            User user = userRepository.findByUsername(principal.getName()).orElseThrow(() -> new RuntimeException("User not found"));
            var summary = expenseService.getExpenseSummaryByCategory(user.getId(), month, year);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("Failed to get expense summary for year=" + year + ", month=" + month, e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}