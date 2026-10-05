package com.fitnessintelligence.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workout_sessions")
public class WorkoutSessionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false)
    private LocalDate sessionDate;

    @Column(nullable = false, length = 60)
    private String splitName;

    private int durationMinutes = 45;

    private double overallRpe = 8.0;

    @Column(length = 500)
    private String notes;

    private boolean completed = true;

    @OneToMany(mappedBy = "workoutSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExerciseLogEntity> exercises = new ArrayList<>();

    public WorkoutSessionEntity() {}

    public WorkoutSessionEntity(UserEntity user, LocalDate sessionDate, String splitName, int durationMinutes, double overallRpe) {
        this.user = user;
        this.sessionDate = sessionDate;
        this.splitName = splitName;
        this.durationMinutes = durationMinutes;
        this.overallRpe = overallRpe;
    }

    public void addExercise(ExerciseLogEntity exercise) {
        exercises.add(exercise);
        exercise.setWorkoutSession(this);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }

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

    public List<ExerciseLogEntity> getExercises() { return exercises; }
    public void setExercises(List<ExerciseLogEntity> exercises) { this.exercises = exercises; }
}
