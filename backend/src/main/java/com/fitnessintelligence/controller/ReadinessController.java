package com.fitnessintelligence.controller;

import com.fitnessintelligence.dto.ReadinessDto;
import com.fitnessintelligence.service.FitnessDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/readiness")
public class ReadinessController {

    private final FitnessDataService fitnessDataService;

    public ReadinessController(FitnessDataService fitnessDataService) {
        this.fitnessDataService = fitnessDataService;
    }

    @GetMapping
    public ResponseEntity<List<ReadinessDto>> getReadiness(@RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(fitnessDataService.getReadinessForUser(userId));
    }

    @PostMapping
    public ResponseEntity<ReadinessDto> logReadiness(@RequestBody ReadinessDto dto) {
        ReadinessDto saved = fitnessDataService.logReadiness(dto);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/demo-log")
    public ResponseEntity<ReadinessDto> logDemoReadiness() {
        ReadinessDto demo = new ReadinessDto(
                null,
                1L,
                LocalDate.now(),
                9,  // sleep
                2,  // soreness (low)
                2,  // stress (low)
                9,  // energy (high)
                0,  // will be auto-calculated
                null
        );
        return ResponseEntity.ok(fitnessDataService.logReadiness(demo));
    }
}
