package com.fitnessintelligence.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@RequestMapping("/api")
public class HealthController {

    @GetMapping({"/health", "/status"})
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Fitness Intelligence Backend");
        response.put("engine", "Deterministic Biomechanics & Sports Science");
        response.put("javaVersion", System.getProperty("java.version"));
        response.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("version", "1.0.0");
        info.put("description", "Spring Boot REST API for Fitness Intelligence");
        info.put("features", new String[]{
                "Deterministic TDEE & Macro Calculations",
                "Progressive Overload Tracking",
                "Pose Biomechanics Validation",
                "Longevity Habit Compliance"
        });
        return ResponseEntity.ok(info);
    }
}
