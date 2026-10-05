// Evidence-Based Clinical Safety & Exercise Research Engine
// Grounded strictly in vetted public health authorities:
// 1. CDC Guidelines for Chronic Health Conditions & Disabilities
// 2. PAR-Q+ (Physical Activity Readiness Questionnaire) Screening Protocol
// 3. ACSM (American College of Sports Medicine) Exercise Prescription & Contraindication Matrix

import type { SafetyTier, ClinicalResearchFinding, UserProfile } from '../types';

export interface ClinicalSafetyReport {
  overallTier: SafetyTier;
  findings: ClinicalResearchFinding[];
  contraindications: string[];
  safeSubstitutions: {
    original: string;
    safeReplacement: string;
    reason: string;
  }[];
  clinicalCaveat: string;
}

export const VETTED_RESEARCH_RESOURCES = {
  CDC_CHRONIC_CONDITIONS: {
    title: 'CDC Guidelines: Physical Activity for Chronic Conditions and Disabilities',
    url: 'https://www.cdc.gov/physical-activity-basics/guidelines/chronic-health-conditions-and-disabilities.html',
  },
  PARQ_PLUS: {
    title: 'PAR-Q+ (Physical Activity Readiness Questionnaire for Everyone)',
    url: 'https://eparmedx.com/',
  },
  ACSM_CONTRAINDICATIONS: {
    title: 'ACSM Guidelines for Exercise Testing and Prescription (11th Ed.)',
    url: 'https://www.acsm.org/education-resources/books/guidelines-exercise-testing-prescription',
  },
};

/**
 * Extracts and maps medical keywords from user notes or uploaded medical reports.
 */
export function extractMedicalKeywordsFromText(rawText: string): {
  detectedConditions: string[];
  detectedInjuryAreas: ('knee' | 'shoulder' | 'lower_back' | 'wrist' | 'ankle' | 'neck')[];
  suggestedNotes: string;
} {
  const text = rawText.toLowerCase();
  const detectedConditions: string[] = [];
  const detectedInjuryAreas: ('knee' | 'shoulder' | 'lower_back' | 'wrist' | 'ankle' | 'neck')[] = [];

  // Lower Back & Spine Keywords
  if (
    text.includes('l4') ||
    text.includes('l5') ||
    text.includes('s1') ||
    text.includes('herniat') ||
    text.includes('sciatica') ||
    text.includes('bulge') ||
    text.includes('disc') ||
    text.includes('lumbar') ||
    text.includes('lower back') ||
    text.includes('spondyl')
  ) {
    detectedConditions.push('Lumbar Spine / Lower Back Limitation');
    if (!detectedInjuryAreas.includes('lower_back')) detectedInjuryAreas.push('lower_back');
  }

  // Knee Keywords
  if (
    text.includes('knee') ||
    text.includes('patell') ||
    text.includes('meniscus') ||
    text.includes('acl') ||
    text.includes('mcl') ||
    text.includes('chondromalacia') ||
    text.includes('runner')
  ) {
    detectedConditions.push('Knee / Patellofemoral Joint Limitation');
    if (!detectedInjuryAreas.includes('knee')) detectedInjuryAreas.push('knee');
  }

  // Shoulder Keywords
  if (
    text.includes('shoulder') ||
    text.includes('rotator cuff') ||
    text.includes('impingement') ||
    text.includes('bursitis') ||
    text.includes('labrum') ||
    text.includes('acromio')
  ) {
    detectedConditions.push('Shoulder / Rotator Cuff Impingement');
    if (!detectedInjuryAreas.includes('shoulder')) detectedInjuryAreas.push('shoulder');
  }

  // Cardiovascular & Hypertension Keywords
  if (
    text.includes('hypertens') ||
    text.includes('blood pressure') ||
    text.includes('high bp') ||
    text.includes('cardio') ||
    text.includes('arrhythmia') ||
    text.includes('heart')
  ) {
    detectedConditions.push('Cardiovascular / Elevated Blood Pressure');
  }

  // Respiratory Keywords
  if (
    text.includes('asthma') ||
    text.includes('copd') ||
    text.includes('wheez') ||
    text.includes('bronch') ||
    text.includes('respiratory')
  ) {
    detectedConditions.push('Respiratory / Asthmatic Consideration');
  }

  // Joint / Arthritis Keywords
  if (text.includes('arthrit') || text.includes('osteo') || text.includes('rheumat')) {
    detectedConditions.push('Joint Arthropathy / Degenerative Changes');
  }

  // Recent Surgery
  if (text.includes('post-op') || text.includes('surgery') || text.includes('reconstruct') || text.includes('arthroscop')) {
    detectedConditions.push('Post-Operative Recovery Phase');
  }

  return {
    detectedConditions,
    detectedInjuryAreas,
    suggestedNotes: detectedConditions.length > 0 ? `Identified clinical markers: ${detectedConditions.join(', ')}` : '',
  };
}

