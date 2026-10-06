// Spring Boot REST Client for Fitness Intelligence
// Connects React frontend directly to the Spring Boot backend running at http://localhost:8080/api

import type { UserProfile, WorkoutSessionLog, DailyNutritionLog, ReadinessCheckinData } from '../types';

export function getBackendUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    const custom = localStorage.getItem('custom_spring_boot_api_url');
    if (custom && custom.trim().length > 0) {
      return custom.trim().replace(/\/$/, '');
    }

    const envUrl = (import.meta as any).env?.VITE_SPRING_BOOT_API_URL;
    if (envUrl) return envUrl.replace(/\/$/, '');

    const hostname = window.location.hostname;
    // Local development or LAN IP access over HTTP
    if (
      hostname &&
      hostname !== 'localhost' &&
      hostname !== '127.0.0.1' &&
      !hostname.includes('github.io') &&
      window.location.protocol === 'http:'
    ) {
      return `http://${hostname}:8080/api`;
    }

    // Hosted on GitHub Pages: default to public live cloud/tunnel URL
    if (hostname.includes('github.io') || window.location.protocol === 'https:') {
      return 'https://keno-geography-inclusive-bread.trycloudflare.com/api';
    }
  }
  return (import.meta as any).env?.VITE_SPRING_BOOT_API_URL || 'http://localhost:8080/api';
}

export function setCustomBackendUrl(url: string | null): void {
  if (typeof window !== 'undefined') {
    if (!url || url.trim().length === 0) {
      localStorage.removeItem('custom_spring_boot_api_url');
    } else {
      let cleaned = url.trim().replace(/\/$/, '');
      if (!cleaned.endsWith('/api') && !cleaned.includes('/api/')) {
        cleaned = `${cleaned}/api`;
      }
      localStorage.setItem('custom_spring_boot_api_url', cleaned);
    }
  }
}

export const BACKEND_URL = getBackendUrl();

export interface BackendHealthStatus {
  connected: boolean;
  status: string;
  latencyMs: number;
  timestamp: string;
  error?: string;
}

/**
 * Pings the Spring Boot /api/health endpoint to evaluate backend connectivity & latency.
 */
export async function pingBackendHealth(): Promise<BackendHealthStatus> {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - start);

    if (res.ok) {
      const data = await res.json();
      return {
        connected: true,
        status: data.status || 'UP',
        latencyMs,
        timestamp: new Date().toISOString(),
      };
    }
    return {
      connected: false,
      status: 'DOWN',
      latencyMs,
      timestamp: new Date().toISOString(),
      error: `HTTP ${res.status}`,
    };
  } catch (err: any) {
    return {
      connected: false,
      status: 'UNREACHABLE',
      latencyMs: Math.round(performance.now() - start),
      timestamp: new Date().toISOString(),
      error: err?.message || 'Connection refused',
    };
  }
}

/**
 * Syncs user profile with Spring Boot backend (H2 / JPA).
 */
