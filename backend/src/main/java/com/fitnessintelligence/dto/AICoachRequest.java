package com.fitnessintelligence.dto;

public class AICoachRequest {
    private String prompt;
    private Double weightKg;
    private String goal;
    private String imageBase64;
    private String mimeType;
    private String mediaType; // "IMAGE" or "VIDEO"

    public AICoachRequest() {}

    public AICoachRequest(String prompt) {
        this.prompt = prompt;
    }

    public AICoachRequest(String prompt, String imageBase64, String mimeType) {
        this.prompt = prompt;
        this.imageBase64 = imageBase64;
        this.mimeType = mimeType;
    }

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }

    public String getImageBase64() { return imageBase64; }
    public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }
}
