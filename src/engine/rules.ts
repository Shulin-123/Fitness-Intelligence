// Fitness Intelligence Pure Rules Engine
// All calculations are explainable by design and return { value, explanation }

import type {
  Goal,
  Sex,
  ActivityLevel,
  SafetyTier,
  SafetyReason,
  SafetyScreenResponses,
  UserProfile,
  ExplainedValue,
  BMICategory,
  MacroSplit,
  Exercise,
  WeeklyPlan,
  WorkoutDay,
  PlannedExercise,
  ReadinessAdjustmentType,
  WeeklyReviewReport,
  Explanation,
  SafeSplitOption,
} from '../types';

/**
 * Calculates BMI with World Health Organization categories.
 * Returns caveat: "Screening measure, not a diagnosis."
 */
export function calculateBMI(
  weightKg: number,
  heightCm: number
): ExplainedValue<BMICategory> {
  if (weightKg <= 0 || heightCm <= 0) {
    throw new Error('Weight and height must be positive numbers');
  }

  const heightM = heightCm / 100;
  const bmiRaw = weightKg / (heightM * heightM);
  const bmi = Math.round(bmiRaw * 10) / 10;

  let category: BMICategory['category'] = 'normal';
  let label = 'Healthy weight range';

  if (bmi < 18.5) {
    category = 'underweight';
    label = 'Underweight screening range';
  } else if (bmi < 25) {
    category = 'normal';
    label = 'Normal weight range';
  } else if (bmi < 30) {
    category = 'overweight';
    label = 'Overweight screening range';
  } else {
    category = 'obese';
    label = 'Elevated BMI screening range';
  }

  return {
    value: { bmi, category, label },
    explanation: {
      formula: 'BMI = weight (kg) / (height (m))²',
      inputs: { weightKg, heightCm },
      ruleFired: `WHO adult reference bracket: ${category} (${label})`,
      caveat:
        'Screening measure, not a diagnosis. BMI does not differentiate between skeletal muscle and adipose tissue.',
    },
  };
}

/**
 * Calculates BMR using the Mifflin-St Jeor equation.
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex = 'unspecified'
): ExplainedValue<number> {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) {
    throw new Error('Weight, height, and age must be positive numbers');
  }

  // Mifflin-St Jeor:
  // Male: 10 * W + 6.25 * H - 5 * A + 5
  // Female: 10 * W + 6.25 * H - 5 * A - 161
  // Unspecified: 10 * W + 6.25 * H - 5 * A - 78 (midpoint)
  let sexOffset = -78;
  if (sex === 'male') sexOffset = 5;
  if (sex === 'female') sexOffset = -161;

  const bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + sexOffset);

  return {
    value: bmr,
    explanation: {
      formula:
        sex === 'male'
          ? 'Mifflin-St Jeor (Male): 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5'
          : sex === 'female'
          ? 'Mifflin-St Jeor (Female): 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161'
          : 'Mifflin-St Jeor (Gender-neutral midpoint): 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 78',
      inputs: { weightKg, heightCm, age, sex },
      ruleFired: 'Standard resting metabolic expenditure estimation',
      caveat:
        'Metabolic rates vary by ~10-15% based on lean body mass, thyroid hormones, and non-exercise thermal activity.',
    },
  };
}

/**
 * Calculates TDEE based on physical activity multipliers.
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: ActivityLevel
): ExplainedValue<number> {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
  };

  const multiplier = multipliers[activityLevel] || 1.375;
  const tdee = Math.round(bmr * multiplier);

  return {
    value: tdee,
    explanation: {
      formula: `TDEE = BMR × Activity Factor (${multiplier})`,
      inputs: { bmr, activityLevel, multiplier },
      ruleFired: `Activity tier: ${activityLevel}`,
      caveat:
        'Daily physical activity fluctuates. Treat this as an initial calibrated baseline.',
    },
  };
}

/**
 * Calculates Target Daily Calories with deficit/surplus cap and hard calorie floors.
 * Floor: 1500 kcal for male, 1200 kcal for female, 1400 kcal if unspecified.
 */
export function calculateGoalCalories(
  tdee: number,
  goal: Goal,
  sex: Sex = 'unspecified'
): ExplainedValue<number> {
  const calorieFloor = sex === 'male' ? 1500 : sex === 'female' ? 1200 : 1400;

  let target = tdee;
  let ruleFired = 'Maintenance caloric equilibrium';
  let formula = 'Target = TDEE';

  if (goal === 'lose_fat') {
    // 15% deficit (capped at 20%)
    const deficitPct = 0.15;
    target = Math.round(tdee * (1 - deficitPct));
    formula = 'Target = TDEE - 15% deficit';
    ruleFired = '15% moderate deficit designed for steady fat loss while sparing lean tissue';
  } else if (goal === 'build_muscle') {
    // 8% surplus
    const surplusPct = 0.08;
    target = Math.round(tdee * (1 + surplusPct));
    formula = 'Target = TDEE + 8% surplus';
    ruleFired = '8% lean mass surplus to support protein synthesis without excessive adipose gain';
  } else if (goal === 'get_fitter') {
    target = tdee;
    formula = 'Target = TDEE';
    ruleFired = 'Energy balance supporting athletic recovery and progressive conditioning';
  }

  let caveat = 'Energy needs will adjust automatically based on weekly weight trends.';

  if (target < calorieFloor) {
    target = calorieFloor;
    ruleFired += ` [Floor protection engaged: clamped at ${calorieFloor} kcal]`;
    caveat = `Safety floor applied (${calorieFloor} kcal for ${sex}). We never recommend dipping below essential metabolic requirements.`;
  }

  return {
    value: target,
    explanation: {
      formula,
      inputs: { tdee, goal, sex, calorieFloor },
      ruleFired,
      caveat,
    },
  };
}

