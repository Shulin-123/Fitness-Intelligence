// MediaPipe Pose Analysis, Joint Angle Calculation & Rep State Machines
// Pure, deterministic biomechanics logic decoupled from video element for 100% testability.

import { POSE_CONFIG } from './poseConfig';
import type { FormCheckerFlag } from '../types';

export interface Landmark2D {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

/**
 * Calculates the internal joint angle in degrees at vertex B formed by line segments AB and BC.
 * Formula: Angle = acos( (BA · BC) / (|BA| × |BC|) )
 */
export function calculateAngle(
  a: Landmark2D,
  b: Landmark2D,
  c: Landmark2D
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360.0 - angle;
  }

  return Math.round(angle * 10) / 10;
}

/**
 * Applies exponential smoothing to minimize camera jitter.
 */
export function smoothAngle(
  previousSmoothed: number | null,
  currentRaw: number,
  factor = POSE_CONFIG.smoothingFactor
): number {
  if (previousSmoothed === null) return currentRaw;
  return Math.round((previousSmoothed * factor + currentRaw * (1 - factor)) * 10) / 10;
}

// MediaPipe Landmark Index Mapping
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

// SQUAT STATE MACHINE
export class SquatStateMachine {
  public state: 'STAND' | 'DESCENDING' | 'BOTTOM' | 'ASCENDING' = 'STAND';
  public repCount = 0;
  public minKneeAngleThisRep = 180;
  public maxForwardLeanThisRep = 0;
  public minKneeAnkleRatioThisRep = 1.0;
  public flags: FormCheckerFlag[] = [];
  private smoothedKneeAngle: number | null = null;

  processFrame(landmarks: Landmark2D[], timestampSeconds: number): {
    kneeAngle: number;
    repCount: number;
    state: string;
  } {
    // Use side with better visibility or average
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];

    const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

    if (!leftHip || !leftKnee || !leftAnkle) {
      return { kneeAngle: 0, repCount: this.repCount, state: this.state };
    }

    const rawKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    this.smoothedKneeAngle = smoothAngle(this.smoothedKneeAngle, rawKneeAngle);
    const kneeAngle = this.smoothedKneeAngle;

    // Track torso lean relative to vertical
    if (leftShoulder) {
      const torsoAngle = Math.abs(
        (Math.atan2(leftShoulder.x - leftHip.x, leftHip.y - leftShoulder.y) * 180) / Math.PI
      );
      if (torsoAngle > this.maxForwardLeanThisRep) {
        this.maxForwardLeanThisRep = torsoAngle;
      }
    }

    // Track knee valgus ratio (knee width / ankle width) if both legs visible
    if (rightKnee && rightAnkle) {
      const kneeDist = Math.abs(leftKnee.x - rightKnee.x);
      const ankleDist = Math.abs(leftAnkle.x - rightAnkle.x) || 0.001;
      const ratio = kneeDist / ankleDist;
      if (ratio < this.minKneeAnkleRatioThisRep) {
        this.minKneeAnkleRatioThisRep = ratio;
      }
    }

    // State Transitions
    switch (this.state) {
      case 'STAND':
        if (kneeAngle < POSE_CONFIG.squat.standKneeAngle - 10) {
          this.state = 'DESCENDING';
          this.minKneeAngleThisRep = kneeAngle;
          this.maxForwardLeanThisRep = 0;
          this.minKneeAnkleRatioThisRep = 1.0;
        }
        break;

      case 'DESCENDING':
        if (kneeAngle < this.minKneeAngleThisRep) {
          this.minKneeAngleThisRep = kneeAngle;
        }
        if (kneeAngle <= POSE_CONFIG.squat.parallelKneeAngle) {
          this.state = 'BOTTOM';
        } else if (kneeAngle > this.minKneeAngleThisRep + 15) {
          // Ascended without hitting full parallel -> possible short rep
          this.state = 'ASCENDING';
        }
        break;

      case 'BOTTOM':
        if (kneeAngle < this.minKneeAngleThisRep) {
          this.minKneeAngleThisRep = kneeAngle;
        }
        if (kneeAngle > POSE_CONFIG.squat.parallelKneeAngle + 10) {
          this.state = 'ASCENDING';
        }
        break;

      case 'ASCENDING':
        if (kneeAngle >= POSE_CONFIG.squat.standKneeAngle) {
          // Completed a rep!
          this.repCount++;
          const currentRepNum = this.repCount;

          // Check for flags
          if (this.minKneeAngleThisRep > POSE_CONFIG.squat.insufficientDepthThreshold) {
            this.addFlag({
              id: `flag-depth-${currentRepNum}`,
              ruleCode: 'INSUFFICIENT_DEPTH',
              message: `Rep ${currentRepNum}: Insufficient depth (reached ${Math.round(this.minKneeAngleThisRep)}°, target <100° parallel).`,
              repNumber: currentRepNum,
              timestampSeconds,
              severity: 'warning',
            });
          }

          if (this.maxForwardLeanThisRep > POSE_CONFIG.squat.excessiveTorsoLeanAngle) {
            this.addFlag({
              id: `flag-lean-${currentRepNum}`,
              ruleCode: 'TORSO_FORWARD_LEAN',
              message: `Rep ${currentRepNum}: Excessive forward torso lean (${Math.round(this.maxForwardLeanThisRep)}° pitch). Keep chest tall.`,
              repNumber: currentRepNum,
              timestampSeconds,
              severity: 'warning',
            });
          }

          if (this.minKneeAnkleRatioThisRep < POSE_CONFIG.squat.kneeValgusRatioThreshold) {
            this.addFlag({
              id: `flag-valgus-${currentRepNum}`,
              ruleCode: 'KNEE_VALGUS',
              message: `Rep ${currentRepNum}: Knees moved inward during ascent. Actively drive knees outward over toes.`,
              repNumber: currentRepNum,
              timestampSeconds,
              severity: 'warning',
            });
          }

          this.state = 'STAND';
        }
        break;
    }