/**
 * Evaluates user profile and medical uploads against CDC, PAR-Q+, and ACSM guidelines.
 */
export function evaluateClinicalResearchSafety(profile: UserProfile): ClinicalSafetyReport {
  const safety = profile.safetyResponses;
  const findings: ClinicalResearchFinding[] = [];
  const contraindications: string[] = [];
  const safeSubstitutions: { original: string; safeReplacement: string; reason: string }[] = [];
  let overallTier: SafetyTier = 'green';

  // 1. RED TIER CHECK (PAR-Q+ & ACSM Red Flags)
  if (safety.concerningSymptomsDuringExercise) {
    overallTier = 'red';
    findings.push({
      source: 'PAR-Q+',
      citationTitle: VETTED_RESEARCH_RESOURCES.PARQ_PLUS.title,
      citationUrl: VETTED_RESEARCH_RESOURCES.PARQ_PLUS.url,
      condition: 'Acute Exertional Symptoms (Chest Discomfort, Dizziness, Fainting)',
      recommendation:
        'Immediate physician clearance mandated prior to any automated physical activity.',
      contraindications: ['All unsupervised resistance and cardiovascular training'],
      safeAlternatives: ['Clinical stress testing under supervision', 'Medical checkup'],
      tierImpact: 'red',
    });
    contraindications.push('High-intensity exercise of any kind');
  }

  if (safety.recentSurgery && safety.recentSurgeryCleared === false) {
    overallTier = 'red';
    findings.push({
      source: 'ACSM',
      citationTitle: VETTED_RESEARCH_RESOURCES.ACSM_CONTRAINDICATIONS.title,
      citationUrl: VETTED_RESEARCH_RESOURCES.ACSM_CONTRAINDICATIONS.url,
      condition: 'Recent Uncleared Surgical Procedure',
      recommendation:
        'Surgical site healing requires formal post-operative clinical release from the operating surgeon.',
      contraindications: ['Mechanical load on healing tissue', 'Systemic straining'],
      safeAlternatives: ['Physical therapy prescribed rehabilitation movements'],
      tierImpact: 'red',
    });
    contraindications.push('Resistance training pending surgeon clearance');
  }

  if (overallTier === 'red') {
    return {
      overallTier: 'red',
      findings,
      contraindications,
      safeSubstitutions,
      clinicalCaveat:
        'PAR-Q+ clinical protocol directs you to consult a licensed medical provider before beginning or continuing exercise.',
    };
  }

  // 2. AMBER TIER CHECKS (CDC, PAR-Q+, and ACSM Specific Modifications)
  const injuryAreas = safety.injuryAreas || [];
  const conditions = safety.medicalConditions || [];

  // Lower Back / Spine
  const hasSpineIssue =
    injuryAreas.includes('lower_back') ||
    conditions.some((c) => c.toLowerCase().includes('spine') || c.toLowerCase().includes('back') || c.toLowerCase().includes('disc'));

  if (hasSpineIssue) {
    overallTier = 'amber';
    findings.push({
      source: 'ACSM',
      citationTitle: VETTED_RESEARCH_RESOURCES.ACSM_CONTRAINDICATIONS.title,
      citationUrl: VETTED_RESEARCH_RESOURCES.ACSM_CONTRAINDICATIONS.url,
      condition: 'Lumbar Spine / Lower Back Mechanical Vulnerability',
      recommendation:
        'Per ACSM guidelines for spinal mechanics: eliminate direct vertical compressive axial loading on the spine. Substitute with chest-supported pulling and horizontal loading.',
      contraindications: [
        'Barbell Back Squats (compressive spinal axial load)',
        'Standing Barbell Overhead Military Press',
        'Conventional Floor Deadlifts',
        'Standing Bent-Over Barbell Rows',
      ],
      safeAlternatives: [
        'Chest-Supported Dumbbell / Machine Rows',
        'Seated Incline Dumbbell Bench Press',
        'Leg Press with Neutral Sacral Alignment',
        'Barbell / Dumbbell Hip Thrust (pure glute hinge with zero axial spine load)',
        'McGill Big 3 Core Bracing (Bird-Dog, Side Plank, Modified Curl-Up)',
      ],
      tierImpact: 'amber',
    });
    contraindications.push(
      'Heavy axial spinal loading (>60% 1RM compression)',
      'Loaded lumbar flexion under spinal shear'
    );
    safeSubstitutions.push(
      {
        original: 'Barbell Back Squat',
        safeReplacement: 'Seated Leg Press / Supported Goblet Squat',
        reason: 'Eliminates compressive spinal column load while maintaining quadricep hypertrophy',
      },
      {
        original: 'Standing Barbell Overhead Press',
        safeReplacement: 'Seated Incline Neutral-Grip Dumbbell Press',
        reason: 'Back pad provides thoracic stabilization and removes lumbar hyperextension stress',
      },
      {
        original: 'Bent-Over Barbell Row',
        safeReplacement: 'Chest-Supported Machine / Incline Bench Row',
        reason: 'Isolates lats and rhomboids with zero erector spinae shear stress',
      }
    );
  }

  // Knee / Patellofemoral
  const hasKneeIssue =
    injuryAreas.includes('knee') ||
    conditions.some((c) => c.toLowerCase().includes('knee') || c.toLowerCase().includes('meniscus') || c.toLowerCase().includes('patell'));

  if (hasKneeIssue) {
    overallTier = 'amber';
    findings.push({
      source: 'CDC',
      citationTitle: VETTED_RESEARCH_RESOURCES.CDC_CHRONIC_CONDITIONS.title,
      citationUrl: VETTED_RESEARCH_RESOURCES.CDC_CHRONIC_CONDITIONS.url,
      condition: 'Knee Joint / Patellofemoral Shear Stress',
      recommendation:
        'CDC arthritis & joint safety guidance recommends low-impact, non-ballistic resistance with controlled eccentric tempo and restricted peak knee flexion angles.',
      contraindications: [
        'Deep Knee Flexion >100° under heavy load',
        'High-Impact Plyometric Box Jumps / Jump Squats',
        'Walking Barbell Lunges with forward knee tracking',
      ],
      safeAlternatives: [
        'Seated Leg Press (controlled 90° depth buffer)',
        'Romanian Deadlift (posterior chain hip hinge; minimal anterior knee shear)',
        'Seated Hamstring Leg Curls',
        'Stationary Low-Impact Cycling / Glute Bridges',
      ],
      tierImpact: 'amber',
    });
    contraindications.push(
      'Ballistic knee deceleration and deep joint shear >100° flexion',
      'High-impact jumping'
    );
    safeSubstitutions.push(
      {
        original: 'Walking Lunges',
        safeReplacement: 'Romanian Deadlift (Hinge Focus)',
        reason: 'Target posterior chain with zero patellofemoral impact force',
      },
      {
        original: 'Deep Barbell Squat',
        safeReplacement: 'Horizontal Leg Press (90° Knee Buffer)',
        reason: 'Provides stable footplate support and eliminates balance deceleration shear',
      }
    );
  }

  // Shoulder / Impingement
  const hasShoulderIssue =
    injuryAreas.includes('shoulder') ||
    conditions.some((c) => c.toLowerCase().includes('shoulder') || c.toLowerCase().includes('rotator') || c.toLowerCase().includes('imping'));

  if (hasShoulderIssue) {
    overallTier = 'amber';
    findings.push({
      source: 'ACSM',
      citationTitle: VETTED_RESEARCH_RESOURCES.ACSM_CONTRAINDICATIONS.title,
      citationUrl: VETTED_RESEARCH_RESOURCES.ACSM_CONTRAINDICATIONS.url,
      condition: 'Shoulder Subacromial Impingement / Rotator Cuff Vulnerability',
      recommendation:
        'Per ACSM guidelines: keep humerus in the scapular plane (~30° forward), avoid full internal rotation during abduction, and substitute flaring movements.',
      contraindications: [
        'Behind-The-Neck Presses and Pulldowns',
        'Upright Barbell Rows (extreme internal rotation)',
        'Flat Barbell Bench Press with 90° elbow flare',
      ],
      safeAlternatives: [
        'Neutral-Grip Dumbbell Bench Press (tucked 45° elbows)',
        'Cable Face Pulls with external rotation',
        'High-To-Low Cable Chest Flyes',
        'Dumbbell Lateral Raises in Scapular Plane (below 80°)',
      ],
      tierImpact: 'amber',
    });
    contraindications.push('Full internal shoulder rotation under overhead abduction');
    safeSubstitutions.push(
      {
        original: 'Flat Barbell Bench Press',
        safeReplacement: 'Neutral-Grip Dumbbell Floor / Bench Press',
        reason: 'Reduces subacromial space compression and spares anterior shoulder capsule',
      },
      {
        original: 'Upright Barbell Row',
        safeReplacement: 'Cable Face Pull with External Rotation',
        reason: 'Strengthens posterior cuff stabilizers without internal impingement',
      }
    );
  }

  // Cardiovascular / Hypertension
  const hasCardioBP =
    safety.diagnosedCardiovascularOrBP ||
    conditions.some((c) => c.toLowerCase().includes('pressure') || c.toLowerCase().includes('hypertens') || c.toLowerCase().includes('heart'));

  if (hasCardioBP) {
    overallTier = 'amber';
    findings.push({
      source: 'CDC',
      citationTitle: VETTED_RESEARCH_RESOURCES.CDC_CHRONIC_CONDITIONS.title,
      citationUrl: VETTED_RESEARCH_RESOURCES.CDC_CHRONIC_CONDITIONS.url,
      condition: 'Cardiovascular / Blood Pressure Regulation',
      recommendation:
        'CDC chronic condition guidelines highlight the safety of regular aerobic activity with moderate resistance training. Emphasize rhythmic continuous breathing without breath-holding (Valsalva).',
      contraindications: [
        'Maximal 1RM lifting attempts (extreme intra-thoracic pressure spikes)',
        'Sustained breath-holding (Valsalva maneuver)',
        'Heavy inverted leg presses or upside-down postures',
      ],
      safeAlternatives: [
        'Moderate RPE 6-7 resistance training (10-15 rep range)',
        'Continuous rhythmic breathing protocols',
        'Zone 2 steady-state cardiovascular conditioning (120-135 bpm)',
      ],
      tierImpact: 'amber',
    });
    contraindications.push('Prolonged isometric straining and breath-holding');
  }

  // General CDC baseline if green
  if (findings.length === 0) {
    findings.push({
      source: 'CDC',
      citationTitle: VETTED_RESEARCH_RESOURCES.CDC_CHRONIC_CONDITIONS.title,
      citationUrl: VETTED_RESEARCH_RESOURCES.CDC_CHRONIC_CONDITIONS.url,
      condition: 'Full Clearance Profile (No Active Movement Contraindications)',
      recommendation:
        'CDC adult standards recommend 150 minutes of moderate aerobic activity weekly paired with 2+ muscle-strengthening sessions.',
      contraindications: ['Excessive volume spikes exceeding individual recovery capacity'],
      safeAlternatives: ['Standard full-body and compound progressive resistance training'],
      tierImpact: 'green',
    });
  }

  return {
    overallTier,
    findings,
    contraindications,
    safeSubstitutions,
    clinicalCaveat:
      'All calculations are grounded in published guidelines from the CDC and ACSM. Fitness Intelligence provides educational exercise safety screening, not clinical diagnosis.',
  };
}