/**
 * Calculates Macronutrient breakdown in grams and percentages.
 */
export function calculateMacros(
  targetCalories: number,
  weightKg: number,
  goal: Goal
): ExplainedValue<MacroSplit> {
  // Protein: 1.6 - 2.2 g/kg
  let proteinMultiplier = 1.8;
  if (goal === 'build_muscle') proteinMultiplier = 2.0;
  if (goal === 'lose_fat') proteinMultiplier = 2.0; // Higher protein preserves muscle in deficit
  if (goal === 'maintain' || goal === 'get_fitter') proteinMultiplier = 1.6;

  const proteinGrams = Math.round(weightKg * proteinMultiplier);
  const proteinKcal = proteinGrams * 4;

  // Fat: minimum 0.6 g/kg, typically ~25% of total calories
  let fatKcal = Math.round(targetCalories * 0.25);
  const minFatGrams = Math.round(weightKg * 0.6);
  if (fatKcal / 9 < minFatGrams) {
    fatKcal = minFatGrams * 9;
  }
  const fatGrams = Math.round(fatKcal / 9);

  // Carbs: Remainder of calories
  const remainingKcal = Math.max(0, targetCalories - (proteinKcal + fatGrams * 9));
  const carbGrams = Math.round(remainingKcal / 4);

  const totalCalculatedKcal = proteinGrams * 4 + fatGrams * 9 + carbGrams * 4;
  const proteinPct = Math.round((proteinGrams * 4 / totalCalculatedKcal) * 100);
  const fatPct = Math.round((fatGrams * 9 / totalCalculatedKcal) * 100);
  const carbPct = 100 - (proteinPct + fatPct);

  return {
    value: {
      calories: totalCalculatedKcal,
      proteinGrams,
      carbGrams,
      fatGrams,
      proteinPercentage: proteinPct,
      carbPercentage: carbPct,
      fatPercentage: fatPct,
    },
    explanation: {
      formula: `Protein: ${proteinMultiplier}g/kg | Fat: 25% kcal (min 0.6g/kg) | Carbs: Remaining kcal`,
      inputs: { targetCalories, weightKg, goal, proteinMultiplier },
      ruleFired: `High-leverage macronutrient partitioning for ${goal.replace('_', ' ')}`,
      caveat:
        'Percentages are guidelines. Prioritize hitting your daily protein target and calorie ceiling first.',
    },
  };
}

/**
 * Calculates daily baseline water target (approx 35 ml/kg, rounded to 100ml).
 */
export function calculateWaterTarget(weightKg: number): ExplainedValue<number> {
  const rawMl = weightKg * 35;
  const roundedMl = Math.round(rawMl / 100) * 100;

  return {
    value: roundedMl,
    explanation: {
      formula: 'Target (ml) = weight (kg) × 35 ml/kg (rounded to nearest 100ml)',
      inputs: { weightKg, factor: '35 ml/kg' },
      ruleFired: 'Standard hydration index for active individuals',
      caveat:
        'Increase intake by 400-800 ml on heavy training days or in hot climates.',
    },
  };
}

/**
 * Evaluates user safety status: Green, Amber, or Red.
 */
