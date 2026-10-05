package com.fitnessintelligence.service;

import com.fitnessintelligence.dto.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class BiomechanicsEngineService {

    /**
     * Calculates BMI and categorizes according to World Health Organization brackets.
     */
    public Map<String, Object> calculateBMI(double weightKg, double heightCm) {
        if (weightKg <= 0 || heightCm <= 0) {
            throw new IllegalArgumentException("Weight and height must be positive values.");
        }
        double heightM = heightCm / 100.0;
        double bmiRaw = weightKg / (heightM * heightM);
        double bmi = Math.round(bmiRaw * 10.0) / 10.0;

        String category;
        if (bmi < 18.5) category = "Underweight";
        else if (bmi < 25.0) category = "Normal";
        else if (bmi < 30.0) category = "Overweight";
        else category = "Obese";

        Map<String, Object> result = new HashMap<>();
        result.put("bmi", bmi);
        result.put("category", category);
        result.put("formula", "BMI = weight (kg) / (height (m))²");
        return result;
    }

    /**
     * Calculates BMR using the Mifflin-St Jeor equation.
     */
    public int calculateBMR(double weightKg, double heightCm, int age, String sex) {
        if (weightKg <= 0 || heightCm <= 0 || age <= 0) {
            throw new IllegalArgumentException("Weight, height, and age must be positive.");
        }
        // Mifflin-St Jeor:
        // Male: 10 * W + 6.25 * H - 5 * A + 5
        // Female: 10 * W + 6.25 * H - 5 * A - 161
        // Unspecified: 10 * W + 6.25 * H - 5 * A - 78 (midpoint)
        int sexOffset = -78;
        if ("male".equalsIgnoreCase(sex)) sexOffset = 5;
        if ("female".equalsIgnoreCase(sex)) sexOffset = -161;

        return (int) Math.round(10.0 * weightKg + 6.25 * heightCm - 5.0 * age + sexOffset);
    }

    /**
     * Calculates TDEE from BMR and physical activity level multiplier.
     */
    public int calculateTDEE(int bmr, String activityLevel) {
        double multiplier = switch (activityLevel != null ? activityLevel.toLowerCase() : "moderate") {
            case "sedentary" -> 1.2;
            case "light" -> 1.375;
            case "moderate" -> 1.55;
            case "very_active", "heavy" -> 1.725;
            case "athlete" -> 1.9;
            default -> 1.55;
        };
        return (int) Math.round(bmr * multiplier);
    }

    /**
     * Calculates Goal Calories with metabolic safety floor protection.
     */
    public int calculateGoalCalories(int tdee, String goal, String sex) {
        int floor = "female".equalsIgnoreCase(sex) ? 1200 : "male".equalsIgnoreCase(sex) ? 1500 : 1400;

        int target = tdee;
        if ("lose_fat".equalsIgnoreCase(goal)) {
            target = (int) Math.round(tdee * 0.85); // 15% controlled deficit
        } else if ("build_muscle".equalsIgnoreCase(goal)) {
            target = (int) Math.round(tdee * 1.08); // 8% controlled lean surplus
        }

        // Clamp at floor
        return Math.max(target, floor);
    }

    /**
     * Calculates Macro Split in grams and percentages.
     */
    public Map<String, Double> calculateMacros(int goalCalories, double weightKg, String goal) {
        double proteinMultiplier = 1.8;
        if ("build_muscle".equalsIgnoreCase(goal) || "lose_fat".equalsIgnoreCase(goal)) {
            proteinMultiplier = 2.0; // 2.0 g/kg preserves LBM during deficit or maximizes MPS
        } else if ("maintain".equalsIgnoreCase(goal) || "get_fitter".equalsIgnoreCase(goal)) {
            proteinMultiplier = 1.6;
        }

        double proteinGrams = Math.round(weightKg * proteinMultiplier);
        double proteinKcal = proteinGrams * 4.0;

        // Fat: 25% of calories, min 0.6g/kg
        double fatKcal = goalCalories * 0.25;
        double minFatGrams = weightKg * 0.6;
        if (fatKcal / 9.0 < minFatGrams) {
            fatKcal = minFatGrams * 9.0;
        }
        double fatGrams = Math.round(fatKcal / 9.0);

        // Carbs: Remainder of calories
        double remainingKcal = Math.max(0.0, goalCalories - (proteinKcal + fatGrams * 9.0));
        double carbGrams = Math.round(remainingKcal / 4.0);

        Map<String, Double> macros = new HashMap<>();
        macros.put("proteinGrams", proteinGrams);
        macros.put("fatsGrams", fatGrams);
        macros.put("carbsGrams", carbGrams);
        return macros;
    }

    /**
     * Calculates Baseline Water Target in ml (approx 35 ml/kg).
     */
    public int calculateWaterTarget(double weightKg) {
        double rawMl = weightKg * 35.0;
        return (int) (Math.round(rawMl / 100.0) * 100);
    }

    /**
     * Evaluates Safety Tier and generates human-readable rationales.
     */
    public Map<String, Object> evaluateSafety(double bmi, int calories, int age, String sex) {
        String tier = "GREEN";
        List<String> notes = new ArrayList<>();

        if (bmi < 18.5) {
            tier = "AMBER";
            notes.add("BMI indicates underweight screening range. Prioritize nutrient-dense surplus and strength training.");
        } else if (bmi >= 30.0) {
            tier = "AMBER";
            notes.add("Elevated BMI bracket. Focus on low-impact joint movements and moderate progressive cardio.");
        }

        int floor = "female".equalsIgnoreCase(sex) ? 1200 : 1500;
        if (calories <= floor) {
            tier = "AMBER";
            notes.add("Caloric target reached safety floor (" + floor + " kcal). Calorie restriction clamped to protect endocrine function.");
        }

        if (age < 18) {
            notes.add("Adolescent training guidelines applied: prioritize movement mechanics over maximal load.");
        }

        if (notes.isEmpty()) {
            notes.add("Zero contraindications detected. All parameters within safe physiological bounds.");
        }

        Map<String, Object> safety = new HashMap<>();
        safety.put("tier", tier);
        safety.put("notes", notes);
        return safety;
    }

    /**
     * Comprehensive Full Assessment Pipeline
     */
    public AssessmentResponse processAssessment(AssessmentRequest req) {
        Map<String, Object> bmiMap = calculateBMI(req.getWeightKg(), req.getHeightCm());
        double bmi = (double) bmiMap.get("bmi");
        String category = (String) bmiMap.get("category");

        int bmr = calculateBMR(req.getWeightKg(), req.getHeightCm(), req.getAge(), req.getSex());
        int tdee = calculateTDEE(bmr, req.getActivityLevel());
        int goalCalories = calculateGoalCalories(tdee, req.getGoal(), req.getSex());

        Map<String, Double> macros = calculateMacros(goalCalories, req.getWeightKg(), req.getGoal());
        int waterTarget = calculateWaterTarget(req.getWeightKg());

        Map<String, Object> safetyMap = evaluateSafety(bmi, goalCalories, req.getAge(), req.getSex());

        AssessmentResponse resp = new AssessmentResponse();
        resp.setBmi(bmi);
        resp.setBmiCategory(category);
        resp.setBmr(bmr);
        resp.setTdee(tdee);
        resp.setGoalCalories(goalCalories);
        resp.setProteinGrams(macros.get("proteinGrams"));
        resp.setFatsGrams(macros.get("fatsGrams"));
        resp.setCarbsGrams(macros.get("carbsGrams"));
        resp.setWaterTargetMl(waterTarget);
        resp.setSafetyTier((String) safetyMap.get("tier"));
        resp.setSafetyNotes((List<String>) safetyMap.get("notes"));

        Map<String, String> formulas = new LinkedHashMap<>();
        formulas.put("BMR", "Mifflin-St Jeor: 10W + 6.25H - 5A + s");
        formulas.put("TDEE", "BMR × Physical Activity Factor");
        formulas.put("Goal Calories", req.getGoal().equals("build_muscle") ? "TDEE + 8% surplus" : req.getGoal().equals("lose_fat") ? "TDEE - 15% deficit" : "TDEE maintenance");
        formulas.put("Protein", "ISSN recommendation: 1.6 - 2.0 g/kg");
        formulas.put("Water", "35 ml per kg bodyweight");
        resp.setScientificFormulas(formulas);

        return resp;
    }

    /**
     * Estimates 1RM via Epley and Brzycki equations + generates RIR loading table.
     */
    public OneRepMaxResponse estimateOneRepMax(OneRepMaxRequest req) {
        double w = req.getWeightKg();
        int r = req.getRepsCompleted();

        // Epley: w * (1 + r / 30.0)
        double epley = Math.round(w * (1.0 + (r / 30.0)) * 10.0) / 10.0;

        // Brzycki: w / (1.0278 - 0.0278 * r)
        double brzycki = Math.round((w / (1.0278 - (0.0278 * r))) * 10.0) / 10.0;

        // Averaged recommendation
        double recommended = Math.round(((epley + brzycki) / 2.0) * 10.0) / 10.0;

        Map<String, Double> zones = new LinkedHashMap<>();
        zones.put("Maximum Strength (85-90% 1RM)", Math.round(recommended * 0.875 * 10.0) / 10.0);
        zones.put("Functional Hypertrophy (75-80% 1RM)", Math.round(recommended * 0.775 * 10.0) / 10.0);
        zones.put("Muscular Endurance (60-65% 1RM)", Math.round(recommended * 0.625 * 10.0) / 10.0);

        Map<Integer, Double> rirTable = new LinkedHashMap<>();
        // RIR 0 (100% load for that rep bracket), RIR 1 (~96%), RIR 2 (~92%), RIR 3 (~88%)
        rirTable.put(0, Math.round(w * 1.0 * 10.0) / 10.0);
        rirTable.put(1, Math.round(w * 0.96 * 10.0) / 10.0);
        rirTable.put(2, Math.round(w * 0.92 * 10.0) / 10.0);
        rirTable.put(3, Math.round(w * 0.88 * 10.0) / 10.0);

        OneRepMaxResponse resp = new OneRepMaxResponse();
        resp.setExerciseName(req.getExerciseName());
        resp.setEnteredWeightKg(w);
        resp.setEnteredReps(r);
        resp.setEpley1Rm(epley);
        resp.setBrzycki1Rm(brzycki);
        resp.setRecommended1Rm(recommended);
        resp.setTrainingZones(zones);
        resp.setRpeRirTable(rirTable);
        return resp;
    }

    /**
     * Computes Cardiovascular Longevity Score based on AHA / WHO guidelines.
     */
    public LongevityResponse computeLongevityScore(LongevityRequest req) {
        int cardio = req.getWeeklyCardioMinutes();
        int strength = req.getStrengthSessionsCount();

        int aerobicPct = (int) Math.min(100, Math.round((cardio / 150.0) * 100.0));
        int strengthPct = (int) Math.min(100, Math.round((strength / 2.0) * 100.0));

        // Combined 0-100 score: 60% weight on aerobic, 40% on strength
        int combined = (int) Math.round(aerobicPct * 0.6 + strengthPct * 0.4);

        // Cardiovascular risk reduction up to 39% based on Lancet / JAMA Internal Med
        double riskReduction = Math.round((cardio >= 150 && strength >= 2 ? 39.0 : (aerobicPct * 0.25 + strengthPct * 0.14)) * 10.0) / 10.0;

        String verdict;
        if (combined >= 90) {
            verdict = "Optimal Longevity Compliance: Meets both aerobic and muscle-strengthening WHO benchmarks.";
        } else if (combined >= 60) {
            verdict = "Good Baseline: Approaching recommended public health targets. Adding 30 min of Zone 2 cardio unlocks full longevity benefits.";
        } else {
            verdict = "Sub-threshold: Higher risk profile. Incremental 15-minute daily walks produce the largest marginal gain in mortality reduction.";
        }

        LongevityResponse resp = new LongevityResponse();
        resp.setEnteredCardioMinutes(cardio);
        resp.setEnteredStrengthSessions(strength);
        resp.setAerobicCompliancePct(aerobicPct);
        resp.setStrengthCompliancePct(strengthPct);
        resp.setCombinedLongevityScore(combined);
        resp.setCardiovascularRiskReductionPct(riskReduction);
        resp.setVerdict(verdict);
        resp.setPeerReviewedCitation("WHO Guidelines on Physical Activity (2020) & Mandsager et al. JAMA (2018)");
        return resp;
    }
}