export async function syncUserWithBackend(profile: UserProfile): Promise<any> {
  try {
    const body = {
      email: profile.email || 'alex.morgan@demo.fitness',
      name: profile.name || 'Alex Morgan',
      age: profile.age,
      sex: profile.sex,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      goal: profile.goal,
      experience: profile.experience,
      trainingDaysPerWeek: profile.trainingDaysPerWeek,
      sessionDurationMin: profile.sessionDurationMin,
      activityLevel: profile.activityLevel,
      dietPreference: profile.dietPreference,
    };

    const res = await fetch(`${BACKEND_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[SpringBoot] User sync fallback to local:', err);
  }
  return null;
}

/**
 * Logs a completed workout session into Spring Boot database.
 */
export async function logWorkoutWithBackend(session: WorkoutSessionLog): Promise<any> {
  try {
    const firstSet = session.exercises?.[0]?.sets?.[0];
    const body = {
      userId: 1, // Default to primary user
      sessionDate: session.date || new Date().toISOString().slice(0, 10),
      splitName: session.planDayTitle || 'Workout Session',
      durationMinutes: session.durationMinutes || 45,
      overallRpe: firstSet?.rpe || 8.0,
      notes: session.notes || '',
      completed: session.completed ?? true,
      exercises: (session.exercises || []).map((ex) => {
        const primarySet = ex.sets?.[0] || { weightKg: 50, reps: 8, rpe: 8 };
        return {
          exerciseName: ex.exerciseName,
          setsCompleted: ex.sets?.length || 3,
          repsCompleted: primarySet.reps || 8,
          weightKg: primarySet.weightKg || 50.0,
          targetRir: 10 - (primarySet.rpe || 8),
          notes: '',
        };
      }),
    };

    const res = await fetch(`${BACKEND_URL}/workouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[SpringBoot] Workout log fallback to local:', err);
  }
  return null;
}

/**
 * Logs daily nutrition (calories, macros, hydration) to Spring Boot.
 */
export async function logNutritionWithBackend(log: DailyNutritionLog): Promise<any> {
  try {
    const body = {
      userId: 1,
      logDate: log.date || new Date().toISOString().slice(0, 10),
      calories: Math.round(log.totalCalories || 2400),
      proteinGrams: Math.round((log.totalProteinGrams || 160) * 10) / 10,
      carbsGrams: Math.round((log.totalCarbGrams || 275) * 10) / 10,
      fatsGrams: Math.round((log.totalFatGrams || 70) * 10) / 10,
      waterMl: log.waterMl || 3000,
    };

    const res = await fetch(`${BACKEND_URL}/nutrition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[SpringBoot] Nutrition log fallback to local:', err);
  }
  return null;
}

/**
 * Logs readiness checkin to Spring Boot.
 */
export async function logReadinessWithBackend(data: ReadinessCheckinData): Promise<any> {
  try {
    const body = {
      userId: 1,
      checkinDate: data.date || new Date().toISOString().slice(0, 10),
      sleepQuality: Math.round(data.sleepScore * 2),      // Scale 1-5 to 1-10
      muscleSoreness: Math.round(data.sorenessScore * 2), // Scale 1-5 to 1-10
      stressLevel: 3,                                    // Moderate baseline
      energyLevel: Math.round(data.energyScore * 2),      // Scale 1-5 to 1-10
    };

    const res = await fetch(`${BACKEND_URL}/readiness`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[SpringBoot] Readiness log fallback to local:', err);
  }
  return null;
}

/**
 * Executes server-side Biomechanics engine assessment via Spring Boot.
 */
export async function calculateBiomechanicsWithBackend(profile: UserProfile): Promise<any> {
  try {
    const body = {
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      age: profile.age,
      sex: profile.sex,
      goal: profile.goal,
      activityLevel: profile.activityLevel,
    };

    const res = await fetch(`${BACKEND_URL}/engine/calculate-assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[SpringBoot] Biomechanics calculation fallback to local rules:', err);
  }
  return null;
}

export const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

/**
 * Queries the Spring Boot AI Coach service (/api/ai/chat), with multimodal vision and direct Gemini fallback.
 */
export async function queryAICoachWithBackend(
  prompt: string,
  imageBase64?: string,
  mimeType = 'image/jpeg'
): Promise<{
  answer: string;
  sourceTags: string[];
  followUps: string[];
} | null> {
  // 1. Try Spring Boot Backend First (20s timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(`${BACKEND_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, imageBase64, mimeType }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.answer) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[AI] Backend chat unavailable, trying direct Gemini fallback:', err);
  }

  // 2. Direct Gemini Fallback (if backend is offline or slow)
  if (GEMINI_API_KEY) {
    try {
      const parts: any[] = [{ text: prompt }];

      if (imageBase64) {
        let cleanBase64 = imageBase64;
        if (cleanBase64.includes(',')) {
          cleanBase64 = cleanBase64.substring(cleanBase64.indexOf(',') + 1);
        }
        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: cleanBase64,
          },
        });
      }

      const systemText =
        'You are the Fitness Intelligence AI Coach, a world-class exercise physiologist, biomechanics expert, and sports scientist. Ground every answer in published sports science (NSCA, ISSN, WHO, ACSM). Be concise, direct, and structured with Markdown headers and bullet points. Include exact numbers (percentages, sets/reps, grams per kg) where applicable. CRITICAL: When the user specifies an exact food portion weight (e.g. 90 gm, 90g, 150g), YOU MUST calculate all calories and macronutrients strictly for that exact weight using standard USDA Atwater 4-4-9 factors (never approximate with visual guesses or generic serving sizes).';

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemText }] },
            contents: [{ role: 'user', parts }],
          }),
        }
      );

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            answer: text.trim(),
            sourceTags: imageBase64
              ? ['Google Gemini Multimodal Vision', 'NSCA Biomechanics', 'ISSN Nutrition']
              : ['Google Gemini 3.5 Flash', 'NSCA Biomechanics', 'ISSN Sports Science'],
            followUps: imageBase64
              ? [
                  'What corrective cues fix this position?',
                  'Can you suggest alternative exercises?',
                  'What are the macro targets for this meal?',
                ]
              : [
                  'Can you break down the exact sets and reps?',
                  'What accessories target this muscle best?',
                  'How many days between training sessions?',
                ],
          };
        }
      }
    } catch (err) {
      console.warn('[AI] Direct Gemini fallback failed:', err);
    }
  }

  return null;
}