export function evaluateSafetyStatus(
  profile: Partial<UserProfile> & { safetyResponses: SafetyScreenResponses; age?: number }
): { tier: SafetyTier; reasons: SafetyReason[]; explanation: Explanation } {
  const reasons: SafetyReason[] = [];
  const s = profile.safetyResponses;

  // RED FLAGS: Concerning symptoms during exercise
  if (s.concerningSymptomsDuringExercise) {
    reasons.push({
      tier: 'red',
      code: 'CONCERNING_EXERCISE_SYMPTOMS',
      message:
        'Reported chest pain, syncope/fainting, or severe shortness of breath during exertion.',
      detail:
        'For your well-being, automated workout plans are suspended. Please seek medical consultation with a qualified physician or cardiologist before resuming exercise.',
    });
  }

  // AMBER FLAGS
  if (s.diagnosedCardiovascularOrBP) {
    reasons.push({
      tier: 'amber',
      code: 'CARDIOVASCULAR_BP_CONDITION',
      message: 'Diagnosed cardiovascular or blood pressure condition noted.',
      detail:
        'Lower-intensity, controlled-stability exercises recommended. Please confirm suitability with your physician.',
    });
  }

  if (s.recentSurgery && !s.recentSurgeryCleared) {
    reasons.push({
      tier: 'amber',
      code: 'RECENT_SURGERY_UNCLEARED',
      message: 'Recent surgical procedure not yet cleared by a surgeon.',
      detail:
        'Exercise volume and mechanical load will be restricted pending medical clearance.',
    });
  }

  if (s.conditionAffectingExercise) {
    reasons.push({
      tier: 'amber',
      code: 'GENERAL_MEDICAL_CONDITION',
      message: 'Underlying chronic condition that affects physical exertion.',
      detail: 'Plan is adjusted to moderate volume and controlled RPE levels.',
    });
  }

  if (s.injuryOrPain) {
    const areas = s.injuryAreas && s.injuryAreas.length > 0 ? s.injuryAreas.join(', ') : 'specific areas';
    reasons.push({
      tier: 'amber',
      code: 'CURRENT_INJURY_OR_PAIN',
      message: `Active pain or movement limitation in: ${areas}.`,
      detail:
        'Direct axial loading and contraindicated exercises for these joints are automatically substituted.',
    });
  }

  if (s.pregnantOrBreastfeeding) {
    reasons.push({
      tier: 'amber',
      code: 'PREGNANT_OR_BREASTFEEDING',
      message: 'Pregnancy or postpartum status noted.',
      detail:
        'Exercises avoid high intra-abdominal pressure, supine positions in late stages, and heavy ballistic strain.',
    });
  }

  // BMI < 18.5 with weight loss goal is an amber safety alert
  if (profile.weightKg && profile.heightCm && profile.goal === 'lose_fat') {
    const heightM = profile.heightCm / 100;
    const bmi = profile.weightKg / (heightM * heightM);
    if (bmi < 18.5) {
      reasons.push({
        tier: 'amber',
        code: 'LOW_BMI_DEFICIT_RISK',
        message: 'Caloric deficit selected with a BMI below 18.5.',
        detail:
          'Weight loss is not recommended at this baseline. Plan will pivot to nutritional maintenance.',
      });
    }
  }

  // Determine overall tier
  let tier: SafetyTier = 'green';
  if (reasons.some((r) => r.tier === 'red')) {
    tier = 'red';
  } else if (reasons.some((r) => r.tier === 'amber')) {
    tier = 'amber';
  }

  const explanation: Explanation = {
    formula: 'Safety Risk Stratification = Max(Symptom Flags, Clinical History, Joint Restrictions)',
    inputs: {
      concerningSymptoms: s.concerningSymptomsDuringExercise,
      cardioBP: s.diagnosedCardiovascularOrBP,
      injury: s.injuryOrPain,
      surgery: s.recentSurgery,
    },
    ruleFired:
      tier === 'red'
        ? 'RED TIER: Medical contraindication requiring clinical consultation'
        : tier === 'amber'
        ? 'AMBER TIER: Calibrated lower-risk exercise programming + professional verification advised'
        : 'GREEN TIER: Standard progressive resistance training protocol',
    caveat:
      'Fitness Intelligence is for educational tracking only and never diagnoses or treats health conditions.',
  };

  return { tier, reasons, explanation };
}

/**
 * Selects an optimal workout split based on weekly training days and safety tier.
 */
export function selectSplit(
  daysPerWeek: number,
  _experience: string = 'beginner',
  _safetyTier: SafetyTier = 'green'
): { splitName: string; splitDescription: string; dayTemplates: string[] } {
  const daysClamped = Math.max(2, Math.min(6, daysPerWeek));

  switch (daysClamped) {
    case 2:
      return {
        splitName: 'Full Body 2-Day Split',
        splitDescription: 'Two comprehensive full-body sessions with maximal recovery intervals.',
        dayTemplates: ['Full Body A', 'Full Body B'],
      };
    case 3:
      return {
        splitName: 'Full Body 3-Day Split (A/B/C)',
        splitDescription: 'Three distinct full-body rotations balancing squats, hinges, pushes, and pulls.',
        dayTemplates: ['Full Body A', 'Full Body B', 'Full Body C'],
      };
    case 4:
      return {
        splitName: 'Upper / Lower 4-Day Split',
        splitDescription: 'Alternating upper and lower body stimuli twice weekly for optimal muscle protein synthesis.',
        dayTemplates: ['Upper Body A', 'Lower Body A', 'Upper Body B', 'Lower Body B'],
      };
    case 5:
      return {
        splitName: 'Upper / Lower / Push / Pull / Legs',
        splitDescription: 'High-frequency hybrid split blending strength foundations with hypertrophy isolation.',
        dayTemplates: ['Upper Body', 'Lower Body', 'Push Focus', 'Pull Focus', 'Legs & Core'],
      };
    case 6:
      return {
        splitName: 'Push / Pull / Legs 6-Day Split',
        splitDescription: 'High-frequency double rotation targeting each movement pattern twice weekly.',
        dayTemplates: ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'],
      };
    default:
      return {
        splitName: 'Full Body 3-Day Split',
        splitDescription: 'Three balanced sessions per week.',
        dayTemplates: ['Full Body A', 'Full Body B', 'Full Body C'],
      };
  }
}

