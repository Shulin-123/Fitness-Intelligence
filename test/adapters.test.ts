import { describe, it, expect, beforeEach } from 'vitest';
import { services } from '../src/services/registry';
import type { UserProfile } from '../src/types';

class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
}

if (typeof window === 'undefined' || !window.localStorage) {
  (globalThis as any).localStorage = new LocalStorageMock();
}

describe('LocalAdapter and Service Registry Suite', () => {
  const mockProfile: UserProfile = {
    id: 'test-user-1',
    name: 'Jordan Lee',
    email: 'jordan@test.local',
    age: 29,
    sex: 'female',
    heightCm: 165,
    weightKg: 62,
    targetWeightKg: 58,
    goal: 'lose_fat',
    experience: 'intermediate',
    trainingDaysPerWeek: 4,
    sessionDurationMin: 45,
    activityLevel: 'moderate',
    dietPreference: 'veg',
    allergies: ['Gluten'],
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

  beforeEach(async () => {
    localStorage.clear();
    await services.profile.saveProfile(mockProfile);
  });

  it('verifies profile retrieval and updates', async () => {
    const profile = await services.profile.getProfile();
    expect(profile).not.toBeNull();
    expect(profile?.name).toBe('Jordan Lee');

    const updated = await services.profile.updateProfile({ weightKg: 61.5 });
    expect(updated.weightKg).toBe(61.5);

    const reloaded = await services.profile.getProfile();
    expect(reloaded?.weightKg).toBe(61.5);
  });

  it('generates a valid weekly plan via PlanService', async () => {
    const plan = await services.plan.generateAndSavePlan(mockProfile);
    expect(plan).not.toBeNull();
    expect(plan?.daysPerWeek).toBe(4);
    expect(plan?.days.length).toBe(4);
    expect(plan?.days[0].exercises.length).toBeGreaterThan(0);

    const library = await services.plan.getExerciseLibrary();
    expect(library.length).toBeGreaterThanOrEqual(60);
  });

  it('searches foods and logs nutrition entries', async () => {
    const searchResults = await services.food.searchFoods('roti');
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].name.toLowerCase()).toContain('roti');

    const todayStr = new Date().toISOString().split('T')[0];
    const log = await services.food.logFood(
      {
        mealType: 'lunch',
        name: 'Chapati (Roti)',
        servings: 2,
        totalGrams: 90,
        calories: 208,
        proteinGrams: 6,
        carbGrams: 40,
        fatGrams: 2,
      },
      todayStr
    );

    expect(log.entries.length).toBe(1);
    expect(log.totalCalories).toBe(208);
    expect(log.totalProteinGrams).toBe(6);

    // Delete food
    const entryId = log.entries[0].id;
    const updatedLog = await services.food.deleteFood(entryId, todayStr);
    expect(updatedLog.entries.length).toBe(0);
    expect(updatedLog.totalCalories).toBe(0);
  });

  it('logs and retrieves scale weights with moving average compatibility', async () => {
    await services.weight.logWeight(62.0, '2026-03-01', 'Morning');
    await services.weight.logWeight(61.8, '2026-03-02', 'Morning');

    const history = await services.weight.getWeightHistory();
    expect(history.length).toBe(2);
    expect(history[0].weightKg).toBe(62.0);
    expect(history[1].weightKg).toBe(61.8);
  });

  it('records water intake and increments correctly', async () => {
    const today = new Date().toISOString().split('T')[0];
    const initial = await services.water.getTodayWater(today);
    expect(initial).toBe(0);

    const afterAdd = await services.water.addWater(250, today);
    expect(afterAdd).toBe(250);

    const afterSecondAdd = await services.water.addWater(500, today);
    expect(afterSecondAdd).toBe(750);
  });

  it('processes readiness checkin and applies recommendation', async () => {
    const checkin = await services.readiness.submitReadiness(4, 2, 4);
    expect(checkin.calculatedScore).toBeGreaterThan(0);
    expect(['keep', 'reduce_volume', 'active_recovery']).toContain(checkin.adjustment);

    const latest = await services.readiness.getLatestReadiness();
    expect(latest).not.toBeNull();
    expect(latest?.sleepScore).toBe(4);
  });

  it('handles demo mode isolation correctly', async () => {
    expect(services.auth.isDemoMode()).toBe(false);

    const demoUser = await services.auth.enableDemoMode();
    expect(services.auth.isDemoMode()).toBe(true);
    expect(demoUser.name).toBe('Alex Morgan');

    const demoWeights = await services.weight.getWeightHistory();
    expect(demoWeights.length).toBeGreaterThan(15);

    await services.auth.exitDemoMode();
    expect(services.auth.isDemoMode()).toBe(false);

    // Original profile should be restored under prod namespace
    const originalProfile = await services.profile.getProfile();
    expect(originalProfile?.name).toBe('Jordan Lee');
  });

  it('exports structured JSON data payload', async () => {
    const exportStr = await services.profile.exportData();
    expect(typeof exportStr).toBe('string');
    const parsed = JSON.parse(exportStr);
    expect(parsed.app).toBe('Fitness Intelligence');
    expect(parsed.profile.name).toBe('Jordan Lee');
  });

  it('simulates Food AI photo analysis with structured macronutrient outputs', async () => {
    const dummyBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
    const analysis = await services.ai.analyzeFood(dummyBase64);
    expect(analysis.items.length).toBeGreaterThan(0);
    expect(analysis.items[0].calories).toBeGreaterThan(0);
    expect(analysis.items[0].proteinGrams).toBeGreaterThan(0);
    expect(analysis.notes).toContain('estimate');
  });
});
