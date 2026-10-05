package com.fitnessintelligence.dto;

import java.util.Map;

public class OneRepMaxResponse {

    private String exerciseName;
    private double enteredWeightKg;
    private int enteredReps;
    private double epley1Rm;
    private double brzycki1Rm;
    private double recommended1Rm;
    private Map<String, Double> trainingZones; // e.g. "Hypertrophy (75%)": 78.5, "Strength (85%)": 89.0
    private Map<Integer, Double> rpeRirTable; // Target weight by RIR

    public OneRepMaxResponse() {}

    // Getters and Setters
    public String getExerciseName() { return exerciseName; }
    public void setExerciseName(String exerciseName) { this.exerciseName = exerciseName; }

    public double getEnteredWeightKg() { return enteredWeightKg; }
    public void setEnteredWeightKg(double enteredWeightKg) { this.enteredWeightKg = enteredWeightKg; }

    public int getEnteredReps() { return enteredReps; }
    public void setEnteredReps(int enteredReps) { this.enteredReps = enteredReps; }

    public double getEpley1Rm() { return epley1Rm; }
    public void setEpley1Rm(double epley1Rm) { this.epley1Rm = epley1Rm; }

    public double getBrzycki1Rm() { return brzycki1Rm; }
    public void setBrzycki1Rm(double brzycki1Rm) { this.brzycki1Rm = brzycki1Rm; }

    public double getRecommended1Rm() { return recommended1Rm; }
    public void setRecommended1Rm(double recommended1Rm) { this.recommended1Rm = recommended1Rm; }

    public Map<String, Double> getTrainingZones() { return trainingZones; }
    public void setTrainingZones(Map<String, Double> trainingZones) { this.trainingZones = trainingZones; }

    public Map<Integer, Double> getRpeRirTable() { return rpeRirTable; }
    public void setRpeRirTable(Map<Integer, Double> rpeRirTable) { this.rpeRirTable = rpeRirTable; }
}
