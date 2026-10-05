package com.fitnessintelligence.dto;

public class LongevityResponse {

    private int enteredCardioMinutes;
    private int enteredStrengthSessions;
    private int aerobicCompliancePct; // % of 150 min WHO guideline
    private int strengthCompliancePct; // % of 2 sessions WHO guideline
    private int combinedLongevityScore; // 0-100 index
    private double cardiovascularRiskReductionPct; // up to 39%
    private String verdict;
    private String peerReviewedCitation;

    public LongevityResponse() {}

    // Getters and Setters
    public int getEnteredCardioMinutes() { return enteredCardioMinutes; }
    public void setEnteredCardioMinutes(int enteredCardioMinutes) { this.enteredCardioMinutes = enteredCardioMinutes; }

    public int getEnteredStrengthSessions() { return enteredStrengthSessions; }
    public void setEnteredStrengthSessions(int enteredStrengthSessions) { this.enteredStrengthSessions = enteredStrengthSessions; }

    public int getAerobicCompliancePct() { return aerobicCompliancePct; }
    public void setAerobicCompliancePct(int aerobicCompliancePct) { this.aerobicCompliancePct = aerobicCompliancePct; }

    public int getStrengthCompliancePct() { return strengthCompliancePct; }
    public void setStrengthCompliancePct(int strengthCompliancePct) { this.strengthCompliancePct = strengthCompliancePct; }

    public int getCombinedLongevityScore() { return combinedLongevityScore; }
    public void setCombinedLongevityScore(int combinedLongevityScore) { this.combinedLongevityScore = combinedLongevityScore; }

    public double getCardiovascularRiskReductionPct() { return cardiovascularRiskReductionPct; }
    public void setCardiovascularRiskReductionPct(double cardiovascularRiskReductionPct) { this.cardiovascularRiskReductionPct = cardiovascularRiskReductionPct; }

    public String getVerdict() { return verdict; }
    public void setVerdict(String verdict) { this.verdict = verdict; }

    public String getPeerReviewedCitation() { return peerReviewedCitation; }
    public void setPeerReviewedCitation(String peerReviewedCitation) { this.peerReviewedCitation = peerReviewedCitation; }
}
