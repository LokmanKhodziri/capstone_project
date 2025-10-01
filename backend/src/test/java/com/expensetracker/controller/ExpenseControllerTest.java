package com.expensetracker.controller;

import com.expensetracker.config.JwtUtil;
import com.expensetracker.model.Expense;
import com.expensetracker.model.Role;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.CustomUserDetailsService;
import com.expensetracker.service.ExpenseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ExpenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ExpenseService expenseService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    private ObjectMapper objectMapper;
    private Expense expense;
    private String token;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        expense = new Expense();
        expense.setId(1L);
        expense.setDescription("Test Expense");
        expense.setAmount(100.0);
        expense.setDate(LocalDate.now());

        com.expensetracker.model.User user = new com.expensetracker.model.User();
        user.setUsername("testuser");
        user.setPassword("password");
        user.setRole(Role.USER);

        UserDetails userDetails = new User("testuser", "password", new ArrayList<>());
        token = "mocked_jwt_token";
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(customUserDetailsService.loadUserByUsername("testuser")).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn(token);
        when(jwtUtil.validateToken(token, userDetails)).thenReturn(true);
        when(jwtUtil.extractUsername(token)).thenReturn("testuser");
    }

    @Test
    void testAddExpense() throws Exception {
        when(expenseService.addExpense(any(Expense.class), any(String.class))).thenReturn(expense);

        mockMvc.perform(post("/api/expenses")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(expense)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Test Expense"));
    }

    @Test
    void testGetAllExpenses() throws Exception {
        when(expenseService.getAllExpenses(any(String.class))).thenReturn(Collections.singletonList(expense));

        mockMvc.perform(get("/api/expenses")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].description").value("Test Expense"));
    }

    @Test
    void testGetExpenseById() throws Exception {
        when(expenseService.getExpenseById(any(Long.class), any(String.class))).thenReturn(expense);

        mockMvc.perform(get("/api/expenses/1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Test Expense"));
    }

    @Test
    void testUpdateExpense() throws Exception {
        when(expenseService.findById(1L)).thenReturn(Optional.of(expense));
        when(expenseService.save(any(Expense.class))).thenReturn(expense);

        mockMvc.perform(put("/api/expenses/1")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(expense)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Test Expense"));
    }

    @Test
    void testDeleteExpense() throws Exception {
        doNothing().when(expenseService).deleteExpense(any(Long.class), any(String.class));

        mockMvc.perform(delete("/api/expenses/1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }

    @Test
    void testGetAllExpensesUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/expenses"))
                .andExpect(status().isUnauthorized());
    }
}
