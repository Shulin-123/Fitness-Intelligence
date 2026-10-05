package com.fitnessintelligence.controller;

import com.fitnessintelligence.model.*;
import com.fitnessintelligence.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/database")
public class DatabasePreviewController {

    private final UserRepository userRepository;
    private final WorkoutSessionRepository workoutRepository;
    private final DailyNutritionRepository nutritionRepository;
    private final ReadinessCheckinRepository readinessRepository;

    public DatabasePreviewController(
            UserRepository userRepository,
            WorkoutSessionRepository workoutRepository,
            DailyNutritionRepository nutritionRepository,
            ReadinessCheckinRepository readinessRepository
    ) {
        this.userRepository = userRepository;
        this.workoutRepository = workoutRepository;
        this.nutritionRepository = nutritionRepository;
        this.readinessRepository = readinessRepository;
    }

    @GetMapping("/preview")
    public ResponseEntity<Map<String, Object>> previewDatabase() {
        Map<String, Object> preview = new HashMap<>();
        preview.put("databaseStatus", "LIVE (H2 In-Memory / JPA)");
        preview.put("jdbcUrl", "jdbc:h2:mem:fitnessdb");
        preview.put("totalUsers", userRepository.count());
        preview.put("totalWorkouts", workoutRepository.count());
        preview.put("totalNutritionLogs", nutritionRepository.count());
        preview.put("totalReadinessCheckins", readinessRepository.count());
        preview.put("users", userRepository.findAll());
        preview.put("workouts", workoutRepository.findAll());
        preview.put("nutritionLogs", nutritionRepository.findAll());
        preview.put("readinessLogs", readinessRepository.findAll());
        return ResponseEntity.ok(preview);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserEntity>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/workouts")
    public ResponseEntity<List<WorkoutSessionEntity>> getAllWorkouts() {
        return ResponseEntity.ok(workoutRepository.findAll());
    }

    @GetMapping("/nutrition")
    public ResponseEntity<List<DailyNutritionEntity>> getAllNutrition() {
        return ResponseEntity.ok(nutritionRepository.findAll());
    }

    @GetMapping("/readiness")
    public ResponseEntity<List<ReadinessCheckinEntity>> getAllReadiness() {
        return ResponseEntity.ok(readinessRepository.findAll());
    }
}
