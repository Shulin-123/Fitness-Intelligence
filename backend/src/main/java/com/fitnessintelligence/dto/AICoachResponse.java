package com.fitnessintelligence.dto;

import java.util.List;

public class AICoachResponse {
    private String answer;
    private List<String> sourceTags;
    private List<String> followUps;
    private String engineMode;

    public AICoachResponse() {}

    public AICoachResponse(String answer, List<String> sourceTags, List<String> followUps, String engineMode) {
        this.answer = answer;
        this.sourceTags = sourceTags;
        this.followUps = followUps;
        this.engineMode = engineMode;
    }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public List<String> getSourceTags() { return sourceTags; }
    public void setSourceTags(List<String> sourceTags) { this.sourceTags = sourceTags; }

    public List<String> getFollowUps() { return followUps; }
    public void setFollowUps(List<String> followUps) { this.followUps = followUps; }

    public String getEngineMode() { return engineMode; }
    public void setEngineMode(String engineMode) { this.engineMode = engineMode; }
}
