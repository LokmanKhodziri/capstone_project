package com.expensetracker.repository;

import com.expensetracker.model.Expense;
import com.expensetracker.payload.ExpenseSummaryDTO;
import com.expensetracker.payload.MonthlyExpenseSummaryDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserId(Long userId);
    

    @Query("SELECT new com.expensetracker.payload.ExpenseSummaryDTO(e.category, SUM(e.amount)) FROM Expense e WHERE e.user.id = :userId AND MONTH(e.date) = :month AND YEAR(e.date) = :year GROUP BY e.category")
    List<ExpenseSummaryDTO> findExpenseSummaryByCategory(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT new com.expensetracker.payload.MonthlyExpenseSummaryDTO(MONTH(e.date), SUM(e.amount)) FROM Expense e WHERE e.user.id = :userId AND YEAR(e.date) = :year GROUP BY MONTH(e.date)")
    List<MonthlyExpenseSummaryDTO> findMonthlyExpenseSummary(@Param("userId") Long userId, @Param("year") int year);
}