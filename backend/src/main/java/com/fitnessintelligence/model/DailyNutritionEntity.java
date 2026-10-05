package com.fitnessintelligence.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "daily_nutrition")
public class DailyNutritionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false)
    private LocalDate logDate;

    private int calories = 2450;

    private double proteinGrams = 160.0;

    private double carbsGrams = 280.0;

    private double fatsGrams = 70.0;

    private int waterMl = 3200;

    public DailyNutritionEntity() {}

    public DailyNutritionEntity(UserEntity user, LocalDate logDate, int calories, double proteinGrams, double carbsGrams, double fatsGrams, int waterMl) {
        this.user = user;
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

    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }

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
