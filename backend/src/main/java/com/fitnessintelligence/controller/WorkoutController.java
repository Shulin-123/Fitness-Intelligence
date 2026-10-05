package com.fitnessintelligence.controller;

import com.fitnessintelligence.dto.ExerciseDto;
import com.fitnessintelligence.dto.WorkoutDto;
import com.fitnessintelligence.service.FitnessDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final FitnessDataService fitnessDataService;

    public WorkoutController(FitnessDataService fitnessDataService) {
        this.fitnessDataService = fitnessDataService;
    }

    @GetMapping
    public ResponseEntity<List<WorkoutDto>> getWorkouts(@RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(fitnessDataService.getWorkoutsForUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutDto> getWorkoutById(@PathVariable Long id) {
        return fitnessDataService.getWorkoutById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<WorkoutDto> logWorkout(@RequestBody WorkoutDto workoutDto) {
        WorkoutDto saved = fitnessDataService.logWorkout(workoutDto);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/demo-log")
    public ResponseEntity<WorkoutDto> logDemoWorkout() {
        List<ExerciseDto> exercises = new ArrayList<>();
        exercises.add(new ExerciseDto("Barbell Incline Bench", 4, 8, 85.0, 2));
        exercises.add(new ExerciseDto("Weighted Dips", 3, 10, 20.0, 1));
        exercises.add(new ExerciseDto("Overhead Cable Triceps", 3, 12, 30.0, 2));

        WorkoutDto demo = new WorkoutDto(
                null,
                1L,
                LocalDate.now(),
                "Upper Body Hypertrophy (Live Logged via Spring Boot)",
                50,
                8.5,
                "Chest and triceps primed. Seamless RIR execution.",
                true,
                exercises
        );
        return ResponseEntity.ok(fitnessDataService.logWorkout(demo));
    }
}
