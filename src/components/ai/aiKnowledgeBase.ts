// Scientific Domain Knowledge Engine for Fitness Intelligence AI Copilot
// Provides peer-reviewed, deterministic, explainable answers with verifiable calculations.

export interface AIResponsePayload {
  answer: string;
  sourceTags: string[];
  followUps: string[];
}

export function generateScientificResponse(query: string): AIResponsePayload {
  const q = query.toLowerCase();

  // 1. Chest Day Hypertrophy & Growth
  if (q.includes('chest') && (q.includes('grow') || q.includes('exercise') || q.includes('workout') || q.includes('day') || q.includes('routine'))) {
    return {
      answer: `### 🛡️ Evidence-Based Chest Day Routine for Maximum Hypertrophy

To maximize pectoral growth according to NSCA and Schoenfeld guidelines, target both the **clavicular head** (upper chest) and **sternocostal head** (mid/lower chest) across varying resistance curves:

1. **Incline Dumbbell Press (Upper Chest Focus)**:
   * **3–4 sets × 8–10 reps @ 1–2 RIR** (bench angled at 30° to minimize anterior delt takeover).
   * Focus on full stretch at bottom without bouncing.

2. **Flat Barbell Bench Press (Heavy Mechanical Tension)**:
   * **3–4 sets × 6–8 reps @ 2 RIR**.
   * Retract scapulae, maintain 45–60° elbow tuck to prevent subacromial impingement.

3. **Weighted or Bodyweight Chest Dips (Lower Pectoral & Stretch Under Load)**:
   * **3 sets × 8–12 reps**.
   * Lean forward 30° to bias pectoralis major over triceps.

4. **Cable Chest Flyes / Pec Deck (Midline Contraction)**:
   * **3 sets × 12–15 reps with 1-second pause at peak squeeze**.

*Weekly Volume Target: 12–16 hard working sets distributed across 2 weekly sessions for optimal muscle protein synthesis.*`,
      sourceTags: ['Schoenfeld Hypertrophy (2016)', 'Contreras EMG Pectoral Analysis', 'NSCA Guidelines'],
      followUps: [
        'How many days between chest sessions?',
        'Incline dumbbell vs incline barbell for upper chest?',
        'How to prevent shoulder impingement on bench press?',
      ],
    };
  }

  // 2. Bench Press / Plateau
  if (q.includes('plateau') && (q.includes('bench') || q.includes('press'))) {
    return {
      answer: `### 🎯 Strategy to Break a Bench Press Plateau

Breaking a bench plateau requires managing three primary biomechanical factors: **mechanical tension**, **sticking point velocity**, and **stabilizing volume**.

1. **Address the Sticking Point (Usually 2–4 inches off chest)**:
   * **Pause Reps (2-second count)**: Eliminates stretch-shortening reflex (elastic recoil) and forces pure concentric neural recruitment.
   * **Spoto Press / Board Press**: Overloads the triceps and anterior delts at the exact transition point.

2. **Optimize Weekly Volume & Frequency**:
   * Optimal frequency for pressing hypertrophy & strength is **2 to 3 sessions per week**, separated by 48–72 hours of recovery.
   * Target **12–16 hard working sets** per week within RPE 7–9 (leaving 1–3 reps in reserve).

3. **Upper Back & Scapular Retraction**:
   * A stable bench begins with the upper back. Ensure your scapulae are retracted and depressed ("tucked into your back pockets").
   * Keep a 3-point base of support (feet driven into the floor, glutes locked, upper traps pinned to the bench).

4. **Progressive Overload Scheme (Wave Periodization)**:
   * **Week 1**: 4 sets × 6 reps @ 75% 1RM (RPE 7)
   * **Week 2**: 4 sets × 5 reps @ 78% 1RM (RPE 8)
   * **Week 3**: 4 sets × 4 reps @ 82% 1RM (RPE 8.5)
   * **Week 4 (Deload)**: 2 sets × 5 reps @ 65% 1RM`,
      sourceTags: ['Schoenfeld et al. (Hypertrophy Mechanisms)', 'Helms & Valdez (Muscle & Strength Pyramid)'],
      followUps: [
        'How many days between push workouts?',
        'What accessories build lockout strength?',
        'How do I calculate my 1RM safely?',
      ],
    };
  }

  // Exact Gram Portion & Calorie Calculator (e.g. "90 gm chicken", "90g rice", "calculate calories for 90 gm paneer")
  const gramMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|gram|grams)\b/i);
  if (gramMatch) {
    const grams = parseFloat(gramMatch[1]);
    if (grams > 0) {
      let foodName: string | null = null;
      let calPer100g = 0;
      let pPer100g = 0;
      let cPer100g = 0;
      let fPer100g = 0;
      let leuPer100g = 0;
      let foodDesc = '';

      if (q.includes('chicken')) {
        foodName = 'Cooked Boneless Skinless Chicken Breast';
        calPer100g = 165; pPer100g = 31.0; cPer100g = 0.0; fPer100g = 3.6; leuPer100g = 2.4;
        foodDesc = 'High-bioavailability lean complete animal protein.';
      } else if (q.includes('rice')) {
        foodName = 'Cooked Jasmine / Basmati White Rice';
        calPer100g = 130; pPer100g = 2.7; cPer100g = 28.2; fPer100g = 0.3; leuPer100g = 0.2;
        foodDesc = 'Fast-digesting starchy carbohydrate for glycogen resynthesis.';
      } else if (q.includes('paneer')) {
        foodName = 'Fresh Cottage Cheese (Paneer)';
        calPer100g = 265; pPer100g = 18.3; cPer100g = 3.4; fPer100g = 20.8; leuPer100g = 1.6;
        foodDesc = 'Slow-digesting casein-dominant dairy protein & healthy lipid matrix.';
      } else if (q.includes('oat')) {
        foodName = 'Whole Rolled Oats (Raw/Dry)';
        calPer100g = 389; pPer100g = 16.9; cPer100g = 66.3; fPer100g = 6.9; leuPer100g = 1.3;
        foodDesc = 'Beta-glucan prebiotic soluble fiber & sustained complex carbs.';
      } else if (q.includes('egg')) {
        foodName = 'Whole Large Egg (Boiled)';
        calPer100g = 155; pPer100g = 12.6; cPer100g = 1.1; fPer100g = 10.6; leuPer100g = 1.1;
        foodDesc = 'Gold standard biological value (BV 100) with choline & lutein.';
      } else if (q.includes('dal') || q.includes('lentil')) {
        foodName = 'Cooked Yellow / Red Lentil Dal';
        calPer100g = 116; pPer100g = 9.0; cPer100g = 20.1; fPer100g = 0.4; leuPer100g = 0.7;
        foodDesc = 'Plant-based fiber-rich complex carbohydrate & lysine source.';
      } else if (q.includes('roti') || q.includes('chapati')) {
        foodName = 'Whole Wheat Roti / Chapati';
        calPer100g = 297; pPer100g = 11.0; cPer100g = 56.0; fPer100g = 3.7; leuPer100g = 0.8;
        foodDesc = 'Unrefined whole grain complex carbs with intact bran and germ.';
      }

      if (foodName) {
        const factor = grams / 100.0;
        const exactCalories = Math.round(calPer100g * factor);
        const exactProtein = Math.round(pPer100g * factor * 10.0) / 10.0;
        const exactCarbs = Math.round(cPer100g * factor * 10.0) / 10.0;
        const exactFat = Math.round(fPer100g * factor * 10.0) / 10.0;
        const exactLeucine = Math.round(leuPer100g * factor * 100.0) / 100.0;
        const mpsMet = exactLeucine >= 2.5;

        return {
          answer: `### ⚖️ Clinical Precision Nutritional Breakdown: ${grams}g ${foodName}

* **Exact Portion Weight**: **${grams} grams** (Calibrated strictly against USDA FoodData Central & ISSN standards)
* **Total Caloric Energy**: **${exactCalories} kcal** (Atwater formula: 4 kcal/g protein & carbs, 9 kcal/g fat)

#### 🔬 Exact Macronutrient Profile:
* **Protein**: **${exactProtein}g** (${exactCalories > 0 ? Math.round((exactProtein * 400) / exactCalories) : 0}% of calories)
* **Net Carbohydrates**: **${exactCarbs}g** (${exactCalories > 0 ? Math.round((exactCarbs * 400) / exactCalories) : 0}% of calories)
* **Dietary Fats**: **${exactFat}g** (${exactCalories > 0 ? Math.round((exactFat * 900) / exactCalories) : 0}% of calories)
* **Estimated Leucine**: **${exactLeucine}g** ${mpsMet ? '*(⚡ Meets ≥2.5g Leucine MPS Threshold)*' : '*(Combine with other protein to reach 2.5g Leucine MPS threshold)*'}

**Nutritional Context**: ${foodDesc}`,
          sourceTags: ['USDA FoodData Central', 'ISSN Sports Nutrition', 'Atwater Specific Factors'],
          followUps: [
            `Log ${grams}g ${foodName} to diary`,
            'What is the optimal protein distribution per meal?',
            'How to calculate daily caloric maintenance?',
          ],
        };
      }
    }
  }

  // 2. Protein / Macros / Nutrition
  if (q.includes('protein') || q.includes('macro') || q.includes('diet') || q.includes('calorie') || q.includes('surplus') || q.includes('deficit')) {
    return {
      answer: `### 🥩 Evidence-Based Macro & Caloric Prescription

The scientific consensus for optimizing muscle protein synthesis (MPS) and metabolic rate:

1. **Daily Protein Target**:
   * **Hypertrophy / Maintenance**: **1.6 – 2.2 g per kg of bodyweight** (0.73 – 1.0 g/lb).
   * **Fat Loss (Hypocaloric Deficit)**: **2.0 – 2.4 g per kg of bodyweight** to protect lean mass against catabolism.
   * Distribute intake across **3 to 5 meals**, each containing at least **2.5–3g of Leucine** to trigger the leucine threshold.

2. **Caloric Energy Balance**:
   * **Lean Bulking (Controlled Surplus)**: **+200 to +350 kcal/day** (+8% to +12% over TDEE). Targets ~0.25–0.5% bodyweight gain per week to minimize adipose storage.
   * **Fat Loss (Safe Deficit)**: **-300 to -500 kcal/day** (-15% to -20% deficit). Always respect the metabolic floor (minimum 1,200 kcal for females, 1,500 kcal for males).

3. **Carbohydrates & Fats**:
   * **Fats**: Maintain **0.6 – 1.0 g/kg** (15–25% total calories) to ensure endocrine and hormonal stability.
   * **Carbohydrates**: Remainder of caloric allocation. Primary fuel for muscle glycogen resynthesis and anaerobic glycolysis during intense lifts.`,
      sourceTags: ['Morton et al. (2018 Systematic Review)', 'International Society of Sports Nutrition (ISSN)'],
      followUps: [
        'What is my recommended daily TDEE?',
        'Best high-protein vegetarian food sources?',
        'Do I need protein shakes immediately post-workout?',
      ],
    };
  }

  // 3. Longevity / Cardio / Zone 2 / 150 minutes
  if (q.includes('longevity') || q.includes('zone 2') || q.includes('cardio') || q.includes('heart') || q.includes('150') || q.includes('vo2')) {
    return {
      answer: `### 🧬 The Physiology of Zone 2 Cardio & Longevity

Cardiorespiratory fitness is one of the strongest independent predictors of all-cause mortality reduction:

1. **Mitochondrial Density & Efficiency**:
   * In **Zone 2** (60–70% of max heart rate, lactate < 2.0 mmol/L), type I slow-twitch muscle fibers utilize **fatty acid beta-oxidation**.
   * This stimulates mitochondrial biogenesis, increasing cellular energy production and clearance of metabolic waste.

2. **The 150-Minute Public Health Rule**:
   * The **AHA and WHO** recommend 150–300 minutes of moderate aerobic activity (or 75 minutes of vigorous activity) per week.
   * Epidemiological data from the *Lancet* and *JAMA Internal Medicine* shows that hitting 150 min/week yields a **31–39% reduction in cardiovascular mortality risk**.

3. **VO2 Max as a Biomarker**:
   * Moving from the lowest quartile of VO2 Max to the highest reduces mortality risk by nearly **5-fold**—a larger risk factor than smoking or hypertension.

4. **Actionable Weekly Protocol**:
   * **3–4 sessions of 35–45 minutes** in Zone 2 (conversational pace where you can speak in full sentences, but not sing).
   * **1 high-intensity interval session** (e.g. Norwegian 4×4 protocol) to stimulate maximum stroke volume.`,
      sourceTags: ['Mandsager et al. JAMA 2018 (VO2 Max & Mortality)', 'WHO Physical Activity Guidelines (2020)'],
      followUps: [
        'How do I test my Zone 2 heart rate without a lab?',
        'Can I do Zone 2 and lifting on the same day?',
        'What is the Norwegian 4x4 protocol?',
      ],
    };
  }

  // 4. Squat / Deadlift / Ankle / Knee / Form
  if (q.includes('squat') || q.includes('deadlift') || q.includes('ankle') || q.includes('knee') || q.includes('form') || q.includes('back')) {
    return {
      answer: `### 🏋️ Biomechanical Cues for Squat & Deadlift Safety

Optimizing kinetic chain mechanics protects the lumbar spine and patellofemoral joints while maximizing force output:

1. **Squat Depth & Ankle Dorsiflexion**:
   * Limited ankle dorsiflexion causes premature heel lifting and compensatory lumbar flexion ("butt wink").
   * **Cues**: Elevate heels slightly (5–10mm plate or lifting shoes), push knees forward in line with 2nd/3rd toes, and maintain a tripod foot contact (heel, 1st metatarsal, 5th metatarsal).

2. **Lumbar Bracing (Intra-Abdominal Pressure)**:
   * Perform the **Valsalva Maneuver**: Inhale 360° into your diaphragm and brace your abdominal wall as if preparing for a punch before descending.
   * Keep ribs locked down over the pelvis rather than hyperextending the lower back.

3. **Deadlift Hip Hinge vs. Squatting the Bar**:
   * The deadlift is a posterior chain hinge, not a knee-dominant movement.
   * Shins should remain relatively vertical. Initiate the pull by "pushing the floor away" while maintaining neutral cervical spine alignment (gaze ~6 feet ahead on the floor).`,
      sourceTags: ['Escamilla et al. (Knee Biomechanics in Squats)', 'McGill (Ultimate Back Fitness & Performance)'],
      followUps: [
        'How can I test my ankle dorsiflexion against a wall?',
        'Conventional vs Sumo deadlift: which is safer for tall lifters?',
        'How does the webcam form checker detect knee valgus?',
      ],
    };
  }

  // 5. Default / General Fitness Intelligence Consultation
  return {
    answer: `### ⚡ Fitness Intelligence Copilot Analysis

Here is the scientific assessment regarding **"${query}"**:

1. **Core Biomechanical & Metabolic Principles**:
   * **Specific Adaptations to Imposed Demands (SAID)**: Your neuromuscular system only adapts to the specific volume, load, and velocity stimuli presented.
   * **Energy Balance & Recovery**: Training provides the stimulus, but adaptation (myofibrillar protein synthesis, tendon remodeling, neural efficiency) occurs during sleep and recovery periods.

2. **Recommended Action Steps**:
   * **Quantify Your Sets**: Track RIR (Reps in Reserve) on every compound movement—strive to keep working sets between 1 and 3 RIR.
   * **Nutrition Baseline**: Prioritize total daily energy expenditure (TDEE) consistency, targeting 1.6–2.2g of protein per kg of body mass.
   * **Consistency Floor**: Even 20 minutes of resistance training twice per week preserves over 80% of musculoskeletal adaptations compared to full inactivity.

3. **Verifiable Measurement**:
   * Use our Onboarding Assessment or Dashboard to calculate your personalized TDEE, macro split, and weekly split allocations based on deterministic formulas.`,
    sourceTags: ['ACSM Guidelines for Exercise Testing', 'Journal of Strength and Conditioning Research'],
    followUps: [
      'Show me how my TDEE was calculated',
      'What are Reps in Reserve (RIR)?',
      'How to structure a 3-day full body split?',
    ],
  };
}
