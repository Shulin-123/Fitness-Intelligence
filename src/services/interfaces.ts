// Service Interfaces for Fitness Intelligence
// Architecture: Typed ports-and-adapters pattern allowing zero-touch swap to SupabaseAdapter in Phase B.

import type {
  UserProfile,
  SafetyTier,
  SafetyReason,
  Explanation,
  ExplainedValue,
  BMICategory,
  MacroSplit,
  Exercise,
  WeeklyPlan,
  WorkoutDay,
  WorkoutSessionLog,
  FoodItem,
  LoggedFoodEntry,
  DailyNutritionLog,
  FoodAIAnalysisResponse,
  WeightLogEntry,
  ReadinessCheckinData,
  WeeklyReviewReport,
} from '../types';

export interface AssessmentResult {
  bmi: ExplainedValue<BMICategory>;
  bmr: ExplainedValue<number>;
  tdee: ExplainedValue<number>;
  goalCalories: ExplainedValue<number>;
  macros: ExplainedValue<MacroSplit>;
  waterTarget: ExplainedValue<number>;
  safety: {
    tier: SafetyTier;
    reasons: SafetyReason[];
    explanation: Explanation;
  };
}

export interface AuthAccount {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface IAuthService {
  getCurrentUser(): UserProfile | null;
  login(email: string, password?: string, name?: string): Promise<UserProfile>;
  signup(
    profileOrCredentials:
      | { email: string; password?: string; name?: string }
      | Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>,
    password?: string
  ): Promise<UserProfile>;
  logout(): Promise<void>;
  isDemoMode(): boolean;
  enableDemoMode(): Promise<UserProfile>;
  exitDemoMode(): Promise<void>;
}

export interface IProfileService {
  getProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<UserProfile>;
  updateProfile(updates: Partial<UserProfile>): Promise<UserProfile>;
  exportData(): Promise<string>;
  deleteData(): Promise<void>;
}

export interface IAssessmentService {
  calculateAssessment(profile: UserProfile): AssessmentResult;
}

export interface IPlanService {
  getWeeklyPlan(): Promise<WeeklyPlan | null>;
  generateAndSavePlan(profile: UserProfile, safeSplitId?: string): Promise<WeeklyPlan | null>;
  getExerciseLibrary(): Promise<Exercise[]>;
  getExerciseById(id: string): Promise<Exercise | null>;
}

export interface IFoodService {
  searchFoods(query: string, category?: string): Promise<FoodItem[]>;
  getDailyLog(dateStr: string): Promise<DailyNutritionLog>;
  logFood(entry: Omit<LoggedFoodEntry, 'id' | 'loggedAt'>, dateStr?: string): Promise<DailyNutritionLog>;
  updateFood(entryId: string, updates: Partial<LoggedFoodEntry>, dateStr?: string): Promise<DailyNutritionLog>;
  deleteFood(entryId: string, dateStr?: string): Promise<DailyNutritionLog>;
  addCustomFood(item: Omit<FoodItem, 'id'>): Promise<FoodItem>;
  getRecentFoods(limit?: number): Promise<FoodItem[]>;
}

export interface IWorkoutService {
  getTodayWorkout(plan: WeeklyPlan, dayIdx?: number): Promise<WorkoutDay | null>;
  getWorkoutHistory(): Promise<WorkoutSessionLog[]>;
  logWorkoutSession(session: Omit<WorkoutSessionLog, 'id'>): Promise<WorkoutSessionLog>;
}

export interface IWeightService {
  getWeightHistory(): Promise<WeightLogEntry[]>;
  logWeight(weightKg: number, dateStr?: string, notes?: string): Promise<WeightLogEntry>;
}

export interface IWaterService {
  getTodayWater(dateStr?: string): Promise<number>;
  addWater(amountMl: number, dateStr?: string): Promise<number>;
  setWater(amountMl: number, dateStr?: string): Promise<number>;
}

export interface IReadinessService {
  getLatestReadiness(dateStr?: string): Promise<ReadinessCheckinData | null>;
  submitReadiness(sleep: number, soreness: number, energy: number, dateStr?: string): Promise<ReadinessCheckinData>;
}

export interface IWeeklyReviewService {
  getWeeklyReviews(): Promise<WeeklyReviewReport[]>;
  generateCurrentReview(): Promise<WeeklyReviewReport>;
  acceptReviewAdjustment(reviewId: string): Promise<void>;
}

export interface IAIService {
  analyzeFood(base64Image: string, userWeightHint?: string | number): Promise<FoodAIAnalysisResponse>;
}