    return { kneeAngle, repCount: this.repCount, state: this.state };
  }

  private addFlag(flag: FormCheckerFlag) {
    if (this.flags.length < POSE_CONFIG.maxFlagsDisplayed) {
      this.flags.push(flag);
    }
  }
}

// PUSH-UP STATE MACHINE
export class PushUpStateMachine {
  public state: 'TOP' | 'DESCENDING' | 'BOTTOM' | 'ASCENDING' = 'TOP';
  public repCount = 0;
  public minElbowAngleThisRep = 180;
  public minHipAngleThisRep = 180;
  public flags: FormCheckerFlag[] = [];
  private smoothedElbowAngle: number | null = null;

  processFrame(landmarks: Landmark2D[], timestampSeconds: number): {
    elbowAngle: number;
    repCount: number;
    state: string;
  } {
    const shoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const elbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    const wrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const hip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const ankle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];

    if (!shoulder || !elbow || !wrist) {
      return { elbowAngle: 0, repCount: this.repCount, state: this.state };
    }

    const rawElbowAngle = calculateAngle(shoulder, elbow, wrist);
    this.smoothedElbowAngle = smoothAngle(this.smoothedElbowAngle, rawElbowAngle);
    const elbowAngle = this.smoothedElbowAngle;

    // Track hip sagging or piking: angle formed by shoulder - hip - ankle
    if (shoulder && hip && ankle) {
      const hipAngle = calculateAngle(shoulder, hip, ankle);
      if (hipAngle < this.minHipAngleThisRep) {
        this.minHipAngleThisRep = hipAngle;
      }
    }

    switch (this.state) {
      case 'TOP':
        if (elbowAngle < POSE_CONFIG.pushUp.topElbowAngle - 15) {
          this.state = 'DESCENDING';
          this.minElbowAngleThisRep = elbowAngle;
          this.minHipAngleThisRep = 180;
        }
        break;

      case 'DESCENDING':
        if (elbowAngle < this.minElbowAngleThisRep) {
          this.minElbowAngleThisRep = elbowAngle;
        }
        if (elbowAngle <= POSE_CONFIG.pushUp.bottomElbowAngle) {
          this.state = 'BOTTOM';
        } else if (elbowAngle > this.minElbowAngleThisRep + 15) {
          this.state = 'ASCENDING';
        }
        break;

      case 'BOTTOM':
        if (elbowAngle < this.minElbowAngleThisRep) {
          this.minElbowAngleThisRep = elbowAngle;
        }
        if (elbowAngle > POSE_CONFIG.pushUp.bottomElbowAngle + 15) {
          this.state = 'ASCENDING';
        }
        break;

      case 'ASCENDING':
        if (elbowAngle >= POSE_CONFIG.pushUp.topElbowAngle - 5) {
          this.repCount++;
          const currentRepNum = this.repCount;

          if (this.minElbowAngleThisRep > POSE_CONFIG.pushUp.partialRangeThreshold) {
            this.addFlag({
              id: `flag-pushup-range-${currentRepNum}`,
              ruleCode: 'PARTIAL_RANGE',
              message: `Rep ${currentRepNum}: Partial range of motion (${Math.round(this.minElbowAngleThisRep)}° reached, lower chest further).`,
              repNumber: currentRepNum,
              timestampSeconds,
              severity: 'warning',
            });
          }

          if (this.minHipAngleThisRep < POSE_CONFIG.pushUp.hipSagThresholdAngle) {
            this.addFlag({
              id: `flag-pushup-sag-${currentRepNum}`,
              ruleCode: 'HIPS_SAGGING_OR_PIKING',
              message: `Rep ${currentRepNum}: Hips sagged or piked (${Math.round(this.minHipAngleThisRep)}°). Brace glutes and maintain rigid plank.`,
              repNumber: currentRepNum,
              timestampSeconds,
              severity: 'warning',
            });
          }

          this.state = 'TOP';
        }
        break;
    }

    return { elbowAngle, repCount: this.repCount, state: this.state };
  }

  private addFlag(flag: FormCheckerFlag) {
    if (this.flags.length < POSE_CONFIG.maxFlagsDisplayed) {
      this.flags.push(flag);
    }
  }
}

