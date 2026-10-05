package com.fitnessintelligence.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "exercise_logs")
public class ExerciseLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_session_id", nullable = false)
    private WorkoutSessionEntity workoutSession;

    @Column(nullable = false, length = 100)
    private String exerciseName;

    private int setsCompleted = 3;

    private int repsCompleted = 8;

    private double weightKg = 60.0;

    private int targetRir = 2;

    private double estimated1Rm = 74.4;

    @Column(length = 250)
    private String notes;

    public ExerciseLogEntity() {}

    public ExerciseLogEntity(String exerciseName, int setsCompleted, int repsCompleted, double weightKg, int targetRir) {
        this.exerciseName = exerciseName;
        this.setsCompleted = setsCompleted;
        this.repsCompleted = repsCompleted;
        this.weightKg = weightKg;
        this.targetRir = targetRir;
        // Epley formula: 1RM = weight * (1 + reps/30)
        this.estimated1Rm = Math.round(weightKg * (1.0 + (repsCompleted / 30.0)) * 10.0) / 10.0;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public WorkoutSessionEntity getWorkoutSession() { return workoutSession; }
    public void setWorkoutSession(WorkoutSessionEntity workoutSession) { this.workoutSession = workoutSession; }

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
