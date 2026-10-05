package com.fitnessintelligence.dto;

public class ExerciseDto {
    private Long id;
    private String exerciseName;
    private int setsCompleted = 3;
    private int repsCompleted = 8;
    private double weightKg = 60.0;
    private int targetRir = 2;
    private double estimated1Rm = 74.4;
    private String notes;

    public ExerciseDto() {}

    public ExerciseDto(String exerciseName, int setsCompleted, int repsCompleted, double weightKg, int targetRir) {
        this.exerciseName = exerciseName;
        this.setsCompleted = setsCompleted;
        this.repsCompleted = repsCompleted;
        this.weightKg = weightKg;
        this.targetRir = targetRir;
        this.estimated1Rm = Math.round(weightKg * (1.0 + (repsCompleted / 30.0)) * 10.0) / 10.0;
    }

    public ExerciseDto(Long id, String exerciseName, int setsCompleted, int repsCompleted, double weightKg, int targetRir, double estimated1Rm, String notes) {
        this.id = id;
        this.exerciseName = exerciseName;
        this.setsCompleted = setsCompleted;
        this.repsCompleted = repsCompleted;
        this.weightKg = weightKg;
        this.targetRir = targetRir;
        this.estimated1Rm = estimated1Rm;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getExerciseName() { return exerciseName; }
    public void setExerciseName(String exerciseName) { this.exerciseName = exerciseName; }

    public int getSetsCompleted() { return setsCompleted; }
    public void setSetsCompleted(int setsCompleted) { this.setsCompleted = setsCompleted; }

    public int getRepsCompleted() { return repsCompleted; }
    public void setRepsCompleted(int repsCompleted) { this.repsCompleted = repsCompleted; }

    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }

    public int getTargetRir() { return targetRir; }
    public void setTargetRir(int targetRir) { this.targetRir = targetRir; }

    public double getEstimated1Rm() { return estimated1Rm; }
    public void setEstimated1Rm(double estimated1Rm) { this.estimated1Rm = estimated1Rm; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
