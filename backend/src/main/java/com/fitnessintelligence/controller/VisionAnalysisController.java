package com.fitnessintelligence.controller;

import com.fitnessintelligence.dto.AICoachRequest;
import com.fitnessintelligence.dto.AICoachResponse;
import com.fitnessintelligence.service.AICoachService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vision")
public class VisionAnalysisController {

    private final AICoachService aiCoachService;

    public VisionAnalysisController(AICoachService aiCoachService) {
        this.aiCoachService = aiCoachService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<AICoachResponse> analyzeImageOrVideoFrame(@RequestBody AICoachRequest request) {
        if (request.getPrompt() == null || request.getPrompt().isBlank()) {
            request.setPrompt("Perform a comprehensive biomechanics, posture, joint angle, and safety audit on this image or video frame. Point out any errors and give numbered corrective cues.");
        }
        AICoachResponse response = aiCoachService.processQuery(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/demo")
    public ResponseEntity<AICoachResponse> demoVisionAnalysis() {
        AICoachRequest req = new AICoachRequest("Analyze Barbell Squat depth, hip crease alignment, and knee valgus from video snapshot.");
        return ResponseEntity.ok(aiCoachService.processQuery(req));
    }
}
