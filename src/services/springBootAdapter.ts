// Spring Boot Integrated Adapter for Fitness Intelligence
// Wraps local storage with real-time Spring Boot REST persistence and physiological engine sync.

import type {
  IProfileService,
  IWorkoutService,
  IFoodService,
  IReadinessService,
  IAssessmentService,
  AssessmentResult,
} from './interfaces';
import type {
  UserProfile,
  WeeklyPlan,
  WorkoutDay,
  WorkoutSessionLog,
  FoodItem,
  LoggedFoodEntry,
  DailyNutritionLog,
  ReadinessCheckinData,
} from '../types';
import {
  LocalProfileService,
  LocalWorkoutService,
  LocalFoodService,
  LocalReadinessService,
  LocalAssessmentService,
} from './localAdapter';
import {
  syncUserWithBackend,
  logWorkoutWithBackend,
  logNutritionWithBackend,
  logReadinessWithBackend,
} from './springBootApi';

export class SpringBootProfileService implements IProfileService {
  private local = new LocalProfileService();

  async getProfile(): Promise<UserProfile | null> {
    return this.local.getProfile();
  }

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    const saved = await this.local.saveProfile(profile);
    // Asynchronously sync with Spring Boot backend
    syncUserWithBackend(saved).catch((err) => {
      console.warn('[SpringBoot] Async profile sync notice:', err);
    });
    return saved;
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const updated = await this.local.updateProfile(updates);
    syncUserWithBackend(updated).catch((err) => {
      console.warn('[SpringBoot] Async profile update notice:', err);
    });
    return updated;
  }

  async exportData(): Promise<string> {
    return this.local.exportData();
  }

  async deleteData(): Promise<void> {
    return this.local.deleteData();
  }
}

export class SpringBootWorkoutService implements IWorkoutService {
  private local = new LocalWorkoutService();

  async getTodayWorkout(plan: WeeklyPlan, dayIdx?: number): Promise<WorkoutDay | null> {
    return this.local.getTodayWorkout(plan, dayIdx);
  }

  async getWorkoutHistory(): Promise<WorkoutSessionLog[]> {
    return this.local.getWorkoutHistory();
  }

  async logWorkoutSession(session: Omit<WorkoutSessionLog, 'id'>): Promise<WorkoutSessionLog> {
    const logged = await this.local.logWorkoutSession(session);
    // Asynchronously log to Spring Boot backend
    logWorkoutWithBackend(logged).catch((err) => {
      console.warn('[SpringBoot] Async workout log notice:', err);
    });
    return logged;
  }
}

export class SpringBootFoodService implements IFoodService {
  private local = new LocalFoodService();

  async searchFoods(query: string, category?: string): Promise<FoodItem[]> {
    return this.local.searchFoods(query, category);
  }

  async getDailyLog(dateStr: string): Promise<DailyNutritionLog> {
    return this.local.getDailyLog(dateStr);
  }

  async logFood(entry: Omit<LoggedFoodEntry, 'id' | 'loggedAt'>, dateStr?: string): Promise<DailyNutritionLog> {
    const log = await this.local.logFood(entry, dateStr);
    logNutritionWithBackend(log).catch((err) => {
      console.warn('[SpringBoot] Async nutrition log notice:', err);
    });
    return log;
  }

  async updateFood(entryId: string, updates: Partial<LoggedFoodEntry>, dateStr?: string): Promise<DailyNutritionLog> {
    const log = await this.local.updateFood(entryId, updates, dateStr);
    logNutritionWithBackend(log).catch((err) => {
      console.warn('[SpringBoot] Async nutrition update notice:', err);
    });
    return log;
  }

  async deleteFood(entryId: string, dateStr?: string): Promise<DailyNutritionLog> {
    const log = await this.local.deleteFood(entryId, dateStr);
    logNutritionWithBackend(log).catch((err) => {
      console.warn('[SpringBoot] Async nutrition delete notice:', err);
    });
    return log;
  }

  async addCustomFood(item: Omit<FoodItem, 'id'>): Promise<FoodItem> {
    return this.local.addCustomFood(item);
  }

  async getRecentFoods(limit?: number): Promise<FoodItem[]> {
    return this.local.getRecentFoods(limit);
  }
}

export class SpringBootReadinessService implements IReadinessService {
  private local = new LocalReadinessService();

  async getLatestReadiness(dateStr?: string): Promise<ReadinessCheckinData | null> {
    return this.local.getLatestReadiness(dateStr);
  }

  async submitReadiness(sleep: number, soreness: number, energy: number, dateStr?: string): Promise<ReadinessCheckinData> {
    const result = await this.local.submitReadiness(sleep, soreness, energy, dateStr);
    logReadinessWithBackend(result).catch((err) => {
      console.warn('[SpringBoot] Async readiness submit notice:', err);
    });
    return result;
  }
}

export class SpringBootAssessmentService implements IAssessmentService {
  private local = new LocalAssessmentService();

  calculateAssessment(profile: UserProfile): AssessmentResult {
    return this.local.calculateAssessment(profile);
  }
}
