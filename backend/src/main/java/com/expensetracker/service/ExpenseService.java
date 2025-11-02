package com.expensetracker.service;

import com.expensetracker.model.Expense;
import com.expensetracker.payload.MonthlyExpenseSummaryDTO;

import java.util.List;
import java.util.Optional;

public interface ExpenseService {
    Expense addExpense(Expense expense, String username);
    List<Expense> getAllExpenses(String username);
    Expense getExpenseById(Long id, String username);
    Expense updateExpense(Long id, Expense expense, String username);
    void deleteExpense(Long id, String username);
    Expense save(Expense expense); // This is used by the controller's update method
    Optional<Expense> findById(Long id); // This is used by the controller's update method
    
    List<com.expensetracker.payload.ExpenseSummaryDTO> getExpenseSummaryByCategory(Long userId, int month, int year, boolean includeRecurring);
    List<MonthlyExpenseSummaryDTO> getMonthlyExpenseSummary(Long userId, int year, String category, boolean includeRecurring);
    List<com.expensetracker.payload.YearlyExpenseSummaryDTO> getYearlyExpenseSummary(Long userId, String category, boolean includeRecurring);
    List<String> getDistinctCategories(Long userId);
    List<com.expensetracker.model.Expense> getExpensesByUserId(Long userId);
}