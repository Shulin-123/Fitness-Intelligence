package com.fitnessintelligence.controller;

import com.fitnessintelligence.dto.AICoachRequest;
import com.fitnessintelligence.dto.AICoachResponse;
import com.fitnessintelligence.service.AICoachService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AICoachController {

    private final AICoachService aiCoachService;

    public AICoachController(AICoachService aiCoachService) {
        this.aiCoachService = aiCoachService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AICoachResponse> chat(@RequestBody AICoachRequest request) {
        AICoachResponse response = aiCoachService.processQuery(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/demo")
    public ResponseEntity<AICoachResponse> demoQuery() {
        AICoachRequest req = new AICoachRequest("How do I break through a bench press plateau?");
        return ResponseEntity.ok(aiCoachService.processQuery(req));
    }
}
