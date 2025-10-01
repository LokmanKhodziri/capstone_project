package com.expensetracker.service;

import com.expensetracker.model.Expense;
import com.expensetracker.model.User;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ExpenseServiceImpl expenseService;

    private User user;
    private Expense expense;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        expense = new Expense();
        expense.setId(1L);
        expense.setDescription("Test Expense");
        expense.setAmount(100.0);
        expense.setDate(LocalDate.now());
        expense.setUser(user);
    }

    @Test
    void testAddExpense() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(expenseRepository.save(any(Expense.class))).thenReturn(expense);

        Expense result = expenseService.addExpense(expense, "testuser");

        assertNotNull(result);
        assertEquals("Test Expense", result.getDescription());
        verify(expenseRepository, times(1)).save(any(Expense.class));
    }

    @Test
    void testGetAllExpenses() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(expenseRepository.findByUserId(1L)).thenReturn(Collections.singletonList(expense));

        List<Expense> result = expenseService.getAllExpenses("testuser");

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(expenseRepository, times(1)).findByUserId(1L);
    }

    @Test
    void testGetExpenseById() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(expense));

        Expense result = expenseService.getExpenseById(1L, "testuser");

        assertNotNull(result);
        assertEquals("Test Expense", result.getDescription());
        verify(expenseRepository, times(1)).findById(1L);
    }

    @Test
    void testUpdateExpense() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(expense));
        when(expenseRepository.save(any(Expense.class))).thenReturn(expense);

        Expense updatedExpense = new Expense();
        updatedExpense.setDescription("Updated Expense");
        updatedExpense.setAmount(200.0);
        updatedExpense.setDate(LocalDate.now());

        Expense result = expenseService.updateExpense(1L, updatedExpense, "testuser");

        assertNotNull(result);
        assertEquals("Updated Expense", result.getDescription());
        verify(expenseRepository, times(1)).save(any(Expense.class));
    }

    @Test
    void testDeleteExpense() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(expense));

        expenseService.deleteExpense(1L, "testuser");

        verify(expenseRepository, times(1)).delete(expense);
    }
}
