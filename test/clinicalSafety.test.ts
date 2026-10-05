import { describe, it, expect } from 'vitest';
import {
  extractMedicalKeywordsFromText,
  evaluateClinicalResearchSafety,
} from '../src/engine/clinicalSafetyResearch';
import { generateSafeSplitOptions, buildPlan } from '../src/engine/rules';
import exercisesSeed from '../src/mocks/exercises.json';
import type { UserProfile, Exercise } from '../src/types';

describe('Clinical Safety & Evidence-Based Research Engine', () => {
  const dummyExercises = exercisesSeed as unknown as Exercise[];

  const createBaseProfile = (overrides?: Partial<UserProfile>): UserProfile => ({
    id: 'test-user-1',
    name: 'Clinical Test User',
    age: 32,
    sex: 'male',
    heightCm: 178,
    weightKg: 80,
    goal: 'build_muscle',
    experience: 'intermediate',
    trainingDaysPerWeek: 3,
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
    ...overrides,
  });

  describe('extractMedicalKeywordsFromText', () => {
    it('detects lumbar spine and disc herniation terminology', () => {
      const sampleMriReport = 'Patient presents with L4-L5 disc bulge causing lumbar pain and mild sciatica.';
      const res = extractMedicalKeywordsFromText(sampleMriReport);

      expect(res.detectedInjuryAreas).toContain('lower_back');
      expect(res.detectedConditions.some((c) => c.toLowerCase().includes('spine'))).toBe(true);
    });

    it('detects knee meniscus and patellar wear', () => {
      const sampleText = 'Right knee lateral meniscus tear noted on diagnostic scan.';
      const res = extractMedicalKeywordsFromText(sampleText);

      expect(res.detectedInjuryAreas).toContain('knee');
      expect(res.detectedConditions.some((c) => c.toLowerCase().includes('knee'))).toBe(true);
    });

    it('detects shoulder impingement and rotator cuff limitations', () => {
      const sampleText = 'Subacromial impingement with supraspinatus rotator cuff tendinopathy.';
      const res = extractMedicalKeywordsFromText(sampleText);

      expect(res.detectedInjuryAreas).toContain('shoulder');
      expect(res.detectedConditions.some((c) => c.toLowerCase().includes('shoulder'))).toBe(true);
    });
  });

  describe('evaluateClinicalResearchSafety', () => {
    it('cross-references CDC and ACSM guidelines when spine limitation is present', () => {
      const profile = createBaseProfile({
        safetyResponses: {
          conditionAffectingExercise: true,
          diagnosedCardiovascularOrBP: false,
          recentSurgery: false,
          injuryOrPain: true,
          injuryAreas: ['lower_back'],
          pregnantOrBreastfeeding: false,
          concerningSymptomsDuringExercise: false,
          medicalConditions: ['Lumbar Spine / Lower Back Limitation'],
        },
      });

      const report = evaluateClinicalResearchSafety(profile);
      expect(report.overallTier).toBe('amber');
      expect(report.findings.length).toBeGreaterThan(0);

      const spineFinding = report.findings.find((f) => f.condition.includes('Lumbar') || f.condition.includes('Spine'));
      expect(spineFinding).toBeDefined();
      expect(spineFinding?.source).toBe('ACSM');
      expect(spineFinding?.contraindications.some((c) => c.includes('Axial') || c.includes('axial') || c.includes('Compressive'))).toBe(true);
      expect(spineFinding?.safeAlternatives.some((a) => a.includes('Leg Press') || a.includes('Chest-Supported'))).toBe(true);
    });

    it('returns green tier for healthy cleared profiles with CDC general baseline', () => {
      const healthyProfile = createBaseProfile();
      const report = evaluateClinicalResearchSafety(healthyProfile);

      expect(report.overallTier).toBe('green');
      expect(report.findings[0].source).toBe('CDC');
      expect(report.findings[0].tierImpact).toBe('green');
    });
  });

  describe('generateSafeSplitOptions & buildPlan', () => {
    it('recommends Spine-Safe Functional Split for users with back limitations', () => {
      const profile = createBaseProfile({
        safetyResponses: {
          conditionAffectingExercise: true,
          diagnosedCardiovascularOrBP: false,
          recentSurgery: false,
          injuryOrPain: true,
          injuryAreas: ['lower_back'],
          pregnantOrBreastfeeding: false,
          concerningSymptomsDuringExercise: false,
          medicalConditions: ['Lumbar Spine / Lower Back Limitation'],
        },
      });

      const splits = generateSafeSplitOptions(profile);
      expect(splits.length).toBe(5);

      const spineSplit = splits.find((s) => s.id === 'spine_safe');
      expect(spineSplit).toBeDefined();
      expect(spineSplit?.isRecommended).toBe(true);
      expect(spineSplit?.rpeCap).toBeLessThanOrEqual(7);
      expect(spineSplit?.highlightedSubstitutions.length).toBeGreaterThan(0);
    });

    it('builds plan with safe substitutions when spine_safe split is selected', () => {
      const profile = createBaseProfile({
        selectedSafeSplitId: 'spine_safe',
        safetyResponses: {
          conditionAffectingExercise: true,
          diagnosedCardiovascularOrBP: false,
          recentSurgery: false,
          injuryOrPain: true,
          injuryAreas: ['lower_back'],
          pregnantOrBreastfeeding: false,
          concerningSymptomsDuringExercise: false,
        },
      });

      const plan = buildPlan(profile, 'amber', dummyExercises, 'spine_safe');
      expect(plan).not.toBeNull();
      expect(plan?.safeSplitId).toBe('spine_safe');
      expect(plan?.rpeCap).toBeLessThanOrEqual(7);

      // Verify no exercise with lower_back contraindication was kept un-substituted
      const allExercises = plan!.days.flatMap((d) => d.exercises);
      const substitutedLowerBack = allExercises.filter(
        (e) => e.exercise.contraindicationTags.includes('lower_back') && !e.isSubstituted
      );
      expect(substitutedLowerBack.length).toBe(0);
    });
  });
});
