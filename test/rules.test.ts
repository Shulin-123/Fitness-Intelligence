import { describe, it, expect } from 'vitest';
import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateGoalCalories,
  calculateMacros,
  calculateWaterTarget,
  evaluateSafetyStatus,
  selectSplit,
  buildPlan,
  calculateReadiness,
  generateWeeklyReview,
  calculateMovingAverage,
  calculateStreak,
  calculateAdherence,
} from '../src/engine/rules';
import type { Exercise, UserProfile, SafetyScreenResponses } from '../src/types';

describe('Rules Engine - BMI & Caveats', () => {
  it('calculates normal BMI correctly with explanation and caveat', () => {
    const res = calculateBMI(70, 175);
    expect(res.value.bmi).toBe(22.9);
    expect(res.value.category).toBe('normal');
    expect(res.explanation.caveat).toContain('Screening measure, not a diagnosis');
    expect(res.explanation.inputs.weightKg).toBe(70);
  });

  it('identifies underweight and overweight thresholds', () => {
    const underweight = calculateBMI(45, 170);
    expect(underweight.value.category).toBe('underweight');

    const overweight = calculateBMI(85, 170);
    expect(overweight.value.category).toBe('overweight');
  });

  it('throws error for invalid non-positive inputs', () => {
    expect(() => calculateBMI(0, 175)).toThrow('Weight and height must be positive numbers');
    expect(() => calculateBMI(70, -10)).toThrow('Weight and height must be positive numbers');
  });
});

describe('Rules Engine - BMR, TDEE, Calorie Floor & Deficit Clamping', () => {
  it('calculates Mifflin-St Jeor BMR for male, female, and unspecified', () => {
    // Male: 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1674
    const maleBMR = calculateBMR(70, 175, 25, 'male');
    expect(maleBMR.value).toBe(1674);

    // Female: 10*60 + 6.25*165 - 5*28 - 161 = 600 + 1031.25 - 140 - 161 = 1330.25 -> 1330
    const femaleBMR = calculateBMR(60, 165, 28, 'female');
    expect(femaleBMR.value).toBe(1330);

    const unspecifiedBMR = calculateBMR(60, 165, 28, 'unspecified');
    expect(unspecifiedBMR.value).toBeGreaterThan(femaleBMR.value);
  });

  it('calculates TDEE using physical activity multiplier', () => {
    const tdee = calculateTDEE(1600, 'moderate'); // 1600 * 1.55 = 2480
    expect(tdee.value).toBe(2480);
    expect(tdee.explanation.inputs.multiplier).toBe(1.55);
  });

  it('enforces calorie deficit and hard safety floors (1500m / 1200f / 1400u)', () => {
    // Normal deficit
    const normalDeficit = calculateGoalCalories(2400, 'lose_fat', 'male');
    expect(normalDeficit.value).toBe(2040); // 2400 * 0.85

    // Deficit that would dip below male 1500 floor
    const lowTdeeDeficitMale = calculateGoalCalories(1600, 'lose_fat', 'male');
    // 1600 * 0.85 = 1360 -> clamped to 1500
    expect(lowTdeeDeficitMale.value).toBe(1500);
    expect(lowTdeeDeficitMale.explanation.ruleFired).toContain('Floor protection engaged');

    // Deficit that would dip below female 1200 floor
    const lowTdeeDeficitFemale = calculateGoalCalories(1300, 'lose_fat', 'female');
    // 1300 * 0.85 = 1105 -> clamped to 1200
    expect(lowTdeeDeficitFemale.value).toBe(1200);

    // Unspecified floor 1400
    const lowTdeeDeficitUnspecified = calculateGoalCalories(1400, 'lose_fat', 'unspecified');
    expect(lowTdeeDeficitUnspecified.value).toBe(1400);
  });

  it('calculates muscle building surplus and maintain', () => {
    const muscle = calculateGoalCalories(2000, 'build_muscle', 'male');
    expect(muscle.value).toBe(2160); // 2000 * 1.08

    const maintain = calculateGoalCalories(2000, 'maintain', 'male');
    expect(maintain.value).toBe(2000);
  });
});

describe('Rules Engine - Macros & Hydration', () => {
  it('calculates protein 2.0g/kg for muscle building and fat minimums', () => {
    const macros = calculateMacros(2500, 75, 'build_muscle');
    expect(macros.value.proteinGrams).toBe(150); // 75 * 2.0
    expect(macros.value.fatGrams).toBeGreaterThanOrEqual(Math.round(75 * 0.6));
    expect(macros.value.carbGrams).toBeGreaterThan(0);
    expect(macros.explanation.inputs.proteinMultiplier).toBe(2.0);
  });

  it('calculates water target rounded to nearest 100ml', () => {
    // 70kg * 35 = 2450 -> rounded to 2500ml
    const water = calculateWaterTarget(70);
    expect(water.value).toBe(2500);
  });
});

