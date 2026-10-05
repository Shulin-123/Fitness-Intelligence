package com.fitnessintelligence.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class AssessmentRequest {

    @Min(value = 30, message = "Weight must be at least 30kg")
    @Max(value = 300, message = "Weight must be under 300kg")
    private double weightKg = 74.5;

    @Min(value = 100, message = "Height must be at least 100cm")
    @Max(value = 250, message = "Height must be under 250cm")
    private double heightCm = 178.0;

    @Min(value = 14, message = "Age must be at least 14")
    @Max(value = 120, message = "Age must be under 120")
    private int age = 28;

    private String sex = "male"; // male, female, unspecified

    @NotBlank
    private String goal = "build_muscle"; // build_muscle, lose_fat, maintain, get_fitter

    private String activityLevel = "moderate"; // sedentary, light, moderate, very_active

    public AssessmentRequest() {}

    public AssessmentRequest(double weightKg, double heightCm, int age, String sex, String goal, String activityLevel) {
        this.weightKg = weightKg;
        this.heightCm = heightCm;
        this.age = age;
        this.sex = sex;
        this.goal = goal;
        this.activityLevel = activityLevel;
    }

    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }

    public double getHeightCm() { return heightCm; }
    public void setHeightCm(double heightCm) { this.heightCm = heightCm; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }

    public String getActivityLevel() { return activityLevel; }
    public void setActivityLevel(String activityLevel) { this.activityLevel = activityLevel; }
}
