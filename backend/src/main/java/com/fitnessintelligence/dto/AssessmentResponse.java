package com.fitnessintelligence.dto;

import java.util.List;
import java.util.Map;

public class AssessmentResponse {

    private double bmi;
    private String bmiCategory;
    private int bmr;
    private int tdee;
    private int goalCalories;
    private double proteinGrams;
    private double carbsGrams;
    private double fatsGrams;
    private int waterTargetMl;
    private String safetyTier; // GREEN, AMBER, RED
    private List<String> safetyNotes;
    private Map<String, String> scientificFormulas;

    public AssessmentResponse() {}

    // Getters and Setters
    public double getBmi() { return bmi; }
    public void setBmi(double bmi) { this.bmi = bmi; }

    public String getBmiCategory() { return bmiCategory; }
    public void setBmiCategory(String bmiCategory) { this.bmiCategory = bmiCategory; }

    public int getBmr() { return bmr; }
    public void setBmr(int bmr) { this.bmr = bmr; }

    public int getTdee() { return tdee; }
    public void setTdee(int tdee) { this.tdee = tdee; }

    public int getGoalCalories() { return goalCalories; }
    public void setGoalCalories(int goalCalories) { this.goalCalories = goalCalories; }

    public double getProteinGrams() { return proteinGrams; }
    public void setProteinGrams(double proteinGrams) { this.proteinGrams = proteinGrams; }

    public double getCarbsGrams() { return carbsGrams; }
    public void setCarbsGrams(double carbsGrams) { this.carbsGrams = carbsGrams; }

    public double getFatsGrams() { return fatsGrams; }
    public void setFatsGrams(double fatsGrams) { this.fatsGrams = fatsGrams; }

    public int getWaterTargetMl() { return waterTargetMl; }
    public void setWaterTargetMl(int waterTargetMl) { this.waterTargetMl = waterTargetMl; }

    public String getSafetyTier() { return safetyTier; }
    public void setSafetyTier(String safetyTier) { this.safetyTier = safetyTier; }

    public List<String> getSafetyNotes() { return safetyNotes; }
    public void setSafetyNotes(List<String> safetyNotes) { this.safetyNotes = safetyNotes; }

    public Map<String, String> getScientificFormulas() { return scientificFormulas; }
    public void setScientificFormulas(Map<String, String> scientificFormulas) { this.scientificFormulas = scientificFormulas; }
}
