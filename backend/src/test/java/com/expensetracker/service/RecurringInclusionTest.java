package com.expensetracker.service;

import com.expensetracker.model.RecurringExpense;
import com.expensetracker.model.User;
import com.expensetracker.payload.MonthlyExpenseSummaryDTO;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class RecurringInclusionTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RecurringExpenseService recurringExpenseService;

    @InjectMocks
    private ExpenseServiceImpl expenseService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(10L);
        user.setUsername("recurrtest");
    }

    @Test
    void testMonthlyIncludesRecurring() {
        int year = LocalDate.now().getYear() - 1; // pick a past year so all months count

        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        // no persisted aggregates
        when(expenseRepository.findMonthlyExpenseSummary(10L, year, null)).thenReturn(Collections.emptyList());
        when(expenseRepository.findByUserId(10L)).thenReturn(Collections.emptyList());

        RecurringExpense r = new RecurringExpense();
        r.setId(1L);
        r.setAmount(50.0);
        r.setCategory("Subscriptions");
        r.setRecurrenceDayOfMonth(5);
        r.setUser(user);

        List<RecurringExpense> recs = new ArrayList<>();
        recs.add(r);
        when(recurringExpenseService.getRecurringExpenses("recurrtest")).thenReturn(recs);

    List<MonthlyExpenseSummaryDTO> months = expenseService.getMonthlyExpenseSummary(10L, year, null, true);

        // should have 12 months with 50.0 in each
        assertEquals(12, months.size());
        for (MonthlyExpenseSummaryDTO m : months) {
            assertEquals(50.0, m.totalAmount());
        }
    }

    @Test
    void testYearlyIncludesRecurring() {
        int year = LocalDate.now().getYear() - 2;

        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(expenseRepository.findYearlyExpenseSummary(10L, null)).thenReturn(Collections.emptyList());
        when(expenseRepository.findByUserId(10L)).thenReturn(Collections.emptyList());

        RecurringExpense r = new RecurringExpense();
        r.setId(2L);
        r.setAmount(30.0);
        r.setCategory("Utilities");
        r.setRecurrenceDayOfMonth(10);
        r.setUser(user);

        when(recurringExpenseService.getRecurringExpenses("recurrtest")).thenReturn(Collections.singletonList(r));

    var yearly = expenseService.getYearlyExpenseSummary(10L, null, true);

        // find our year in results and expect 12 * 30.0 total for that year
        double expected = 12 * 30.0;
        double found = yearly.stream().filter(y -> y.year() == year).mapToDouble(y -> y.totalAmount()).findFirst().orElse(0.0);
        assertEquals(expected, found);
    }
}
