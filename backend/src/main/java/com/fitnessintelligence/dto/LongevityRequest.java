package com.fitnessintelligence.dto;

public class LongevityRequest {

    private int weeklyCardioMinutes = 150;
    private int strengthSessionsCount = 3;

    public LongevityRequest() {}

    public LongevityRequest(int weeklyCardioMinutes, int strengthSessionsCount) {
        this.weeklyCardioMinutes = weeklyCardioMinutes;
        this.strengthSessionsCount = strengthSessionsCount;
    }

    public int getWeeklyCardioMinutes() { return weeklyCardioMinutes; }
    public void setWeeklyCardioMinutes(int weeklyCardioMinutes) { this.weeklyCardioMinutes = weeklyCardioMinutes; }

    public int getStrengthSessionsCount() { return strengthSessionsCount; }
    public void setStrengthSessionsCount(int strengthSessionsCount) { this.strengthSessionsCount = strengthSessionsCount; }
}
