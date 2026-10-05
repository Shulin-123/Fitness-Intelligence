package com.fitnessintelligence.dto;

public class UserDto {
    private Long id;
    private String email;
    private String name;
    private int age = 28;
    private String sex = "male";
    private double heightCm = 175.0;
    private double weightKg = 72.0;
    private String goal = "build_muscle";
    private String experience = "intermediate";
    private int trainingDaysPerWeek = 4;
    private int sessionDurationMin = 60;
    private String activityLevel = "moderate";
    private String dietPreference = "non_veg";

    public UserDto() {}

    public UserDto(Long id, String email, String name, int age, String sex, double heightCm, double weightKg,
                   String goal, String experience, int trainingDaysPerWeek, int sessionDurationMin,
                   String activityLevel, String dietPreference) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.age = age;
        this.sex = sex;
        this.heightCm = heightCm;
        this.weightKg = weightKg;
        this.goal = goal;
        this.experience = experience;
        this.trainingDaysPerWeek = trainingDaysPerWeek;
        this.sessionDurationMin = sessionDurationMin;
        this.activityLevel = activityLevel;
        this.dietPreference = dietPreference;
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
}
