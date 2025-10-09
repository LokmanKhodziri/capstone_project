package com.expensetracker.mapper;

import com.expensetracker.model.Expense;
import com.expensetracker.payload.ExpenseDTO;

public class ExpenseMapper {

    public static Expense toEntity(ExpenseDTO expenseDTO) {
        Expense expense = new Expense();
        expense.setDescription(expenseDTO.getDescription());
        expense.setAmount(expenseDTO.getAmount());
        expense.setDate(expenseDTO.getDate());
        expense.setCategory(expenseDTO.getCategory());
        return expense;
    }

    public static ExpenseDTO toDTO(Expense expense) {
        ExpenseDTO expenseDTO = new ExpenseDTO();
        expenseDTO.setDescription(expense.getDescription());
        expenseDTO.setAmount(expense.getAmount());
        expenseDTO.setDate(expense.getDate());
        expenseDTO.setCategory(expense.getCategory());
        return expenseDTO;
    }
}
