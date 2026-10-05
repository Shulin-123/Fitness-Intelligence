// Types for Fitness Intelligence

export type Goal = 'build_muscle' | 'lose_fat' | 'maintain' | 'get_fitter';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';
export type DietPreference = 'veg' | 'non_veg' | 'vegan' | 'other';
export type Sex = 'male' | 'female' | 'unspecified';
export type UnitSystem = 'metric' | 'imperial';

export type SafetyTier = 'green' | 'amber' | 'red';

export interface SafetyReason {
  tier: SafetyTier;
  code: string;
  message: string;
  detail?: string;
}

export interface MedicalReportData {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  notes?: string;
  detectedKeywords?: string[];
  summarySnippet?: string;
}

export interface ClinicalResearchFinding {
  source: 'CDC' | 'PAR-Q+' | 'ACSM' | 'Evidence-Based Consensus';
  citationTitle: string;
  citationUrl: string;
  condition: string;
  recommendation: string;
  contraindications: string[];
  safeAlternatives: string[];
  tierImpact: SafetyTier;
}

export interface SafeSplitOption {
  id: string;
  name: string;
  category: 'spine_safe' | 'joint_friendly' | 'cardio_metabolic' | 'mobility_foundation' | 'standard_progressive';
  badgeLabel: string;
  description: string;
  recommendedFor: string[];
  weeklyDays: number;
  rpeCap: number;
  highlightedSubstitutions: { original: string; safeReplacement: string; reason: string }[];
  dayTemplates: string[];
  isRecommended: boolean;
}

export interface SafetyScreenResponses {
  conditionAffectingExercise: boolean;
  diagnosedCardiovascularOrBP: boolean;
  recentSurgery: boolean;
  recentSurgeryCleared?: boolean;
  recentSurgeryDate?: string;
  injuryOrPain: boolean;
  injuryAreas?: ('knee' | 'shoulder' | 'lower_back' | 'wrist' | 'ankle' | 'neck')[];
  pregnantOrBreastfeeding: boolean;
  concerningSymptomsDuringExercise: boolean; // chest pain, fainting, severe breathlessness -> RED
  medicalConditions?: string[];
  medicalConditionNotes?: string;
  uploadedReport?: MedicalReportData;
  clinicalFindings?: ClinicalResearchFinding[];
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number;
  goal: Goal;
  experience: ExperienceLevel;
  trainingDaysPerWeek: number; // 2 to 6
  sessionDurationMin: 30 | 45 | 60 | 90;
  activityLevel: ActivityLevel;
  dietPreference: DietPreference;
  allergies: string[];
  foodExclusions: string[];
  units: UnitSystem;
  safetyResponses: SafetyScreenResponses;
  selectedSafeSplitId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Explanation {
  formula: string;
  inputs: Record<string, string | number | boolean | string[] | undefined | null>;
  ruleFired: string;
  caveat: string;
}

export interface ExplainedValue<T> {
  value: T;
  explanation: Explanation;
}

export interface BMICategory {
  bmi: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  label: string;
}

export interface MacroSplit {
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  proteinPercentage: number;
  carbPercentage: number;
  fatPercentage: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'full_body';
  equipment: 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'kettlebell';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  contraindicationTags: ('knee' | 'shoulder' | 'lower_back' | 'wrist' | 'neck')[];
  alternativeExerciseId?: string;
  shortCueText: string;
  videoAnalysisSupported?: 'squat' | 'push_up' | 'biceps_curl';
}

export interface PlannedSet {
  setNumber: number;
  targetReps: string; // e.g. "8-10" or "10-12"
  targetRpe: number; // e.g. 7, 8
  restSeconds: number;
}

export interface PlannedExercise {
  exerciseId: string;
  exercise: Exercise;
  sets: PlannedSet[];
  notes?: string;
  isSubstituted?: boolean;
  originalExerciseName?: string;
}

export interface WorkoutDay {
  dayNumber: number;
  title: string; // e.g. "Upper Body A", "Full Body A"
  targetDurationMin: number;
  focusMuscles: string[];
  exercises: PlannedExercise[];
  isRestDay: boolean;
}

export interface WeeklyPlan {
  splitName: string;
  splitDescription: string;
  daysPerWeek: number;
  days: WorkoutDay[];
  volumeTier: 'standard' | 'amber_reduced' | 'none';
  rpeCap: number;
  safeSplitId?: string;
  availableSafeSplits?: SafeSplitOption[];
  explanation: Explanation;
}

export type ReadinessAdjustmentType = 'keep' | 'reduce_volume' | 'active_recovery';

export interface ReadinessCheckinData {
  id: string;
  date: string;
  sleepScore: number; // 1 to 5
  sorenessScore: number; // 1 (none) to 5 (extreme)
  energyScore: number; // 1 to 5
  calculatedScore: number; // 0 to 100
  adjustment: ReadinessAdjustmentType;
  explanation: Explanation;
}

export interface LoggedSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe?: number;
  completed: boolean;
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: LoggedSet[];
}

export interface WorkoutSessionLog {
  id: string;
  date: string;
  planDayTitle: string;
  durationMinutes: number;
  readinessAdjustmentApplied?: ReadinessAdjustmentType;
  exercises: LoggedExercise[];
  completed: boolean;
  notes?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: 'staple' | 'protein' | 'dairy' | 'vegetable' | 'fruit' | 'snack' | 'meal';
  servingUnit: string; // e.g., "1 bowl (150g)", "1 medium (120g)", "1 roti (45g)"
  servingGrams: number;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  isIndianStaple?: boolean;
  tags?: string[];
}

export interface LoggedFoodEntry {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  foodId?: string;
  name: string;
  servings: number;
  totalGrams: number;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  loggedAt: string;
}

export interface DailyNutritionLog {
  date: string;
  entries: LoggedFoodEntry[];
  totalCalories: number;
  totalProteinGrams: number;
  totalCarbGrams: number;
  totalFatGrams: number;
  waterMl: number;
}

export interface FoodAIItemEstimate {
  name: string;
  estimated_grams: number;
  confidence: number; // 0 to 1
  matched_food_id?: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  leucineGrams?: number;
}

export interface FoodAIAnalysisResponse {
  items: FoodAIItemEstimate[];
  overall_confidence: number;
  notes: string;
  isDemo: boolean;
  micronutrientHighlights?: string[];
  glycemicImpact?: string;
  mpsThresholdMet?: boolean;
}

export interface WeightLogEntry {
  id: string;
  date: string;
  weightKg: number;
  notes?: string;
}

export interface WeeklyReviewReport {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  avgWeightKg: number;
  weightTrendDeltaKg: number; // e.g. -0.4kg
  adherencePercentage: number;
  workoutsCompleted: number;
  workoutsTarget: number;
  insight: string;
  suggestedAdjustmentKcal: number; // e.g. -100 or 0 or +100
  accepted: boolean;
  appliedDate?: string;
  explanation: Explanation;
}

export interface FormCheckerFlag {
  id: string;
  ruleCode: string;
  message: string;
  timestampSeconds?: number;
  repNumber?: number;
  severity: 'warning' | 'info';
}

export interface FormCheckSummary {
  id: string;
  exerciseType: 'squat' | 'push_up' | 'biceps_curl';
  totalReps: number;
  flags: FormCheckerFlag[]; // max 3
  analyzedAt: string;
  durationSeconds: number;
}
