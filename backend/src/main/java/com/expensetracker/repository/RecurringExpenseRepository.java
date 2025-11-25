package com.expensetracker.repository;

import com.expensetracker.model.RecurringExpense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, Long> {
    List<RecurringExpense> findByUserId(Long userId);
}
