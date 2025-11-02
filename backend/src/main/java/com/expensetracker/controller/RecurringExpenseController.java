package com.expensetracker.controller;

import com.expensetracker.model.RecurringExpense;
import com.expensetracker.service.RecurringExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * Controller for managing recurring expenses. Recurring expenses represent
 * payments that repeat every month (or another schedule) and are used to
 * generate pseudo-expense instances for display in the UI.
 */
@RestController
@RequestMapping("/api/recurring-expenses")
@CrossOrigin(origins = "http://localhost:3000")
public class RecurringExpenseController {

    @Autowired
    private RecurringExpenseService recurringExpenseService;

    /**
     * Create a new recurring expense for the authenticated user.
     * @param recurringExpense recurring expense payload
     * @param principal security principal (owner username)
     * @return created RecurringExpense
     */
    @PostMapping
    public RecurringExpense createRecurringExpense(@RequestBody RecurringExpense recurringExpense, Principal principal) {
        return recurringExpenseService.createRecurringExpense(recurringExpense, principal.getName());
    }

    /**
     * Return all recurring expenses for the authenticated user.
     * @param principal security principal
     * @return list of RecurringExpense
     */
    @GetMapping
    public List<RecurringExpense> getRecurringExpenses(Principal principal) {
        return recurringExpenseService.getRecurringExpenses(principal.getName());
    }

    /**
     * Delete a recurring expense owned by the authenticated user.
     * @param id recurring expense id
     * @param principal security principal
     * @return 204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecurringExpense(@PathVariable Long id, Principal principal) {
        recurringExpenseService.deleteRecurringExpense(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