/**
 * Generates evidence-based safe split options tailored to the user's clinical safety profile,
 * medical history, and uploaded diagnostic files.
 */
export function generateSafeSplitOptions(
  profile: UserProfile,
  _safetyResult?: { tier: SafetyTier; reasons: SafetyReason[] }
): SafeSplitOption[] {
  const conditions = (profile.safetyResponses.medicalConditions || []).join(' ').toLowerCase();
  const notes = (profile.safetyResponses.medicalConditionNotes || '').toLowerCase();
  const reportKeywords = (profile.safetyResponses.uploadedReport?.detectedKeywords || []).join(' ').toLowerCase();
  const combinedHealthText = `${conditions} ${notes} ${reportKeywords}`;

  const injuryAreas = profile.safetyResponses.injuryAreas || [];
  const hasSpine =
    injuryAreas.includes('lower_back') ||
    combinedHealthText.includes('disc') ||
    combinedHealthText.includes('lumbar') ||
    combinedHealthText.includes('back') ||
    combinedHealthText.includes('sciatica') ||
    combinedHealthText.includes('l4') ||
    combinedHealthText.includes('l5') ||
    combinedHealthText.includes('s1') ||
    combinedHealthText.includes('spondyl');

  const hasJoint =
    injuryAreas.includes('knee') ||
    injuryAreas.includes('shoulder') ||
    injuryAreas.includes('wrist') ||
    combinedHealthText.includes('knee') ||
    combinedHealthText.includes('meniscus') ||
    combinedHealthText.includes('shoulder') ||
    combinedHealthText.includes('impingement') ||
    combinedHealthText.includes('rotator') ||
    combinedHealthText.includes('patell') ||
    combinedHealthText.includes('arthritis');

  const hasCardio =
    profile.safetyResponses.diagnosedCardiovascularOrBP ||
    combinedHealthText.includes('blood pressure') ||
    combinedHealthText.includes('hypertens') ||
    combinedHealthText.includes('asthma') ||
    combinedHealthText.includes('heart') ||
    combinedHealthText.includes('cardio');

  const hasSurgeryOrSedentary =
    profile.safetyResponses.recentSurgery ||
    profile.activityLevel === 'sedentary' ||
    combinedHealthText.includes('surgery') ||
    combinedHealthText.includes('rehab');

  const days = Math.max(2, Math.min(6, profile.trainingDaysPerWeek || 3));

  // Determine primary clinical recommendation
  let primaryCat: SafeSplitOption['category'] = 'standard_progressive';
  if (hasSpine) primaryCat = 'spine_safe';
  else if (hasJoint) primaryCat = 'joint_friendly';
  else if (hasCardio) primaryCat = 'cardio_metabolic';
  else if (hasSurgeryOrSedentary) primaryCat = 'mobility_foundation';

  const spineOption: SafeSplitOption = {
    id: 'spine_safe',
    name: 'Spine-Safe Functional Split',
    category: 'spine_safe',
    badgeLabel: '🛡️ Zero Axial Load & Spine-Safe',
    description:
      'Strictly eliminates vertical compressive loading on the spine. Prioritizes chest-supported rows, 45° leg press, glute bridges, and anti-extension core stability.',
    recommendedFor: [
      'L4-L5 / L5-S1 disc bulges or herniations',
      'Sciatica and nerve root compression',
      'Lower back muscle spasm or facet joint pain',
    ],
    weeklyDays: days,
    rpeCap: 7,
    highlightedSubstitutions: [
      {
        original: 'Barbell Back Squat',
        safeReplacement: '45° Leg Press (Sacrum Pinned)',
        reason: 'Eliminates compressive vertical gravity force on the lumbar spine.',
      },
      {
        original: 'Conventional Barbell Deadlift',
        safeReplacement: 'Dumbbell Hip Thrust / Leg Curls',
        reason: 'Recruits posterior chain with zero lumbar flexion torque.',
      },
      {
        original: 'Standing Overhead Press',
        safeReplacement: 'Seated Incline Dumbbell Press (Chest Supported)',
        reason: 'Eliminates lumbar hyperextension shear and lordotic collapse.',
      },
    ],
    dayTemplates:
      days <= 3
        ? ['Spine-Safe Upper', 'Spine-Safe Lower & Hips', 'Spine-Safe Posture & Core']
        : ['Spine-Safe Upper A', 'Spine-Safe Lower A', 'Spine-Safe Upper B', 'Spine-Safe Posterior Chain'].slice(0, days),
    isRecommended: primaryCat === 'spine_safe',
  };

  const jointOption: SafeSplitOption = {
    id: 'joint_friendly',
    name: 'Joint-Friendly Low-Impact Split',
    category: 'joint_friendly',
    badgeLabel: '🛡️ Low-Impact / Joint-Friendly',
    description:
      'Engineered to minimize articular cartilage friction and peak joint shear angles. Uses smooth guided machines, 45° scapular paths, and neutral-grip ergonomics.',
    recommendedFor: [
      'Patellofemoral pain & meniscus wear',
      'Subacromial shoulder impingement',
      'Rotator cuff vulnerability & wrist strain',
    ],
    weeklyDays: days,
    rpeCap: 7,
    highlightedSubstitutions: [
      {
        original: 'Barbell Bench Press (Wide Grip)',
        safeReplacement: 'Neutral-Grip Dumbbell Floor Press',
        reason: 'Opens subacromial joint space and shields anterior shoulder capsule.',
      },
      {
        original: 'Walking Lunges / Jump Squats',
        safeReplacement: 'Horizontal Leg Press (90° Knee Angle Buffer)',
        reason: 'Removes deceleration shockwaves and patellar shear.',
      },
      {
        original: 'Upright Barbell Rows',
        safeReplacement: 'Cable Face Pull with External Rotation',
        reason: 'Eliminates extreme internal shoulder impingement rotation.',
      },
    ],
    dayTemplates:
      days <= 3
        ? ['Joint-Friendly Upper Push/Pull', 'Joint-Friendly Lower & Glutes', 'Joint-Friendly Full Body']
        : ['Joint-Friendly Upper A', 'Joint-Friendly Lower A', 'Joint-Friendly Upper B', 'Joint-Friendly Lower B'].slice(0, days),
    isRecommended: primaryCat === 'joint_friendly',
  };

  const cardioOption: SafeSplitOption = {
    id: 'cardio_metabolic',
    name: 'Cardio-Safe Metabolic Conditioning Split',
    category: 'cardio_metabolic',
    badgeLabel: '❤️ Cardio-Safe & Steady Heart Rate',
    description:
      'Calibrated per CDC chronic disease guidance: regulates intra-thoracic pressure spikes with 10-15 rep sub-maximal sets, active nasal/rhythmic breathing, and zero Valsalva breath-holding.',
    recommendedFor: [
      'Hypertension & elevated blood pressure',
      'Cardiovascular safety screening',
      'Asthma & respiratory exercise pacing',
    ],
    weeklyDays: days,
    rpeCap: 6.5,
    highlightedSubstitutions: [
      {
        original: 'Heavy 1-5 Rep Maximums',
        safeReplacement: 'Sub-Maximal 10-15 Rep Rhythmic Sets',
        reason: 'Prevents acute systemic arterial blood pressure surges.',
      },
      {
        original: 'Valsalva Breath Holding',
        safeReplacement: 'Rhythmic Exhale-on-Exertion Cadence',
        reason: 'Stabilizes intracranial and cardiovascular pressure.',
      },
      {
        original: 'Inverted Leg Press',
        safeReplacement: 'Upright Seated Leg Press',
        reason: 'Avoids head-below-heart venous blood return rushes.',
      },
    ],
    dayTemplates:
      days <= 3
        ? ['Cardio-Resistance Circuit A', 'Cardio-Resistance Circuit B', 'Steady Aerobic & Core']
        : ['Cardio-Resistance Upper', 'Cardio-Resistance Lower', 'Aerobic Flush', 'Metabolic Core'].slice(0, days),
    isRecommended: primaryCat === 'cardio_metabolic',
  };

  const mobilityOption: SafeSplitOption = {
    id: 'mobility_foundation',
    name: 'Mobility & Postural Foundation Split',
    category: 'mobility_foundation',
    badgeLabel: '🧘 Mobility & Postural Foundation',
    description:
      'Restores active joint range of motion, scapular rhythm, thoracic spine extension, and pelvic neutrality. Ideal for post-rehabilitation recovery or sedentary baselines.',
    recommendedFor: [
      'Post-surgery recovery (physician cleared)',
      'Chronic desk posture & anterior pelvic tilt',
      'Sedentary restart baselines',
    ],
    weeklyDays: days,
    rpeCap: 6.5,
    highlightedSubstitutions: [
      {
        original: 'Maximal Effort Compound Sets',
        safeReplacement: 'Isometric Holds & Dynamic End-Range Mobility',
        reason: 'Restores neuromuscular recruitment and synovial fluid lubrication.',
      },
    ],
    dayTemplates:
      days <= 3
        ? ['Thoracic & Scapular Flow', 'Hip Capsule & Pelvic Stability', 'Full Body Mobility & Core']
        : ['Upper Posture', 'Hip Mobility', 'Spine Restoration', 'Core Alignment'].slice(0, days),
    isRecommended: primaryCat === 'mobility_foundation',
  };

  const standardOption: SafeSplitOption = {
    id: 'standard_progressive',
    name: 'Standard Progressive Overload Split',
    category: 'standard_progressive',
    badgeLabel: '⚡ Progressive Hypertrophy & Strength',
    description:
      'Evidence-based multi-joint progressive resistance training designed for muscular hypertrophy and strength adaptations, autoregulated within your recovery budget.',
    recommendedFor: [
      'Unrestricted movement clearance',
      'Muscle hypertrophy & strength focus',
      'Athletic body recomposition',
    ],
    weeklyDays: days,
    rpeCap: profile.experience === 'advanced' ? 9 : 8,
    highlightedSubstitutions: [
      {
        original: 'Unplanned Fatigue Spikes',
        safeReplacement: 'Autoregulated RPE 7-8 Target Volume',
        reason: 'Prevents central nervous system overreaching and injury risk.',
      },
    ],
    dayTemplates:
      days <= 3
        ? ['Full Body A', 'Full Body B', 'Full Body C']
        : days === 4
        ? ['Upper Body A', 'Lower Body A', 'Upper Body B', 'Lower Body B']
        : ['Upper Body', 'Lower Body', 'Push Focus', 'Pull Focus', 'Legs & Core'].slice(0, days),
    isRecommended: primaryCat === 'standard_progressive',
  };

  return [spineOption, jointOption, cardioOption, mobilityOption, standardOption];
}

