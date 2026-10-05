# Architectural Decision Records (ADRs)
## Fitness Intelligence (Phase A Prototype)

This document formalizes the architectural decisions made for the frontend-only implementation of Fitness Intelligence. Every choice prioritizes strict type safety, explainable intelligence, clinical safety gating, zero-network reproducibility, and seamless swappability for a real Phase B backend (Supabase).

---

### ADR-001: Pure Client-Side Ports-and-Adapters Service Layer

- **Status**: Accepted
- **Context**: The Phase A requirement mandated zero backend dependencies, zero API keys, and zero external credentials, while simultaneously demanding that a future Phase B backend (e.g. Supabase, PostgreSQL) can replace local storage without touching a single line of React component UI code.
- **Decision**: Implemented an explicit hexagonal (ports-and-adapters) architectural pattern. All domain actions are declared as pure TypeScript interfaces in `src/services/interfaces.ts` (`IAuthService`, `IProfileService`, `IAssessmentService`, `IPlanService`, `IFoodService`, `IWorkoutService`, `IWeightService`, `IWaterService`, `IReadinessService`, `IWeeklyReviewService`, `IAIService`). A concrete `LocalAdapter` class implements all 11 ports using client `localStorage`. The application accesses services via a singleton dependency injection registry (`src/services/registry.ts`).
- **Consequences**: UI components never touch `localStorage` or `window` primitives directly. In Phase B, a `SupabaseAdapter` implementing the exact same interfaces can be plugged in by changing 1 line in `src/services/registry.ts`.

---

### ADR-002: Deterministic Rules Engine with Explainability Metaschema ("Why this?")

- **Status**: Accepted
- **Context**: Black-box algorithmic fitness recommendations degrade user trust and pose safety liabilities. The application requires an "Explainable by Design" engine where every computed number (BMI, BMR, TDEE, calories, macros, readiness volume cuts, weekly review adjustments) provides an auditable paper trail.
- **Decision**: Established a pure, side-effect-free rules engine in `src/engine/rules.ts` that wraps computed values in an `ExplainedValue<T>` metaschema:
  ```ts
  interface Explanation {
    formula: string;
    inputs: Record<string, string | number | boolean | string[] | undefined | null>;
    ruleFired: string;
    caveat: string;
  }
  ```
  A global React context (`WhyDrawerContext`) connects every metric chip and stat card to a sliding "Why this?" drawer that renders the exact mathematical formula, user inputs, rule trigger, and clinical caveat.
- **Consequences**: Complete mathematical determinism. The calculation logic is 100% unit-tested with 34 tests in `test/rules.test.ts`.

---

### ADR-003: Three-Tier Safety Hierarchy with Axial Load Contraindication Mapping

- **Status**: Accepted
- **Context**: Medical liability and physical wellbeing require strict safety boundaries. Users with cardiovascular red flags or uncontrolled injuries must not receive heavy automated training routines.
- **Decision**: Codified a 3-tier safety status hierarchy:
  1. **GREEN (Full Clearance)**: No exercise-limiting conditions or acute symptoms. Unrestricted exercise library with standard RPE progression (caps at RPE 8-9).
  2. **AMBER (Precaution / Modifications Active)**: Joint limitations, recent cleared surgery, pregnancy, or low BMI (< 18.5) with fat-loss goal. Automatically flags contraindicated exercises and substitutes them with stable, lower-shear alternatives (e.g., Barbell Back Squat → Goblet Squat / Leg Press; Barbell Bench → Machine Chest Press). Caps session intensity at RPE 7.
  3. **RED (Medical Clearance Required)**: Acute symptoms (chest pain, dizziness during exertion, fainting, unmanaged cardiovascular condition). Completely locks workout generation, rendering a dedicated clinical advisory banner and directing the user to a medical physician.
  Furthermore, age < 18 is strictly blocked with a friendly advisory banner during onboarding.
- **Consequences**: Guarantees zero prescription of unsafe mechanical movements for flagged joints while clearly maintaining fitness/wellness non-diagnostic positioning.

---

### ADR-004: In-Browser Edge Biomechanics (MediaPipe PoseLandmarker + Kinematic Vector Geometry)

- **Status**: Accepted
- **Context**: Form checking must execute directly in the user's browser without streaming raw video frames to external third-party cloud servers, guaranteeing absolute privacy while evaluating multi-frame repetitions.
- **Decision**:
  - Integrated `@mediapipe/tasks-vision` PoseLandmarker via client-side WebAssembly.
  - Implemented 3 dedicated finite-state machines (`SquatStateMachine`, `PushUpStateMachine`, `BicepsCurlStateMachine`) that track rep phases (`standing` → `descending` → `bottom` → `ascending` → `completed`).
  - Implemented exponential smoothing ($\alpha = 0.35$) on raw 2D landmark coordinates to eliminate camera jitter.
  - Analyzed 3 clinical flags per exercise with tolerance buffers (e.g. squat depth < 90°, valgus knee collapse, excessive forward torso lean).
  - Provided an instant client-side offline synthetic simulation mode using mathematical cosine kinematics for environments without live camera/WebGL access.
- **Consequences**: Video frames never leave the device. Users can inspect form with high feedback fidelity and instant rep counting.

---

### ADR-005: Dual-Namespace LocalStorage Strategy (`fitness_demo_` vs `fitness_prod_`)

- **Status**: Accepted
- **Context**: Users and evaluators need to experience rich 3-week historical dashboards with trends, heatmaps, and weekly reviews in one click, without corrupting or overwriting their personal custom local storage session.
- **Decision**: In `src/services/localAdapter.ts`, all storage keys dynamically prepend a namespace prefix determined by the active mode:
  - Demo Mode: `fitness_demo_*` (pre-seeded with 21 days of realistic persona data for Alex Morgan: weight loss trend from 79.5kg to 77.8kg, 120+ meal logs, workouts, knee-injury adaptations, and review adjustments).
  - Production Mode: `fitness_prod_*` (clean user state).
  Entering or exiting demo mode toggles the namespace flag and updates the top demo mode ribbon with instant fallback.
- **Consequences**: Evaluators can explore comprehensive trend charts, heatmaps, and reviews immediately without erasing existing personal data.

---

### ADR-006: Sports-Tech Dark Design System & 375px Mobile-First Shell

- **Status**: Accepted
- **Context**: The product positioning is elite, cinematic sports-tech (inspired by Whoop, Apple Fitness, Strava) rather than a generic SaaS template. The app must be ergonomic at 375px viewport on mobile while offering a desktop command rail at >= 1024px.
- **Decision**: Built a custom dark palette:
  - Deep black background (`#0A0A0B`), obsidian surfaces (`#141416`, `#1B1B1F`), hairline borders (`rgba(255,255,255,0.08)`).
  - High-visibility sports-tech neon accent (`#C8FF3D` lime) with emerald (`#4ADE80`), amber (`#FBBF24`), and rose (`#F87171`) for safety tiers.
  - Typography: Inter Tight for punchy, condensed sports-tech numerals and headers.
  - Layout: Adaptive `AppShell` with fixed 44px+ touch targets, mobile bottom bar, and desktop slim icon rail.
- **Consequences**: Visually striking aesthetic, fully responsive across 375px mobile, tablet, and wide desktop viewports.
