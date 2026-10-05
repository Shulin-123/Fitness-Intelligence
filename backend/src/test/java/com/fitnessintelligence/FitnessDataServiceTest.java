package com.fitnessintelligence;

import com.fitnessintelligence.dto.*;
import com.fitnessintelligence.service.FitnessDataService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class FitnessDataServiceTest {

    @Autowired
    private FitnessDataService fitnessDataService;

    @Test
    void testSyncUserAndLookup() {
        UserDto dto = new UserDto();
        dto.setEmail("sarah.connor@test.com");
        dto.setName("Sarah Connor");
        dto.setAge(30);
        dto.setWeightKg(65.0);
        dto.setHeightCm(170.0);
        dto.setGoal("fat_loss");

        UserDto saved = fitnessDataService.syncUser(dto);
        assertNotNull(saved.getId());
        assertEquals("sarah.connor@test.com", saved.getEmail());
        assertEquals("fat_loss", saved.getGoal());

        // Update
        saved.setWeightKg(63.5);
        UserDto updated = fitnessDataService.syncUser(saved);
        assertEquals(saved.getId(), updated.getId());
        assertEquals(63.5, updated.getWeightKg());
    }

    @Test
    void testLogWorkoutWithAutomatic1Rm() {
        WorkoutDto workout = new WorkoutDto();
        workout.setSplitName("Pull Day B");
        workout.setDurationMinutes(50);
        workout.setOverallRpe(8.0);
        workout.setSessionDate(LocalDate.now());

        ExerciseDto deadlift = new ExerciseDto("Barbell Deadlift", 3, 5, 140.0, 2);
        workout.getExercises().add(deadlift);

        WorkoutDto saved = fitnessDataService.logWorkout(workout);
        assertNotNull(saved.getId());
        assertEquals(1, saved.getExercises().size());

        ExerciseDto savedExercise = saved.getExercises().get(0);
        assertEquals("Barbell Deadlift", savedExercise.getExerciseName());
        assertTrue(savedExercise.getEstimated1Rm() > 140.0, "Estimated 1RM must be greater than working weight");
    }

    @Test
    void testLogNutritionAndRetrieve() {
        DailyNutritionDto nutrition = new DailyNutritionDto();
        nutrition.setCalories(2600);
        nutrition.setProteinGrams(170.0);
        nutrition.setCarbsGrams(300.0);
        nutrition.setFatsGrams(75.0);
        nutrition.setWaterMl(3400);

        DailyNutritionDto saved = fitnessDataService.logNutrition(nutrition);
        assertNotNull(saved.getId());
        assertEquals(2600, saved.getCalories());
        assertEquals(170.0, saved.getProteinGrams());
    }

    @Test
    void testLogReadinessCalculatesScore() {
        ReadinessDto readiness = new ReadinessDto();
        readiness.setSleepQuality(9);
        readiness.setMuscleSoreness(2); // low soreness
        readiness.setStressLevel(2);    // low stress
        readiness.setEnergyLevel(9);

        ReadinessDto saved = fitnessDataService.logReadiness(readiness);
        assertNotNull(saved.getId());
        assertTrue(saved.getReadinessScore() >= 80, "High readiness factors must compute score >= 80");
        assertNotNull(saved.getRecommendation());
        assertTrue(saved.getRecommendation().contains("Optimal CNS readiness"));
    }
}
