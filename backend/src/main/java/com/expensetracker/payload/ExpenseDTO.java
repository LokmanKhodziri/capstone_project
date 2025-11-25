package com.expensetracker.payload;

import java.time.LocalDate;

public class ExpenseDTO {

    private String description;
    // Use Double to match the Expense entity's amount type
    private Double amount;
    private LocalDate date;
    private String category;

    // Getters and setters

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