// BICEPS CURL STATE MACHINE
export class BicepsCurlStateMachine {
  public state: 'BOTTOM' | 'CONCENTRIC' | 'TOP' | 'ECCENTRIC' = 'BOTTOM';
  public repCount = 0;
  public minElbowAngleThisRep = 180;
  public maxElbowDriftThisRep = 0;
  public flags: FormCheckerFlag[] = [];
  private smoothedElbowAngle: number | null = null;

  processFrame(landmarks: Landmark2D[], timestampSeconds: number): {
    elbowAngle: number;
    repCount: number;
    state: string;
  } {
    const shoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const elbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    const wrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];

    if (!shoulder || !elbow || !wrist) {
      return { elbowAngle: 0, repCount: this.repCount, state: this.state };
    }

    const rawElbowAngle = calculateAngle(shoulder, elbow, wrist);
    this.smoothedElbowAngle = smoothAngle(this.smoothedElbowAngle, rawElbowAngle);
    const elbowAngle = this.smoothedElbowAngle;

    // Track anterior elbow drift (elbow moving forward past shoulder x-coordinate)
    const forwardDrift = elbow.x - shoulder.x;
    if (forwardDrift > this.maxElbowDriftThisRep) {
      this.maxElbowDriftThisRep = forwardDrift;
    }

    switch (this.state) {
      case 'BOTTOM':
        if (elbowAngle < POSE_CONFIG.bicepsCurl.extendedElbowAngle - 15) {
          this.state = 'CONCENTRIC';
          this.minElbowAngleThisRep = elbowAngle;
          this.maxElbowDriftThisRep = 0;
        }
        break;

      case 'CONCENTRIC':
        if (elbowAngle < this.minElbowAngleThisRep) {
          this.minElbowAngleThisRep = elbowAngle;
        }
        if (elbowAngle <= POSE_CONFIG.bicepsCurl.flexedElbowAngle) {
          this.state = 'TOP';
        } else if (elbowAngle > this.minElbowAngleThisRep + 20) {
          this.state = 'ECCENTRIC';
        }
        break;

      case 'TOP':
        if (elbowAngle > POSE_CONFIG.bicepsCurl.flexedElbowAngle + 15) {
          this.state = 'ECCENTRIC';
        }
        break;

      case 'ECCENTRIC':
        if (elbowAngle >= POSE_CONFIG.bicepsCurl.extendedElbowAngle - 10) {
          this.repCount++;
          const currentRepNum = this.repCount;

          if (this.maxElbowDriftThisRep > POSE_CONFIG.bicepsCurl.elbowDriftForwardRatio) {
            this.addFlag({
              id: `flag-curl-drift-${currentRepNum}`,
              ruleCode: 'ELBOW_FORWARD_DRIFT',
              message: `Rep ${currentRepNum}: Elbow drifted forward to cheat the top contraction. Keep elbows pinned to your ribs.`,
              repNumber: currentRepNum,
              timestampSeconds,
              severity: 'warning',
            });
          }

          if (this.minElbowAngleThisRep > 75) {
            this.addFlag({
              id: `flag-curl-range-${currentRepNum}`,
              ruleCode: 'INCOMPLETE_CURL_CONTRACTION',
              message: `Rep ${currentRepNum}: Partial curl height. Squeeze biceps to full flexion at peak.`,
              repNumber: currentRepNum,
              timestampSeconds,
              severity: 'info',
            });
          }

          this.state = 'BOTTOM';
        }
        break;
    }

    return { elbowAngle, repCount: this.repCount, state: this.state };
  }

  private addFlag(flag: FormCheckerFlag) {
    if (this.flags.length < POSE_CONFIG.maxFlagsDisplayed) {
      this.flags.push(flag);
    }
  }
}

/**
 * Draws real-time skeleton overlay with sports-tech orange keypoints.
 */
export function drawPoseSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark2D[],
  canvasWidth: number,
  canvasHeight: number,
  primaryColor = '#FF6B1A'
): void {
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = primaryColor;
  ctx.fillStyle = primaryColor;

  const connections = [
    [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
    [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
    [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
    [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
    [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
    [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
    [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
    [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
    [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
    [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
    [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
    [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
  ];

  // Draw connecting bones
  for (const [startIdx, endIdx] of connections) {
    const p1 = landmarks[startIdx];
    const p2 = landmarks[endIdx];
    if (p1 && p2 && (p1.visibility ?? 1) > 0.4 && (p2.visibility ?? 1) > 0.4) {
      ctx.beginPath();
      ctx.moveTo(p1.x * canvasWidth, p1.y * canvasHeight);
      ctx.lineTo(p2.x * canvasWidth, p2.y * canvasHeight);
      ctx.stroke();
    }
  }

  // Draw joint nodes
  for (let i = 0; i < landmarks.length; i++) {
    const pt = landmarks[i];
    if (pt && (pt.visibility ?? 1) > 0.4) {
      ctx.beginPath();
      ctx.arc(pt.x * canvasWidth, pt.y * canvasHeight, 4.5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  ctx.restore();
}