/**
 * Builds a personalized weekly training plan using exercise library, safety restrictions, and time budget.
 * RED safety status returns null and an alert explanation.
 * Honors active or custom safe split option selection.
 */
export function buildPlan(
  profile: UserProfile,
  safetyTier: SafetyTier,
  exerciseLibrary: Exercise[],
  customSafeSplitId?: string
): WeeklyPlan | null {
  if (safetyTier === 'red') {
    return null;
  }

  const availableSafeSplits = generateSafeSplitOptions(profile, { tier: safetyTier, reasons: [] });
  const activeSplitId = customSafeSplitId || profile.selectedSafeSplitId;
  const activeSplit =
    (activeSplitId && availableSafeSplits.find((s) => s.id === activeSplitId)) ||
    availableSafeSplits.find((s) => s.isRecommended) ||
    availableSafeSplits[0];

  const { splitName, splitDescription, dayTemplates } = selectSplit(
    profile.trainingDaysPerWeek,
    profile.experience,
    safetyTier
  );

  const effectiveSplitName = activeSplit ? activeSplit.name : splitName;
  const effectiveSplitDescription = activeSplit ? activeSplit.description : splitDescription;
  const effectiveTemplates =
    activeSplit && activeSplit.dayTemplates.length >= profile.trainingDaysPerWeek
      ? activeSplit.dayTemplates
      : dayTemplates;

  const isAmber = safetyTier === 'amber';
  const rpeCap = activeSplit ? activeSplit.rpeCap : isAmber ? 7 : profile.experience === 'advanced' ? 9 : 8;

  // Compute effective restriction tags based on injuries AND selected split
  const injuryAreas: string[] = [...(profile.safetyResponses.injuryAreas || [])];
  if (activeSplit?.category === 'spine_safe' && !injuryAreas.includes('lower_back')) {
    injuryAreas.push('lower_back');
  }
  if (activeSplit?.category === 'joint_friendly') {
    if (!injuryAreas.includes('knee')) injuryAreas.push('knee');
    if (!injuryAreas.includes('shoulder')) injuryAreas.push('shoulder');
    if (!injuryAreas.includes('wrist')) injuryAreas.push('wrist');
  }

  // Filter and substitute exercises based on contraindications
  function getSafeExercise(
    targetMuscle: string,
    defaultExerciseId: string
  ): { exercise: Exercise; substituted: boolean; origName?: string } {
    let exercise = exerciseLibrary.find((e) => e.id === defaultExerciseId);
    if (!exercise) {
      exercise = exerciseLibrary.find((e) => e.muscleGroup === targetMuscle) || exerciseLibrary[0];
    }

    const hasContraindication = exercise.contraindicationTags.some((tag) =>
      injuryAreas.includes(tag)
    );

    if (hasContraindication && exercise.alternativeExerciseId) {
      const alt = exerciseLibrary.find((e) => e.id === exercise!.alternativeExerciseId);
      if (alt) {
        return { exercise: alt, substituted: true, origName: exercise.name };
      }
    }

    // In Amber or safe split mode, prefer machine or stable variations if available
    if (
      (isAmber || activeSplit?.category !== 'standard_progressive') &&
      exercise.difficulty === 'advanced' &&
      exercise.alternativeExerciseId
    ) {
      const alt = exerciseLibrary.find((e) => e.id === exercise!.alternativeExerciseId);
      if (alt) {
        return { exercise: alt, substituted: true, origName: exercise.name };
      }
    }

    return { exercise, substituted: false };
  }

  // Session length sizing
  const duration = profile.sessionDurationMin || 45;
  const exerciseCount = duration <= 30 ? 4 : duration <= 45 ? 5 : duration <= 60 ? 6 : 7;
  const setMultiplier = isAmber || activeSplit?.category === 'mobility_foundation' ? 0.75 : 1.0;

  const days: WorkoutDay[] = effectiveTemplates.map((templateTitle, idx) => {
    const plannedExercises: PlannedExercise[] = [];

    // Map template name to focus groups
    let targetGroups: Exercise['muscleGroup'][] = ['chest', 'back', 'legs', 'shoulders', 'arms'];
    if (templateTitle.includes('Upper') || templateTitle.includes('Push/Pull')) {
      targetGroups = ['chest', 'back', 'shoulders', 'arms', 'back', 'chest'];
    } else if (templateTitle.includes('Lower') || templateTitle.includes('Legs') || templateTitle.includes('Hips')) {
      targetGroups = ['legs', 'legs', 'legs', 'core', 'core', 'legs'];
    } else if (templateTitle.includes('Push')) {
      targetGroups = ['chest', 'shoulders', 'arms', 'chest', 'shoulders', 'core'];
    } else if (templateTitle.includes('Pull')) {
      targetGroups = ['back', 'back', 'arms', 'back', 'arms', 'core'];
    } else if (templateTitle.includes('Posture') || templateTitle.includes('Mobility') || templateTitle.includes('Flow')) {
      targetGroups = ['back', 'core', 'legs', 'shoulders', 'core'];
    }

    const chosenGroups = targetGroups.slice(0, exerciseCount);

    chosenGroups.forEach((group) => {
      // Find library candidates for this muscle group
      const candidates = exerciseLibrary.filter((e) => e.muscleGroup === group);
      const chosen = candidates[plannedExercises.length % candidates.length] || exerciseLibrary[0];
      const { exercise, substituted, origName } = getSafeExercise(group, chosen.id);

      const targetSetsCount = Math.max(2, Math.round((isAmber ? 2 : 3) * setMultiplier));
      const restSeconds = duration <= 30 ? 60 : isAmber ? 90 : 75;

      const targetReps =
        activeSplit?.category === 'cardio_metabolic' || activeSplit?.category === 'mobility_foundation'
          ? '12-15'
          : isAmber
          ? '10-12'
          : '8-10';

      plannedExercises.push({
        exerciseId: exercise.id,
        exercise,
        isSubstituted: substituted,
        originalExerciseName: origName,
        sets: Array.from({ length: targetSetsCount }, (_, setIdx) => ({
          setNumber: setIdx + 1,
          targetReps,
          targetRpe: Math.min(rpeCap, 7),
          restSeconds,
        })),
        notes: substituted
          ? `Substituted for ${origName} under ${activeSplit?.name || 'safe split'} protocols.`
          : exercise.shortCueText,
      });
    });

    return {
      dayNumber: idx + 1,
      title: templateTitle,
      targetDurationMin: duration,
      focusMuscles: Array.from(new Set(chosenGroups)),
      exercises: plannedExercises,
      isRestDay: false,
    };
  });

  return {
    splitName: effectiveSplitName,
    splitDescription: effectiveSplitDescription,
    daysPerWeek: profile.trainingDaysPerWeek,
    days,
    volumeTier: isAmber ? 'amber_reduced' : 'standard',
    rpeCap,
    safeSplitId: activeSplit?.id,
    availableSafeSplits,
    explanation: {
      formula: `Split: ${effectiveSplitName} (${profile.trainingDaysPerWeek} Days/wk) | Cap: RPE ${rpeCap}`,
      inputs: {
        trainingDays: profile.trainingDaysPerWeek,
        experience: profile.experience,
        safetyTier,
        safeSplitSelected: activeSplit?.id,
        durationMin: duration,
        injuries: injuryAreas,
      },
      ruleFired:
        activeSplit?.category !== 'standard_progressive'
          ? `Clinical Safe Split active: ${activeSplit?.badgeLabel}. Contraindications automatically substituted.`
          : isAmber
          ? 'Amber calibrated plan: machines prioritized, lower set volume (-25%), strict RPE 7 ceiling'
          : 'Progressive overload plan matched to recovery window and session budget',
      caveat:
        'Adjust loads as needed. Stop immediately if you experience sharp or radiating joint pain.',
    },
  };
}

