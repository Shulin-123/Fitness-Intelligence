// Service Registry & Dependency Injection Container
//
// In Phase A: All services instantiate LocalAdapter (pure localStorage & client rules engine).
// In Phase B: Replace these constructors with SupabaseAuthService, SupabasePlanService, etc.
// The UI layer strictly imports `services` from this registry, guaranteeing zero UI changes when switching backends.

import {
  LocalAuthService,
  LocalPlanService,
  LocalWeightService,
  LocalWaterService,
  LocalWeeklyReviewService,
  LocalAIService,
} from './localAdapter';

import type {
  IAuthService,
  IProfileService,
  IAssessmentService,
  IPlanService,
  IFoodService,
  IWorkoutService,
  IWeightService,
  IWaterService,
  IReadinessService,
  IWeeklyReviewService,
  IAIService,
} from './interfaces';

export interface ServiceContainer {
  auth: IAuthService;
  profile: IProfileService;
  assessment: IAssessmentService;
  plan: IPlanService;
  food: IFoodService;
  workout: IWorkoutService;
  weight: IWeightService;
  water: IWaterService;
  readiness: IReadinessService;
  weeklyReview: IWeeklyReviewService;
  ai: IAIService;
}

/* =========================================================================
   ADAPTER SWITCHBOARD (PHASE B HOOK)
   To swap to Supabase or custom REST/GraphQL backend:
   1. Implement the interfaces defined in /src/services/interfaces.ts
   2. Instantiate the remote adapters below instead of the Local* classes
   ========================================================================= */

import {
  SpringBootProfileService,
  SpringBootWorkoutService,
  SpringBootFoodService,
  SpringBootReadinessService,
  SpringBootAssessmentService,
} from './springBootAdapter';

export const services: ServiceContainer = {
  auth: new LocalAuthService(),
  profile: new SpringBootProfileService(),
  assessment: new SpringBootAssessmentService(),
  plan: new LocalPlanService(),
  food: new SpringBootFoodService(),
  workout: new SpringBootWorkoutService(),
  weight: new LocalWeightService(),
  water: new LocalWaterService(),
  readiness: new SpringBootReadinessService(),
  weeklyReview: new LocalWeeklyReviewService(),
  ai: new LocalAIService(),
};

export * from './interfaces';
