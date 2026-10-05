// Seeded 3-Week Persona for Demo Mode
// Persona: 28yo, 78kg, 175cm, goal lose fat, 4 days/week, amber flag for knee niggle

import type {
  UserProfile,
  WeightLogEntry,
  DailyNutritionLog,
  WorkoutSessionLog,
  ReadinessCheckinData,
  WeeklyReviewReport,
} from '../types';

export const DEMO_PROFILE: UserProfile = {
  id: 'demo-user-1',
  name: 'Alex Morgan',
  email: 'alex.demo@fitnessintelligence.local',
  age: 28,
  sex: 'male',
  heightCm: 175,
  weightKg: 78.0,
  targetWeightKg: 74.0,
  goal: 'lose_fat',
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
    injuryOrPain: true,
    injuryAreas: ['knee'],
    pregnantOrBreastfeeding: false,
    concerningSymptomsDuringExercise: false,
  },
  createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
};

// Generate 21 consecutive past days of data
export function generateDemoHistory(): {
  weights: WeightLogEntry[];
  nutrition: DailyNutritionLog[];
  workouts: WorkoutSessionLog[];
  readiness: ReadinessCheckinData[];
  reviews: WeeklyReviewReport[];
} {
  const weights: WeightLogEntry[] = [];
  const nutrition: DailyNutritionLog[] = [];
  const workouts: WorkoutSessionLog[] = [];
  const readiness: ReadinessCheckinData[] = [];

  const now = Date.now();
  const dayMs = 86400000;

  // Weight progression from 79.5 kg down to 77.8 kg with realistic fluctuations
  const weightDeltas = [
    79.5, 79.4, 79.6, 79.2, 79.1, 79.3, 78.9, // Week 1
    78.8, 78.7, 78.9, 78.5, 78.4, 78.6, 78.2, // Week 2
    78.1, 78.0, 78.2, 77.9, 77.9, 77.8, 77.8, // Week 3
  ];

  for (let i = 20; i >= 0; i--) {
    const dateObj = new Date(now - i * dayMs);
    const dateStr = dateObj.toISOString().split('T')[0];
    const dayIdx = 20 - i;

    // Weight
    weights.push({
      id: `weight-demo-${dayIdx}`,
      date: dateStr,
      weightKg: weightDeltas[dayIdx] || 78.0,
      notes: dayIdx % 7 === 0 ? 'Morning weigh-in, post-fast' : undefined,
    });

    // Nutrition
    nutrition.push({
      date: dateStr,
      waterMl: 2500 + (dayIdx % 4) * 250,
      totalCalories: 1950 + ((dayIdx * 37) % 150) - 50,
      totalProteinGrams: 155 + (dayIdx % 15),
      totalCarbGrams: 180 + ((dayIdx * 19) % 30),
      totalFatGrams: 55 + (dayIdx % 8),
      entries: [
        {
          id: `demo-f1-${dayIdx}`,
          mealType: 'breakfast',
          name: 'Rolled Oats with Whey & Blueberries',
          servings: 1,
          totalGrams: 220,
          calories: 420,
          proteinGrams: 36,
          carbGrams: 52,
          fatGrams: 7,
          loggedAt: `${dateStr}T08:15:00Z`,
        },
        {
          id: `demo-f2-${dayIdx}`,
          mealType: 'lunch',
          name: 'Grilled Chicken Breast with Brown Rice & Dal',
          servings: 1,
          totalGrams: 400,
          calories: 610,
          proteinGrams: 55,
          carbGrams: 64,
          fatGrams: 12,
          loggedAt: `${dateStr}T13:00:00Z`,
        },
        {
          id: `demo-f3-${dayIdx}`,
          mealType: 'snacks',
          name: 'Roasted Makhana & Black Coffee',
          servings: 1,
          totalGrams: 150,
          calories: 180,
          proteinGrams: 5,
          carbGrams: 22,
          fatGrams: 6,
          loggedAt: `${dateStr}T16:30:00Z`,
        },
        {
          id: `demo-f4-${dayIdx}`,
          mealType: 'dinner',
          name: 'Paneer Bhurji with 2 Roti & Salad',
          servings: 1,
          totalGrams: 350,
          calories: 640,
          proteinGrams: 38,
          carbGrams: 54,
          fatGrams: 28,
          loggedAt: `${dateStr}T20:10:00Z`,
        },
      ],
    });

    // Readiness
    const sleep = (dayIdx % 3 === 0 ? 4 : dayIdx % 5 === 0 ? 3 : 5);
    const soreness = (dayIdx % 4 === 0 ? 3 : dayIdx % 6 === 0 ? 4 : 2);
    const energy = (dayIdx % 3 === 0 ? 4 : 5);
    const score = Math.min(95, Math.max(50, Math.round(((sleep - 1) * 10 + (6 - soreness) * 10 + (energy - 1) * 10) * 1.1)));

    readiness.push({
      id: `readiness-demo-${dayIdx}`,
      date: dateStr,
      sleepScore: sleep,
      sorenessScore: soreness,
      energyScore: energy,
      calculatedScore: score,
      adjustment: score < 65 ? 'reduce_volume' : 'keep',
      explanation: {
        formula: 'Composite weighted: Sleep 40%, Energy 35%, Soreness 25%',
        inputs: { sleep, soreness, energy },
        ruleFired: score < 65 ? 'Moderate fatigue threshold detected' : 'Optimal physiological recovery',
        caveat: 'Subjective biomarker to optimize mechanical load.',
      },
    });

    // Workouts (4 days per week: Day 0, 1, 3, 5 of each 7-day cycle)
    const dayOfCycle = dayIdx % 7;
    if ([1, 2, 4, 6].includes(dayOfCycle)) {
      const workoutNames = ['Upper Body A', 'Lower Body A (Knee-Safe)', 'Upper Body B', 'Lower Body B (Knee-Safe)'];
      const title = workoutNames[dayOfCycle % 4];

      workouts.push({
        id: `workout-demo-${dayIdx}`,
        date: dateStr,
        planDayTitle: title,
        durationMinutes: 45,
        completed: true,
        readinessAdjustmentApplied: score < 65 ? 'reduce_volume' : 'keep',
        notes: 'Great energy, clean tempo throughout.',
        exercises: [
          {
            exerciseId: 'chest_press_machine',
            exerciseName: 'Seated Chest Press Machine',
            sets: [
              { setNumber: 1, reps: 10, weightKg: 55, rpe: 7, completed: true },
              { setNumber: 2, reps: 10, weightKg: 60, rpe: 7, completed: true },
              { setNumber: 3, reps: 9, weightKg: 60, rpe: 7.5, completed: true },
            ],
          },
          {
            exerciseId: 'lat_pulldown',
            exerciseName: 'Cable Lat Pulldown',
            sets: [
              { setNumber: 1, reps: 12, weightKg: 50, rpe: 7, completed: true },
              { setNumber: 2, reps: 10, weightKg: 55, rpe: 7, completed: true },
              { setNumber: 3, reps: 10, weightKg: 55, rpe: 7, completed: true },
            ],
          },
          {
            exerciseId: 'db_lateral_raise',
            exerciseName: 'Dumbbell Lateral Raise',
            sets: [
              { setNumber: 1, reps: 12, weightKg: 8, rpe: 7, completed: true },
              { setNumber: 2, reps: 12, weightKg: 8, rpe: 7, completed: true },
            ],
          },
        ],
      });
    }
  }

  // One weekly review report from previous week
  const reviews: WeeklyReviewReport[] = [
    {
      id: 'rev-demo-1',
      weekStartDate: new Date(now - 14 * dayMs).toISOString().split('T')[0],
      weekEndDate: new Date(now - 7 * dayMs).toISOString().split('T')[0],
      avgWeightKg: 78.6,
      weightTrendDeltaKg: -0.5,
      adherencePercentage: 92,
      workoutsCompleted: 4,
      workoutsTarget: 4,
      insight: 'Weight decreased by 0.5 kg with outstanding 92% adherence. Current calorie and volume parameters are yielding steady, healthy fat mobilization.',
      suggestedAdjustmentKcal: 0,
      accepted: true,
      appliedDate: new Date(now - 7 * dayMs).toISOString().split('T')[0],
      explanation: {
        formula: 'Review = Trend Delta (-0.5kg) + Adherence (92%)',
        inputs: { weightTrendDeltaKg: -0.5, adherencePercentage: 92, workoutsDone: 4 },
        ruleFired: 'Steady rate of progress (-0.2kg to -0.6kg) -> Maintain current targets',
        caveat: 'Small weekly adaptations prevent metabolic slowdown.',
      },
    },
  ];

  return { weights, nutrition, workouts, readiness, reviews };
}
