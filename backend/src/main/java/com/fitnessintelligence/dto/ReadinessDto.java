package com.fitnessintelligence.dto;

import java.time.LocalDate;

public class ReadinessDto {
    private Long id;
    private Long userId;
    private LocalDate checkinDate = LocalDate.now();
    private int sleepQuality = 8;     // 1-10
    private int muscleSoreness = 3;   // 1-10 (lower is better)
    private int stressLevel = 3;      // 1-10 (lower is better)
    private int energyLevel = 8;      // 1-10 (higher is better)
    private int readinessScore;       // 0-100 (auto-calculated)
    private String recommendation;

    public ReadinessDto() {}

    public ReadinessDto(Long id, Long userId, LocalDate checkinDate, int sleepQuality, int muscleSoreness, int stressLevel, int energyLevel, int readinessScore, String recommendation) {
        this.id = id;
        this.userId = userId;
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

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

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
