package com.fitnessintelligence.controller;

import com.fitnessintelligence.dto.DailyNutritionDto;
import com.fitnessintelligence.service.FitnessDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/nutrition")
public class NutritionController {

    private final FitnessDataService fitnessDataService;

    public NutritionController(FitnessDataService fitnessDataService) {
        this.fitnessDataService = fitnessDataService;
    }

    @GetMapping
    public ResponseEntity<List<DailyNutritionDto>> getNutrition(@RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(fitnessDataService.getNutritionForUser(userId));
    }

    @PostMapping
    public ResponseEntity<DailyNutritionDto> logNutrition(@RequestBody DailyNutritionDto dto) {
        DailyNutritionDto saved = fitnessDataService.logNutrition(dto);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/demo-log")
    public ResponseEntity<DailyNutritionDto> logDemoNutrition() {
        DailyNutritionDto demo = new DailyNutritionDto(
                null,
                1L,
                LocalDate.now(),
                2650,
                175.0,
                310.0,
                75.0,
                3500
        );
        return ResponseEntity.ok(fitnessDataService.logNutrition(demo));
    }
}
