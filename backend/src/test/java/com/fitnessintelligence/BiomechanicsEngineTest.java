package com.fitnessintelligence;

import com.fitnessintelligence.dto.*;
import com.fitnessintelligence.service.BiomechanicsEngineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class BiomechanicsEngineTest {

    private BiomechanicsEngineService engine;

    @BeforeEach
    void setUp() {
        engine = new BiomechanicsEngineService();
    }

    @Test
    void testBmrMifflinStJeorFormula() {
        // Male: 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1674 kcal
        int maleBmr = engine.calculateBMR(70.0, 175.0, 25, "male");
        assertEquals(1674, maleBmr);

        // Female: 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25 -> 1320 kcal
        int femaleBmr = engine.calculateBMR(60.0, 165.0, 30, "female");
        assertEquals(1320, femaleBmr);
    }

    @Test
    void testTdeeMultiplier() {
        int bmr = 1674;
        int tdeeModerate = engine.calculateTDEE(bmr, "moderate");
        // 1674 * 1.55 = 2594.7 -> 2595 kcal
        assertEquals(2595, tdeeModerate);

        int tdeeSedentary = engine.calculateTDEE(bmr, "sedentary");
        // 1674 * 1.2 = 2008.8 -> 2009 kcal
        assertEquals(2009, tdeeSedentary);
    }

    @Test
    void testGoalCalorieFloors() {
        // Extreme deficit test for male: should clamp at 1500 kcal
        int clampedMale = engine.calculateGoalCalories(1600, "lose_fat", "male");
        // 1600 * 0.85 = 1360 -> clamped to 1500
        assertEquals(1500, clampedMale);

        // Extreme deficit for female: should clamp at 1200 kcal
        int clampedFemale = engine.calculateGoalCalories(1300, "lose_fat", "female");
        // 1300 * 0.85 = 1105 -> clamped to 1200
        assertEquals(1200, clampedFemale);
    }

    @Test
    void testMacroSplitSummation() {
        int targetCalories = 2400;
        double weightKg = 75.0;
        Map<String, Double> macros = engine.calculateMacros(targetCalories, weightKg, "build_muscle");

        assertNotNull(macros);
        double protein = macros.get("proteinGrams");
        double fats = macros.get("fatsGrams");
        double carbs = macros.get("carbsGrams");

        // 75kg * 2.0g/kg = 150g protein
        assertEquals(150.0, protein);

        // Verify total calories are approximately matching
        double calculatedKcal = (protein * 4.0) + (fats * 9.0) + (carbs * 4.0);
        assertTrue(Math.abs(calculatedKcal - targetCalories) < 20.0, "Macros must approximately equal target calories");
    }

    @Test
    void testOneRepMaxCalculation() {
        OneRepMaxRequest bench = new OneRepMaxRequest("Bench Press", 100.0, 5);
        OneRepMaxResponse response = engine.estimateOneRepMax(bench);

        // Epley formula: 100 * (1 + 5/30) = 116.7 kg
        assertEquals(116.7, response.getEpley1Rm(), 0.1);

        // Brzycki formula: 100 / (1.0278 - 0.0278*5) = 112.5 kg
        assertEquals(112.5, response.getBrzycki1Rm(), 0.2);

        // Recommended average is between the two
        assertTrue(response.getRecommended1Rm() > 112.0 && response.getRecommended1Rm() < 117.0);

        // Check that training zones exist
        assertNotNull(response.getTrainingZones());
        assertTrue(response.getTrainingZones().containsKey("Maximum Strength (85-90% 1RM)"));
    }

    @Test
    void testLongevityScoreCompliance() {
        LongevityRequest optimal = new LongevityRequest(150, 2);
        LongevityResponse response = engine.computeLongevityScore(optimal);

        assertEquals(100, response.getAerobicCompliancePct());
        assertEquals(100, response.getStrengthCompliancePct());
        assertEquals(100, response.getCombinedLongevityScore());
        assertEquals(39.0, response.getCardiovascularRiskReductionPct());
        assertTrue(response.getVerdict().contains("Optimal Longevity Compliance"));
    }
}
