package com.expensetracker.service;

import com.expensetracker.model.Expense;
import com.expensetracker.model.User;
import com.expensetracker.payload.ExpenseSummaryDTO;
import com.expensetracker.payload.MonthlyExpenseSummaryDTO;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Expense addExpense(Expense expense, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        expense.setUser(user);
        return expenseRepository.save(expense);
    }

    @Override
    public List<Expense> getAllExpenses(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        return expenseRepository.findByUserId(user.getId());
    }

    @Override
    public Expense getExpenseById(Long id, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        return expenseRepository.findById(id)
                .filter(expense -> expense.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Expense not found"));
    }

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

    @Override
    public void deleteExpense(Long id, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Expense expense = expenseRepository.findById(id)
                .filter(exp -> exp.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        expenseRepository.delete(expense);
    }

    @Override
    public Expense save(Expense expense) { // This method is used by the controller's update method
        return expenseRepository.save(expense);
    }

    @Override
    public Optional<Expense> findById(Long id) { // This method is used by the controller's update method
        return expenseRepository.findById(id);
    }

    

    @Override
    public List<ExpenseSummaryDTO> getExpenseSummaryByCategory(Long userId, int month, int year) {
        return expenseRepository.findExpenseSummaryByCategory(userId, month, year);
    }

    @Override
    public List<MonthlyExpenseSummaryDTO> getMonthlyExpenseSummary(Long userId, int year) {
        return expenseRepository.findMonthlyExpenseSummary(userId, year);
    }
}