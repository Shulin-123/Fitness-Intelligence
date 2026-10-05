import { describe, it, expect } from 'vitest';
import {
  calculateAngle,
  smoothAngle,
  SquatStateMachine,
  PushUpStateMachine,
  BicepsCurlStateMachine,
  POSE_LANDMARKS,
  type Landmark2D,
} from '../src/lib/poseAnalysis';

describe('Pose Analysis - Joint Angle Trigonometry', () => {
  it('calculates a 90-degree right angle accurately', () => {
    const a = { x: 0, y: 1 };
    const b = { x: 0, y: 0 };
    const c = { x: 1, y: 0 };
    expect(calculateAngle(a, b, c)).toBe(90.0);
  });

  it('calculates a straight 180-degree angle', () => {
    const a = { x: 0, y: 1 };
    const b = { x: 0, y: 0 };
    const c = { x: 0, y: -1 };
    expect(calculateAngle(a, b, c)).toBe(180.0);
  });

  it('applies exponential smoothing to raw angles', () => {
    const smoothed = smoothAngle(100, 120, 0.5);
    expect(smoothed).toBe(110.0);
  });
});

describe('Pose Analysis - Squat Rep State Machine & Flags', () => {
  function makeSquatFrame(kneeAngleDeg: number): Landmark2D[] {
    const frame: Landmark2D[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 }));

    // Ankle A is straight down from Knee B
    frame[POSE_LANDMARKS.LEFT_ANKLE] = { x: 0.5, y: 0.9, visibility: 1 };
    frame[POSE_LANDMARKS.RIGHT_ANKLE] = { x: 0.6, y: 0.9, visibility: 1 };

    frame[POSE_LANDMARKS.LEFT_KNEE] = { x: 0.5, y: 0.6, visibility: 1 };
    frame[POSE_LANDMARKS.RIGHT_KNEE] = { x: 0.6, y: 0.6, visibility: 1 };

    // Hip C rotated around Knee B by kneeAngleDeg from straight down
    const rad = (kneeAngleDeg * Math.PI) / 180;
    const hipX = 0.5 - 0.3 * Math.sin(rad);
    const hipY = 0.6 + 0.3 * Math.cos(rad);

    frame[POSE_LANDMARKS.LEFT_HIP] = { x: hipX, y: hipY, visibility: 1 };
    // Keep shoulder directly above hip to avoid false forward lean flag in clean rep
    frame[POSE_LANDMARKS.LEFT_SHOULDER] = { x: hipX, y: hipY - 0.4, visibility: 1 };

    return frame;
  }

  it('counts a full clean squat rep from standing to parallel and back', () => {
    const tracker = new SquatStateMachine();

    // 1. Standing initial frames (175°)
    for (let i = 0; i < 5; i++) {
      tracker.processFrame(makeSquatFrame(175), 0.0 + i * 0.1);
    }
    expect(tracker.state).toBe('STAND');

    // 2. Descending (120°)
    for (let i = 0; i < 5; i++) {
      tracker.processFrame(makeSquatFrame(120), 0.5 + i * 0.1);
    }
    expect(tracker.state).toBe('DESCENDING');

    // 3. Bottom parallel (85°)
    for (let i = 0; i < 5; i++) {
      tracker.processFrame(makeSquatFrame(85), 1.0 + i * 0.1);
    }
    expect(tracker.state).toBe('BOTTOM');

    // 4. Ascending (135°)
    for (let i = 0; i < 5; i++) {
      tracker.processFrame(makeSquatFrame(135), 1.5 + i * 0.1);
    }
    expect(tracker.state).toBe('ASCENDING');

    // 5. Standing finish (175°)
    for (let i = 0; i < 8; i++) {
      tracker.processFrame(makeSquatFrame(175), 2.0 + i * 0.1);
    }

    expect(tracker.repCount).toBe(1);
    expect(tracker.flags.length).toBe(0); // Clean rep
  });

  it('flags insufficient depth if rep reverses before breaking parallel', () => {
    const tracker = new SquatStateMachine();

    for (let i = 0; i < 5; i++) {
      tracker.processFrame(makeSquatFrame(175), 0.0 + i * 0.1);
    }

    // Descending to only 115°
    for (let i = 0; i < 5; i++) {
      tracker.processFrame(makeSquatFrame(115), 0.5 + i * 0.1);
    }

    // Ascending early
    for (let i = 0; i < 5; i++) {
      tracker.processFrame(makeSquatFrame(140), 1.0 + i * 0.1);
    }

    // Finish stand
    for (let i = 0; i < 8; i++) {
      tracker.processFrame(makeSquatFrame(175), 1.5 + i * 0.1);
    }

    expect(tracker.repCount).toBe(1);
    expect(tracker.flags.some((f) => f.ruleCode === 'INSUFFICIENT_DEPTH')).toBe(true);
  });
});

