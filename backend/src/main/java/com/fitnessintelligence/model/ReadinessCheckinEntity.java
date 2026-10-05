package com.fitnessintelligence.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "readiness_checkins")
public class ReadinessCheckinEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false)
    private LocalDate checkinDate;

    private int sleepQuality = 8; // 1-10

    private int muscleSoreness = 3; // 1-10 (lower is better)

    private int stressLevel = 4; // 1-10 (lower is better)

    private int energyLevel = 8; // 1-10 (higher is better)

    private int readinessScore = 84; // 0-100

    @Column(length = 250)
    private String recommendation = "Optimal CNS readiness. Prime condition for heavy compound lifts.";

    public ReadinessCheckinEntity() {}

    public ReadinessCheckinEntity(UserEntity user, LocalDate checkinDate, int sleepQuality, int muscleSoreness, int stressLevel, int energyLevel, int readinessScore, String recommendation) {
        this.user = user;
        this.checkinDate = checkinDate;
        this.sleepQuality = sleepQuality;
        this.muscleSoreness = muscleSoreness;
        this.stressLevel = stressLevel;
        this.energyLevel = energyLevel;
        this.readinessScore = readinessScore;
        this.recommendation = recommendation;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }

    public LocalDate getCheckinDate() { return checkinDate; }
    public void setCheckinDate(LocalDate checkinDate) { this.checkinDate = checkinDate; }

    public int getSleepQuality() { return sleepQuality; }
    public void setSleepQuality(int sleepQuality) { this.sleepQuality = sleepQuality; }

    public int getMuscleSoreness() { return muscleSoreness; }
    public void setMuscleSoreness(int muscleSoreness) { this.muscleSoreness = muscleSoreness; }

    public int getStressLevel() { return stressLevel; }
    public void setStressLevel(int stressLevel) { this.stressLevel = stressLevel; }

    public int getEnergyLevel() { return energyLevel; }
    public void setEnergyLevel(int energyLevel) { this.energyLevel = energyLevel; }

    public int getReadinessScore() { return readinessScore; }
    public void setReadinessScore(int readinessScore) { this.readinessScore = readinessScore; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
}
