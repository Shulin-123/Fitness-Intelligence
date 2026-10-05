package com.fitnessintelligence.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class WorkoutDto {
    private Long id;
    private Long userId;
    private LocalDate sessionDate = LocalDate.now();
    private String splitName = "Full Body Dynamic";
    private int durationMinutes = 45;
    private double overallRpe = 8.0;
    private String notes;
    private boolean completed = true;
    private List<ExerciseDto> exercises = new ArrayList<>();

    public WorkoutDto() {}

    public WorkoutDto(Long id, Long userId, LocalDate sessionDate, String splitName, int durationMinutes, double overallRpe, String notes, boolean completed, List<ExerciseDto> exercises) {
        this.id = id;
        this.userId = userId;
        this.sessionDate = sessionDate;
        this.splitName = splitName;
        this.durationMinutes = durationMinutes;
        this.overallRpe = overallRpe;
        this.notes = notes;
        this.completed = completed;
        this.exercises = exercises != null ? exercises : new ArrayList<>();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }

    public String getSplitName() { return splitName; }
    public void setSplitName(String splitName) { this.splitName = splitName; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public double getOverallRpe() { return overallRpe; }
    public void setOverallRpe(double overallRpe) { this.overallRpe = overallRpe; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public List<ExerciseDto> getExercises() { return exercises; }
    public void setExercises(List<ExerciseDto> exercises) { this.exercises = exercises; }
}