describe('Pose Analysis - Push-Up & Biceps Curl State Machines', () => {
  function makePushUpFrame(elbowAngleDeg: number): Landmark2D[] {
    const frame: Landmark2D[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 }));
    // Wrist at (0.3, 0.75), Elbow at (0.3, 0.5) -> BA points straight down
    frame[POSE_LANDMARKS.LEFT_WRIST] = { x: 0.3, y: 0.75, visibility: 1 };
    frame[POSE_LANDMARKS.LEFT_ELBOW] = { x: 0.3, y: 0.5, visibility: 1 };

    // Shoulder at angle elbowAngleDeg from down
    const rad = (elbowAngleDeg * Math.PI) / 180;
    frame[POSE_LANDMARKS.LEFT_SHOULDER] = {
      x: 0.3 + 0.25 * Math.sin(rad),
      y: 0.5 + 0.25 * Math.cos(rad),
      visibility: 1,
    };

    frame[POSE_LANDMARKS.LEFT_HIP] = { x: 0.6, y: 0.5, visibility: 1 };
    frame[POSE_LANDMARKS.LEFT_ANKLE] = { x: 0.9, y: 0.5, visibility: 1 };

    return frame;
  }

  it('counts a push-up rep through bottom lockout cycle', () => {
    const tracker = new PushUpStateMachine();

    // Top lockout (170°)
    for (let i = 0; i < 5; i++) {
      tracker.processFrame(makePushUpFrame(170), 0.0 + i * 0.1);
    }
    // Descend (120°)
    for (let i = 0; i < 5; i++) {
      tracker.processFrame(makePushUpFrame(120), 0.5 + i * 0.1);
    }
    // Bottom (85°)
    for (let i = 0; i < 5; i++) {
      tracker.processFrame(makePushUpFrame(85), 1.0 + i * 0.1);
    }
    // Ascend (130°)
    for (let i = 0; i < 5; i++) {
      tracker.processFrame(makePushUpFrame(130), 1.5 + i * 0.1);
    }
    // Top (170°)
    for (let i = 0; i < 8; i++) {
      tracker.processFrame(makePushUpFrame(170), 2.0 + i * 0.1);
    }

    expect(tracker.repCount).toBe(1);
  });

  function makeCurlFrame(elbowAngleDeg: number, elbowX: number = 0.5): Landmark2D[] {
    const frame: Landmark2D[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 }));
    frame[POSE_LANDMARKS.LEFT_SHOULDER] = { x: 0.5, y: 0.3, visibility: 1 };
    frame[POSE_LANDMARKS.LEFT_ELBOW] = { x: elbowX, y: 0.55, visibility: 1 };

    // Wrist at angle elbowAngleDeg from BA (which points up to shoulder)
    const rad = (elbowAngleDeg * Math.PI) / 180;
    frame[POSE_LANDMARKS.LEFT_WRIST] = {
      x: elbowX + 0.25 * Math.sin(rad),
      y: 0.55 - 0.25 * Math.cos(rad),
      visibility: 1,
    };

    return frame;
  }

  it('counts a biceps curl rep and flags forward elbow drift', () => {
    const tracker = new BicepsCurlStateMachine();

    // Bottom extended (165°)
    for (let i = 0; i < 5; i++) {
      tracker.processFrame(makeCurlFrame(165, 0.5), 0.0 + i * 0.1);
    }

    // Concentric with cheat elbow drift forward to 0.75 (>0.18 threshold)
    for (let i = 0; i < 5; i++) {
      tracker.processFrame(makeCurlFrame(90, 0.75), 0.5 + i * 0.1);
    }

    // Top flexed (45°)
    for (let i = 0; i < 5; i++) {
      tracker.processFrame(makeCurlFrame(45, 0.75), 1.0 + i * 0.1);
    }

    // Eccentric lower
    for (let i = 0; i < 5; i++) {
      tracker.processFrame(makeCurlFrame(100, 0.5), 1.5 + i * 0.1);
    }

    // Bottom finish (165°)
    for (let i = 0; i < 8; i++) {
      tracker.processFrame(makeCurlFrame(165, 0.5), 2.0 + i * 0.1);
    }

    expect(tracker.repCount).toBe(1);
    expect(tracker.flags.some((f) => f.ruleCode === 'ELBOW_FORWARD_DRIFT')).toBe(true);
  });
});