describe('Rules Engine - Safety Status Stratification (Green, Amber, Red)', () => {
  const baseSafeResponses: SafetyScreenResponses = {
    conditionAffectingExercise: false,
    diagnosedCardiovascularOrBP: false,
    recentSurgery: false,
    injuryOrPain: false,
    pregnantOrBreastfeeding: false,
    concerningSymptomsDuringExercise: false,
  };

  it('evaluates completely healthy profile as GREEN tier', () => {
    const res = evaluateSafetyStatus({
      safetyResponses: baseSafeResponses,
      goal: 'build_muscle',
      weightKg: 75,
      heightCm: 180,
    });
    expect(res.tier).toBe('green');
    expect(res.reasons.length).toBe(0);
  });

  it('evaluates chest pain/fainting during exercise as RED tier', () => {
    const res = evaluateSafetyStatus({
      safetyResponses: {
        ...baseSafeResponses,
        concerningSymptomsDuringExercise: true,
      },
    });
    expect(res.tier).toBe('red');
    expect(res.reasons.some((r) => r.code === 'CONCERNING_EXERCISE_SYMPTOMS')).toBe(true);
    expect(res.reasons[0].detail).toContain('seek medical consultation');
  });

  it('evaluates cardiovascular/BP or uncleared surgery as AMBER tier', () => {
    const cardioRes = evaluateSafetyStatus({
      safetyResponses: {
        ...baseSafeResponses,
        diagnosedCardiovascularOrBP: true,
      },
    });
    expect(cardioRes.tier).toBe('amber');

    const surgeryRes = evaluateSafetyStatus({
      safetyResponses: {
        ...baseSafeResponses,
        recentSurgery: true,
        recentSurgeryCleared: false,
      },
    });
    expect(surgeryRes.tier).toBe('amber');
  });

  it('evaluates BMI < 18.5 with weight loss goal as AMBER safety tier', () => {
    const res = evaluateSafetyStatus({
      safetyResponses: baseSafeResponses,
      goal: 'lose_fat',
      weightKg: 45,
      heightCm: 170, // BMI 15.5
    });
    expect(res.tier).toBe('amber');
    expect(res.reasons.some((r) => r.code === 'LOW_BMI_DEFICIT_RISK')).toBe(true);
  });
});

