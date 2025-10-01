package com.expensetracker.controller;

import com.expensetracker.model.Role;
import com.expensetracker.model.User;
import com.expensetracker.service.ExpenseService;
import com.expensetracker.service.UserService;
import com.expensetracker.config.JwtUtil;
import com.expensetracker.service.CustomUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private ExpenseService expenseService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    private User adminUser;
    private User regularUser;
    private UserDetails adminUserDetails;
    private UserDetails regularUserDetails;
    private String adminToken;
    private String userToken;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin");
        adminUser.setRole(Role.ADMIN);

        regularUser = new User();
        regularUser.setId(2L);
        regularUser.setUsername("user");
        regularUser.setRole(Role.USER);

        adminUserDetails = new org.springframework.security.core.userdetails.User(
                adminUser.getUsername(), "password", Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")));

        regularUserDetails = new org.springframework.security.core.userdetails.User(
                regularUser.getUsername(), "password", Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));

        adminToken = "mockAdminToken";
        userToken = "mockUserToken";

        when(jwtUtil.extractUsername(adminToken)).thenReturn(adminUser.getUsername());
        when(jwtUtil.validateToken(adminToken, adminUserDetails)).thenReturn(true);
        when(customUserDetailsService.loadUserByUsername(adminUser.getUsername())).thenReturn(adminUserDetails);

        when(jwtUtil.extractUsername(userToken)).thenReturn(regularUser.getUsername());
        when(jwtUtil.validateToken(userToken, regularUserDetails)).thenReturn(true);
        when(customUserDetailsService.loadUserByUsername(regularUser.getUsername())).thenReturn(regularUserDetails);

        when(userService.getAllUsers()).thenReturn(Arrays.asList(adminUser, regularUser));
        when(userService.findById(adminUser.getId())).thenReturn(Optional.of(adminUser));
        when(userService.findById(regularUser.getId())).thenReturn(Optional.of(regularUser));
        when(expenseService.getExpensesByUserId(adminUser.getId())).thenReturn(Collections.emptyList());
        when(expenseService.getExpensesByUserId(regularUser.getId())).thenReturn(Collections.emptyList());
    }

    @Test
    void getAllUsers_asAdmin_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void getAllUsers_asUser_shouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAllUsers_unauthenticated_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getExpensesByUserId_asAdmin_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/admin/expenses")
                .param("userId", regularUser.getId().toString())
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void getExpensesByUserId_asUser_shouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/expenses")
                .param("userId", regularUser.getId().toString())
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void getExpensesByUserId_unauthenticated_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/admin/expenses")
                .param("userId", regularUser.getId().toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}