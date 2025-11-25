package com.expensetracker.service;

import com.expensetracker.model.RecurringExpense;

import java.util.List;

public interface RecurringExpenseService {
    RecurringExpense createRecurringExpense(RecurringExpense recurringExpense, String username);
    List<RecurringExpense> getRecurringExpenses(String username);
    void deleteRecurringExpense(Long id, String username);
}