/**
 * Calculates readiness score (0-100) and adjustment:
 * - keep: score >= 65
 * - reduce_volume: score 40-64 (-30% sets)
 * - active_recovery: score < 40
 */
export function calculateReadiness(
  sleepScore: number, // 1 to 5
  sorenessScore: number, // 1 (none) to 5 (extreme)
  energyScore: number // 1 to 5
): ExplainedValue<{ score: number; adjustment: ReadinessAdjustmentType }> {
  // Normalize each:
  // sleep: 1-5 -> 0 to 100
  const sleepNorm = ((sleepScore - 1) / 4) * 100;
  // soreness: 1 (great) to 5 (sore) -> inverse
  const sorenessNorm = (1 - (sorenessScore - 1) / 4) * 100;
  // energy: 1-5 -> 0 to 100
  const energyNorm = ((energyScore - 1) / 4) * 100;

  // Weighted composite: Sleep 40%, Energy 35%, Soreness 25%
  const composite = Math.round(sleepNorm * 0.4 + energyNorm * 0.35 + sorenessNorm * 0.25);

  let adjustment: ReadinessAdjustmentType = 'keep';
  let ruleFired = 'Readiness score >= 65: Proceed with full scheduled training volume';

  if (composite < 40) {
    adjustment = 'active_recovery';
    ruleFired = 'Readiness score < 40: High systemic fatigue. Pivoted to light mobility & active recovery';
  } else if (composite < 65) {
    adjustment = 'reduce_volume';
    ruleFired = 'Readiness score 40-64: Moderate recovery debt. Volume scaled back by ~30% to prevent overreaching';
  }

  return {
    value: { score: composite, adjustment },
    explanation: {
      formula: 'Score = (Sleep × 40%) + (Energy × 35%) + ((6 - Soreness) × 25%)',
      inputs: { sleepScore, sorenessScore, energyScore, calculatedScore: composite },
      ruleFired,
      caveat:
        'Subjective state is a key biomarker. Listening to systemic fatigue reduces injury incidence.',
    },
  };
}

