package com.expensetracker.controller;

import com.expensetracker.model.Expense;
import com.expensetracker.model.User;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.RecurringExpenseAggregator;
import org.junit.jupiter.api.Test;
 

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class ExpenseControllerDebugTest {

    @Test
    public void debugEndpointReturnsGeneratedRecurringInstances_directCall() throws Exception {
        // NOTE: This is a lightweight unit test that directly constructs
        // the controller and injects mocks using ReflectionTestUtils. The
        // purpose is to verify the debug endpoint logic without booting
        // the full Spring security/context stack (faster and less brittle).
        UserRepository userRepository = org.mockito.Mockito.mock(UserRepository.class);
        RecurringExpenseAggregator aggregator = org.mockito.Mockito.mock(RecurringExpenseAggregator.class);

        User user = new User();
        user.setId(42L);
        user.setUsername("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        Expense e = new Expense();
        e.setId(999L);
        e.setAmount(100.0);
        e.setCategory("Utilities");
        e.setDescription("Monthly subscription");
        e.setDate(LocalDate.of(2025, 10, 5));
        e.setUser(user);

        when(aggregator.generateRecurringExpensesForUserBetween(any(), any(), any(), any())).thenReturn(List.of(e));

        ExpenseController controller = new ExpenseController();
        // inject mocks
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "userRepository", userRepository);
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "recurringExpenseAggregator", aggregator);

        Principal principal = () -> "testuser";

        var response = controller.getRecurringDebug(2025, 10, null, principal);
        org.assertj.core.api.Assertions.assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        Object body = response.getBody();
        org.assertj.core.api.Assertions.assertThat(body).isInstanceOf(List.class);
    List<?> list = (List<?>) body;
    org.junit.jupiter.api.Assertions.assertNotNull(list);
    org.assertj.core.api.Assertions.assertThat(list).hasSize(1);
        Object first = list.get(0);
        org.assertj.core.api.Assertions.assertThat(first).isInstanceOf(Expense.class);
        Expense got = (Expense) first;
        org.assertj.core.api.Assertions.assertThat(got.getCategory()).isEqualTo("Utilities");
        org.assertj.core.api.Assertions.assertThat(got.getAmount()).isEqualTo(100.0);
    }
}
