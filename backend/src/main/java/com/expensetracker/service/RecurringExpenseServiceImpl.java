package com.expensetracker.service;

import com.expensetracker.model.RecurringExpense;
import com.expensetracker.model.User;
import com.expensetracker.repository.RecurringExpenseRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecurringExpenseServiceImpl implements RecurringExpenseService {

    @Autowired
    private RecurringExpenseRepository recurringExpenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public RecurringExpense createRecurringExpense(RecurringExpense recurringExpense, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        recurringExpense.setUser(user);
        return recurringExpenseRepository.save(recurringExpense);
    }

    @Override
    public List<RecurringExpense> getRecurringExpenses(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        return recurringExpenseRepository.findByUserId(user.getId());
    }

    @Override
    public void deleteRecurringExpense(Long id, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        RecurringExpense recurringExpense = recurringExpenseRepository.findById(id).orElseThrow(() -> new RuntimeException("Recurring expense not found"));
        if (!recurringExpense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        recurringExpenseRepository.delete(recurringExpense);
    }
}
