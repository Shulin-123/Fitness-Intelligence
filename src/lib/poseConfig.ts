// Form Checker Biomechanical Thresholds Configuration
// Documented clinical and athletic reference thresholds for joint-angle state machines.

export const POSE_CONFIG = {
  // Squat Thresholds
  squat: {
    standKneeAngle: 160, // Above 160° is considered standing / top of rep
    parallelKneeAngle: 100, // Below 100° is valid parallel depth
    insufficientDepthThreshold: 108, // Rep reversed before 108° is flagged for insufficient depth
    excessiveTorsoLeanAngle: 45, // Torso pitched forward > 45° from vertical
    kneeValgusRatioThreshold: 0.85, // Knee width / Ankle width ratio drops below 0.85
  },

  // Push-Up Thresholds
  pushUp: {
    topElbowAngle: 155, // Full lockout at top of pushup
    bottomElbowAngle: 90, // Valid 90° depth
    partialRangeThreshold: 98, // Reversed before 98°
    hipSagThresholdAngle: 155, // Hip angle sagging below straight line (<155°)
    hipPikeThresholdAngle: 155, // Hip angle piking upward (<155° inverted)
  },

  // Biceps Curl Thresholds
  bicepsCurl: {
    extendedElbowAngle: 150, // Bottom extension
    flexedElbowAngle: 55, // Peak contraction
    elbowDriftForwardRatio: 0.18, // Elbow drifting forward past shoulder line
    torsoSwingAngle: 15, // Torso rocking back and forth > 15°
  },

  // Smoothing & video constraints
  smoothingFactor: 0.65, // Exponential smoothing weight (0 = raw, 1 = static)
  maxVideoDurationSeconds: 30,
  maxVideoSizeBytes: 50 * 1024 * 1024, // 50 MB
  maxFlagsDisplayed: 3,
};