/**
 * Generates an adaptive weekly review with one insight and one gentle adjustment.
 * Clamps to calorie floor; never suggests aggressive changes.
 */
export function generateWeeklyReview(
  weightTrendDeltaKg: number,
  adherencePercentage: number,
  workoutsCompleted: number,
  workoutsTarget: number,
  goal: Goal,
  currentCalories: number,
  sex: Sex = 'unspecified'
): WeeklyReviewReport {
  const calorieFloor = sex === 'male' ? 1500 : sex === 'female' ? 1200 : 1400;
  let suggestedAdjustmentKcal = 0;
  let insight = '';
  let ruleFired = '';

  const adherenceIsHigh = adherencePercentage >= 80;

  if (goal === 'lose_fat') {
    if (weightTrendDeltaKg > -0.1 && adherenceIsHigh) {
      // Weight is stalled despite high consistency
      suggestedAdjustmentKcal = -100;
      insight = 'Weight was stable over the week with solid 80%+ adherence. A small 100 kcal adjustment will gently kickstart fat mobilization.';
      ruleFired = 'Weight plateau at >80% adherence -> -100 kcal moderate step down';
    } else if (weightTrendDeltaKg <= -0.8) {
      // Weight dropping too fast
      suggestedAdjustmentKcal = +100;
      insight = 'Weight decreased by over 0.8 kg this week. Adding 100 kcal to protect lean tissue and maintain training performance.';
      ruleFired = 'Rapid weight loss (>0.8kg/wk) -> +100 kcal safety buffer';
    } else {
      insight = 'You are progressing right on pace. Calorie and training targets remain optimal.';
      ruleFired = 'Steady rate of progress (-0.2kg to -0.6kg) -> Maintain current targets';
    }
  } else if (goal === 'build_muscle') {
    if (weightTrendDeltaKg < 0.1 && adherenceIsHigh) {
      suggestedAdjustmentKcal = +100;
      insight = 'Weight was flat with high workout adherence. A modest 100 kcal surplus bump will provide fuel for progressive overload.';
      ruleFired = 'Muscle growth plateau with high adherence -> +100 kcal surplus';
    } else {
      insight = 'Solid muscle building progress with balanced energetic intake.';
      ruleFired = 'Healthy surplus balance -> Maintain targets';
    }
  } else {
    insight = 'Consistency and energy balance are well matched. Keep up the steady cadence!';
    ruleFired = 'Maintenance adherence sustained -> No adjustment needed';
  }

  // Ensure calorie floor is respected
  if (currentCalories + suggestedAdjustmentKcal < calorieFloor) {
    suggestedAdjustmentKcal = Math.min(0, calorieFloor - currentCalories);
    ruleFired += ` [Floor protection: target cannot drop below ${calorieFloor} kcal]`;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const lastWeekStr = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  return {
    id: `rev-${Date.now()}`,
    weekStartDate: lastWeekStr,
    weekEndDate: todayStr,
    avgWeightKg: 0, // Filled in by caller
    weightTrendDeltaKg,
    adherencePercentage,
    workoutsCompleted,
    workoutsTarget,
    insight,
    suggestedAdjustmentKcal,
    accepted: false,
    explanation: {
      formula: 'Review = Trend Delta + Adherence Threshold (80%) + Energy Floor Safeguard',
      inputs: {
        weightTrendDeltaKg,
        adherencePercentage,
        workoutsCompleted,
        workoutsTarget,
        currentCalories,
        calorieFloor,
      },
      ruleFired,
      caveat:
        'Small, steady weekly adaptations build sustainable adherence without metabolic shock.',
    },
  };
}

/**
 * Calculates a rolling simple moving average.
 */
export function calculateMovingAverage(data: number[], windowSize: number = 7): number[] {
  if (data.length === 0) return [];
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const windowSlice = data.slice(start, i + 1);
    const avg = windowSlice.reduce((sum, val) => sum + val, 0) / windowSlice.length;
    result.push(Math.round(avg * 10) / 10);
  }
  return result;
}

/**
 * Computes consecutive active day streak.
 */
export function calculateStreak(activeDates: string[]): number {
  if (!activeDates.length) return 0;
  const uniqueDates = Array.from(new Set(activeDates)).sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date(uniqueDates.includes(today) ? today : yesterday);

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (uniqueDates.includes(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Computes adherence percentage (0 to 100).
 */
export function calculateAdherence(completed: number, target: number): number {
  if (target <= 0) return 100;
  return Math.min(100, Math.round((completed / target) * 100));
}
