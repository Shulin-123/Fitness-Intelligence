package com.fitnessintelligence.controller;

import com.fitnessintelligence.dto.*;
import com.fitnessintelligence.service.BiomechanicsEngineService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/engine")
public class BiomechanicsEngineController {

    private final BiomechanicsEngineService engineService;

    public BiomechanicsEngineController(BiomechanicsEngineService engineService) {
        this.engineService = engineService;
    }

    @PostMapping("/calculate-assessment")
    public ResponseEntity<AssessmentResponse> calculateAssessment(@Valid @RequestBody AssessmentRequest request) {
        AssessmentResponse response = engineService.processAssessment(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/estimate-1rm")
    public ResponseEntity<OneRepMaxResponse> estimateOneRepMax(@Valid @RequestBody OneRepMaxRequest request) {
        OneRepMaxResponse response = engineService.estimateOneRepMax(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/longevity-score")
    public ResponseEntity<LongevityResponse> computeLongevityScore(@Valid @RequestBody LongevityRequest request) {
        LongevityResponse response = engineService.computeLongevityScore(request);
        return ResponseEntity.ok(response);
    }

    // -------------------------------------------------------------
    // Direct 1-Click GET Demo Endpoints (Instant Browser Testing)
    // -------------------------------------------------------------

    @GetMapping("/demo-assessment")
    public ResponseEntity<AssessmentResponse> demoAssessment() {
        AssessmentRequest alex = new AssessmentRequest(74.5, 178.0, 28, "male", "build_muscle", "moderate");
        return ResponseEntity.ok(engineService.processAssessment(alex));
    }

    @GetMapping("/demo-1rm")
    public ResponseEntity<OneRepMaxResponse> demo1Rm() {
        OneRepMaxRequest bench = new OneRepMaxRequest("Barbell Bench Press", 82.5, 8);
        return ResponseEntity.ok(engineService.estimateOneRepMax(bench));
    }

    @GetMapping("/demo-longevity")
    public ResponseEntity<LongevityResponse> demoLongevity() {
        LongevityRequest req = new LongevityRequest(150, 3);
        return ResponseEntity.ok(engineService.computeLongevityScore(req));
    }
}
