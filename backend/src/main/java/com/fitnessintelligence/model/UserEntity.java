package com.fitnessintelligence.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String name;

    private int age = 28;

    @Column(length = 20)
    private String sex = "unspecified";

    private double heightCm = 175.0;

    private double weightKg = 72.0;

    @Column(length = 30)
    private String goal = "build_muscle";

    @Column(length = 30)
    private String experience = "intermediate";

    private int trainingDaysPerWeek = 4;

    private int sessionDurationMin = 60;

    @Column(length = 30)
    private String activityLevel = "moderate";

    @Column(length = 30)
    private String dietPreference = "non_veg";

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();

    public UserEntity() {}

    public UserEntity(String email, String name, int age, String sex, double heightCm, double weightKg, String goal) {
        this.email = email;
        this.name = name;
        this.age = age;
        this.sex = sex;
        this.heightCm = heightCm;
        this.weightKg = weightKg;
        this.goal = goal;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }

    public double getHeightCm() { return heightCm; }
    public void setHeightCm(double heightCm) { this.heightCm = heightCm; }

    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public int getTrainingDaysPerWeek() { return trainingDaysPerWeek; }
    public void setTrainingDaysPerWeek(int trainingDaysPerWeek) { this.trainingDaysPerWeek = trainingDaysPerWeek; }

    public int getSessionDurationMin() { return sessionDurationMin; }
    public void setSessionDurationMin(int sessionDurationMin) { this.sessionDurationMin = sessionDurationMin; }

    public String getActivityLevel() { return activityLevel; }
    public void setActivityLevel(String activityLevel) { this.activityLevel = activityLevel; }

    public String getDietPreference() { return dietPreference; }
    public void setDietPreference(String dietPreference) { this.dietPreference = dietPreference; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