describe('Rules Engine - Workout Splits and Plan Building', () => {
  it('selects appropriate split for day counts from 2 to 6', () => {
    expect(selectSplit(2).splitName).toContain('2-Day');
    expect(selectSplit(3).splitName).toContain('3-Day');
    expect(selectSplit(4).splitName).toContain('4-Day');
    expect(selectSplit(5).splitName).toContain('Upper / Lower / Push / Pull / Legs');
    expect(selectSplit(6).splitName).toContain('6-Day');
  });

  const mockLibrary: Exercise[] = [
    {
      id: 'barbell_squat',
      name: 'Barbell Back Squat',
      muscleGroup: 'legs',
      equipment: 'barbell',
      difficulty: 'advanced',
      contraindicationTags: ['knee', 'lower_back'],
      alternativeExerciseId: 'leg_press',
      shortCueText: 'Drive knees out and keep chest tall.',
      videoAnalysisSupported: 'squat',
    },
    {
      id: 'leg_press',
      name: 'Leg Press Machine',
      muscleGroup: 'legs',
      equipment: 'machine',
      difficulty: 'beginner',
      contraindicationTags: [],
      shortCueText: 'Keep lower back glued to pad.',
    },
    {
      id: 'bench_press',
      name: 'Barbell Bench Press',
      muscleGroup: 'chest',
      equipment: 'barbell',
      difficulty: 'intermediate',
      contraindicationTags: ['shoulder'],
      alternativeExerciseId: 'chest_press_machine',
      shortCueText: 'Retract scapula and press evenly.',
    },
    {
      id: 'chest_press_machine',
      name: 'Seated Chest Press',
      muscleGroup: 'chest',
      equipment: 'machine',
      difficulty: 'beginner',
      contraindicationTags: [],
      shortCueText: 'Smooth tempo without locking elbows.',
    },
    {
      id: 'lat_pulldown',
      name: 'Cable Lat Pulldown',
      muscleGroup: 'back',
      equipment: 'cable',
      difficulty: 'beginner',
      contraindicationTags: [],
      shortCueText: 'Pull to collarbone with broad chest.',
    },
    {
      id: 'overhead_press',
      name: 'Dumbbell Shoulder Press',
      muscleGroup: 'shoulders',
      equipment: 'dumbbell',
      difficulty: 'intermediate',
      contraindicationTags: ['shoulder'],
      shortCueText: 'Press overhead in scapular plane.',
    },
    {
      id: 'biceps_curl',
      name: 'Dumbbell Biceps Curl',
      muscleGroup: 'arms',
      equipment: 'dumbbell',
      difficulty: 'beginner',
      contraindicationTags: ['wrist'],
      shortCueText: 'Keep elbows fixed at sides.',
      videoAnalysisSupported: 'biceps_curl',
    },
    {
      id: 'plank',
      name: 'Forearm Plank',
      muscleGroup: 'core',
      equipment: 'bodyweight',
      difficulty: 'beginner',
      contraindicationTags: ['lower_back'],
      shortCueText: 'Brace core and squeeze glutes.',
    },
  ];

  const mockProfile: UserProfile = {
    id: 'user-1',
    name: 'Alex',
    age: 28,
    sex: 'male',
    heightCm: 178,
    weightKg: 78,
    goal: 'build_muscle',
    experience: 'intermediate',
    trainingDaysPerWeek: 4,
    sessionDurationMin: 45,
    activityLevel: 'moderate',
    dietPreference: 'non_veg',
    allergies: [],
    foodExclusions: [],
    units: 'metric',
    safetyResponses: {
      conditionAffectingExercise: false,
      diagnosedCardiovascularOrBP: false,
      recentSurgery: false,
      injuryOrPain: false,
      pregnantOrBreastfeeding: false,
      concerningSymptomsDuringExercise: false,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('returns NULL plan for RED safety tier', () => {
    const plan = buildPlan(mockProfile, 'red', mockLibrary);
    expect(plan).toBeNull();
  });

  it('builds plan for GREEN tier with standard volume and RPE', () => {
    const plan = buildPlan(mockProfile, 'green', mockLibrary);
    expect(plan).not.toBeNull();
    expect(plan?.days.length).toBe(4);
    expect(plan?.volumeTier).toBe('standard');
    expect(plan?.rpeCap).toBe(8);
  });

  it('substitutes contraindicated exercises for AMBER tier with injuries', () => {
    const injuredProfile: UserProfile = {
      ...mockProfile,
      safetyResponses: {
        ...mockProfile.safetyResponses,
        injuryOrPain: true,
        injuryAreas: ['knee'],
      },
    };

    const plan = buildPlan(injuredProfile, 'amber', mockLibrary);
    expect(plan).not.toBeNull();
    expect(plan?.volumeTier).toBe('amber_reduced');
    expect(plan?.rpeCap).toBe(7);

    // Verify barbell_squat was substituted with leg_press
    const allExercises = plan?.days.flatMap((d) => d.exercises) || [];
    const hasSquat = allExercises.some((e) => e.exerciseId === 'barbell_squat');
    expect(hasSquat).toBe(false);
  });
});

describe('Rules Engine - Readiness Scoring & Adjustments', () => {
  it('keeps full volume when readiness score >= 65', () => {
    const res = calculateReadiness(4, 2, 4); // Good sleep, low soreness, good energy
    expect(res.value.score).toBeGreaterThanOrEqual(65);
    expect(res.value.adjustment).toBe('keep');
  });

  it('reduces volume by ~30% when readiness score is between 40 and 64', () => {
    const res = calculateReadiness(3, 3, 3); // Moderate sleep, moderate soreness, moderate energy -> composite 50
    expect(res.value.score).toBeLessThan(65);
    expect(res.value.score).toBeGreaterThanOrEqual(40);
    expect(res.value.adjustment).toBe('reduce_volume');
  });

  it('recommends active recovery when readiness score < 40', () => {
    const res = calculateReadiness(1, 5, 1); // Terribly fatigued
    expect(res.value.score).toBeLessThan(40);
    expect(res.value.adjustment).toBe('active_recovery');
  });
});

describe('Rules Engine - Adaptive Weekly Review', () => {
  it('suggests gentle -100 kcal adjustment when weight stalls at >80% adherence', () => {
    const review = generateWeeklyReview(0.0, 90, 4, 4, 'lose_fat', 2200, 'male');
    expect(review.suggestedAdjustmentKcal).toBe(-100);
    expect(review.insight).toContain('kickstart fat mobilization');
  });

  it('protects calorie floor from dropping below minimum', () => {
    const review = generateWeeklyReview(0.0, 90, 4, 4, 'lose_fat', 1550, 'male');
    // Floor is 1500, current is 1550, -100 would be 1450 -> clamped to -50
    expect(review.suggestedAdjustmentKcal).toBe(-50);
  });

  it('adds +100 kcal buffer when losing fat too quickly (>0.8kg/wk)', () => {
    const review = generateWeeklyReview(-1.2, 85, 4, 4, 'lose_fat', 2000, 'female');
    expect(review.suggestedAdjustmentKcal).toBe(100);
  });
});

describe('Rules Engine - Helpers: Moving Average, Streak, Adherence', () => {
  it('calculates 7-day moving average accurately', () => {
    const weights = [80, 79.8, 79.5, 79.6, 79.4, 79.2, 79.0];
    const ma = calculateMovingAverage(weights, 7);
    expect(ma.length).toBe(7);
    expect(ma[ma.length - 1]).toBe(79.5);
  });

  it('calculates streaks correctly', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const dayBefore = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

    expect(calculateStreak([today, yesterday, dayBefore])).toBe(3);
    expect(calculateStreak([])).toBe(0);
  });

  it('calculates adherence percentage capped at 100', () => {
    expect(calculateAdherence(4, 4)).toBe(100);
    expect(calculateAdherence(3, 4)).toBe(75);
    expect(calculateAdherence(5, 4)).toBe(100);
  });
});
