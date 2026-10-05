package com.fitnessintelligence.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class OneRepMaxRequest {

    private String exerciseName = "Barbell Bench Press";

    @Min(value = 1, message = "Weight must be at least 1kg")
    private double weightKg = 82.5;

    @Min(value = 1, message = "Reps must be at least 1")
    @Max(value = 30, message = "Reps must be 30 or fewer for accurate 1RM estimation")
    private int repsCompleted = 8;

    public OneRepMaxRequest() {}

    public OneRepMaxRequest(String exerciseName, double weightKg, int repsCompleted) {
        this.exerciseName = exerciseName;
        this.weightKg = weightKg;
        this.repsCompleted = repsCompleted;
    }

    public String getExerciseName() { return exerciseName; }
    public void setExerciseName(String exerciseName) { this.exerciseName = exerciseName; }

    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }

    public int getRepsCompleted() { return repsCompleted; }
    public void setRepsCompleted(int repsCompleted) { this.repsCompleted = repsCompleted; }
}
