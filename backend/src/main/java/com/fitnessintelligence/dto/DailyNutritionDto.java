package com.fitnessintelligence.dto;

import java.time.LocalDate;

public class DailyNutritionDto {
    private Long id;
    private Long userId;
    private LocalDate logDate = LocalDate.now();
    private int calories = 2400;
    private double proteinGrams = 160.0;
    private double carbsGrams = 275.0;
    private double fatsGrams = 70.0;
    private int waterMl = 3000;

    public DailyNutritionDto() {}

    public DailyNutritionDto(Long id, Long userId, LocalDate logDate, int calories, double proteinGrams, double carbsGrams, double fatsGrams, int waterMl) {
        this.id = id;
        this.userId = userId;
        this.logDate = logDate;
        this.calories = calories;
        this.proteinGrams = proteinGrams;
        this.carbsGrams = carbsGrams;
        this.fatsGrams = fatsGrams;
        this.waterMl = waterMl;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public LocalDate getLogDate() { return logDate; }
    public void setLogDate(LocalDate logDate) { this.logDate = logDate; }

    public int getCalories() { return calories; }
    public void setCalories(int calories) { this.calories = calories; }

    public double getProteinGrams() { return proteinGrams; }
    public void setProteinGrams(double proteinGrams) { this.proteinGrams = proteinGrams; }

    public double getCarbsGrams() { return carbsGrams; }
    public void setCarbsGrams(double carbsGrams) { this.carbsGrams = carbsGrams; }

    public double getFatsGrams() { return fatsGrams; }
    public void setFatsGrams(double fatsGrams) { this.fatsGrams = fatsGrams; }

    public int getWaterMl() { return waterMl; }
    public void setWaterMl(int waterMl) { this.waterMl = waterMl; }
}
