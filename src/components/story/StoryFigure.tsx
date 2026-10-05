import React from 'react';

export interface StoryFigureProps {
  chapterIndex: number;
  className?: string;
}

export const StoryFigure: React.FC<StoryFigureProps> = ({
  chapterIndex,
  className = '',
}) => {
  // Poses for each chapter index:
  // 0: Assessment: Standing neutral with calibration grid
  // 1: Autoregulation: Squatting position under autoregulated load
  // 2: Vision Form Check: Overhead press / hinge with joint angle arcs
  // 3: Nutrition / Plate: Torso angled toward interactive fuel balance
  // 4: Mastery / Review: Confident upright posture with ascending sparkline

  // Coordinates by chapter (0..4)
  const poses = [
    // Chapter 0: Standing tall, neutral
    {
      head: { x: 200, y: 70 },
      shoulder: { x: 200, y: 110 },
      elbowL: { x: 165, y: 145 },
      wristL: { x: 155, y: 180 },
      elbowR: { x: 235, y: 145 },
      wristR: { x: 245, y: 180 },
      hip: { x: 200, y: 210 },
      kneeL: { x: 185, y: 290 },
      ankleL: { x: 185, y: 370 },
      kneeR: { x: 215, y: 290 },
      ankleR: { x: 215, y: 370 },
      hud: 'BIOENERGETIC SCAN: CALIBRATED',
    },
    // Chapter 1: Squat depth, hips back, knees flexed
    {
      head: { x: 180, y: 140 },
      shoulder: { x: 185, y: 180 },
      elbowL: { x: 150, y: 195 },
      wristL: { x: 165, y: 175 },
      elbowR: { x: 220, y: 195 },
      wristR: { x: 205, y: 175 },
      hip: { x: 170, y: 275 },
      kneeL: { x: 225, y: 295 },
      ankleL: { x: 195, y: 370 },
      kneeR: { x: 240, y: 295 },
      ankleR: { x: 215, y: 370 },
      hud: 'FATIGUE DETECTED: -30% SETS',
    },
    // Chapter 2: Overhead press / arms high, precise form angle
    {
      head: { x: 200, y: 90 },
      shoulder: { x: 200, y: 130 },
      elbowL: { x: 160, y: 80 },
      wristL: { x: 165, y: 35 },
      elbowR: { x: 240, y: 80 },
      wristR: { x: 235, y: 35 },
      hip: { x: 200, y: 220 },
      kneeL: { x: 185, y: 295 },
      ankleL: { x: 180, y: 370 },
      kneeR: { x: 215, y: 295 },
      ankleR: { x: 220, y: 370 },
      hud: 'ON-DEVICE VISION: 180° LOCKOUT',
    },
    // Chapter 3: One hand reaching to macro plate
    {
      head: { x: 190, y: 80 },
      shoulder: { x: 195, y: 120 },
      elbowL: { x: 160, y: 155 },
      wristL: { x: 150, y: 190 },
      elbowR: { x: 235, y: 135 },
      wristR: { x: 275, y: 130 }, // Extended toward plate
      hip: { x: 195, y: 215 },
      kneeL: { x: 185, y: 290 },
      ankleL: { x: 185, y: 370 },
      kneeR: { x: 210, y: 290 },
      ankleR: { x: 215, y: 370 },
      hud: 'MACRO BALANCE: 150G PROTEIN',
    },
    // Chapter 4: Upright athletic finish, arms outward in triumph
    {
      head: { x: 200, y: 65 },
      shoulder: { x: 200, y: 105 },
      elbowL: { x: 155, y: 130 },
      wristL: { x: 130, y: 100 },
      elbowR: { x: 245, y: 130 },
      wristR: { x: 270, y: 100 },
      hip: { x: 200, y: 205 },
      kneeL: { x: 180, y: 285 },
      ankleL: { x: 175, y: 370 },
      kneeR: { x: 220, y: 285 },
      ankleR: { x: 225, y: 370 },
      hud: 'WEEKLY REVIEW: +2.4% ADHERENCE',
    },
  ];

  const current = poses[Math.max(0, Math.min(poses.length - 1, chapterIndex))];

  return (
    <div
      className={`relative w-full aspect-[4/5] max-w-[380px] mx-auto flex items-center justify-center select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 440"
        className="w-full h-full filter drop-shadow-[0_0_20px_rgba(255,107,26,0.18)] transition-all duration-500 ease-out"
      >
        <defs>
          <linearGradient id="storyGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B1A" />
            <stop offset="100%" stopColor="#FFB547" />
          </linearGradient>
          <radialGradient id="stageSpotlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6B1A" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0F0B09" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Stage Spotlight */}
        <ellipse cx="200" cy="220" rx="160" ry="180" fill="url(#stageSpotlight)" />

        {/* Floor Line */}
        <line
          x1="80"
          y1="372"
          x2="320"
          y2="372"
          stroke="rgba(255, 235, 220, 0.12)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Chapter 0: Caliper Scan Arc */}
        {chapterIndex === 0 && (
          <g className="animate-pulse">
            <circle
              cx={current.head.x}
              cy={current.head.y + 40}
              r="75"
              fill="none"
              stroke="#FFB547"
              strokeWidth="1"
              strokeDasharray="3 4"
              opacity="0.4"
            />
          </g>
        )}

        {/* Chapter 2: Angle Arc on Elbow */}
        {chapterIndex === 2 && (
          <g>
            <circle
              cx={current.elbowR.x}
              cy={current.elbowR.y}
              r="18"
              fill="none"
              stroke="#FF6B1A"
              strokeWidth="1.5"
              strokeDasharray="3 2"
              opacity="0.8"
            />
            <text
              x={current.elbowR.x + 22}
              y={current.elbowR.y + 4}
              fill="#FFB547"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              92°
            </text>
          </g>
        )}

        {/* Chapter 3: Floating Nutrient Ring near Hand */}
        {chapterIndex === 3 && (
          <g transform={`translate(${current.wristR.x + 25}, ${current.wristR.y - 15})`}>
            <circle cx="0" cy="0" r="16" fill="#17110E" stroke="#FF6B1A" strokeWidth="2" />
            <circle
              cx="0"
              cy="0"
              r="16"
              fill="none"
              stroke="#FFB547"
              strokeWidth="2.5"
              strokeDasharray="50 50"
            />
            <text x="0" y="3" textAnchor="middle" fill="#FFF4EC" fontSize="8" fontWeight="bold">
              KCAL
            </text>
          </g>
        )}

        {/* Chapter 4: Ascending Sparkline Curve */}
        {chapterIndex === 4 && (
          <path
            d="M 90 320 Q 140 310, 190 280 T 310 210"
            fill="none"
            stroke="#FF6B1A"
            strokeWidth="2"
            strokeDasharray="4 2"
            opacity="0.6"
          />
        )}

        {/* Head */}
        <circle
          cx={current.head.x}
          cy={current.head.y}
          r="14"
          fill="#17110E"
          stroke="url(#storyGlowGrad)"
          strokeWidth="2.5"
        />

        {/* Neck */}
        <line
          x1={current.head.x}
          y1={current.head.y + 14}
          x2={current.shoulder.x}
          y2={current.shoulder.y}
          stroke="url(#storyGlowGrad)"
          strokeWidth="3"
        />

        {/* Spine */}
        <line
          x1={current.shoulder.x}
          y1={current.shoulder.y}
          x2={current.hip.x}
          y2={current.hip.y}
          stroke="url(#storyGlowGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Left Arm */}
        <line
          x1={current.shoulder.x}
          y1={current.shoulder.y}
          x2={current.elbowL.x}
          y2={current.elbowL.y}
          stroke="#FF6B1A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1={current.elbowL.x}
          y1={current.elbowL.y}
          x2={current.wristL.x}
          y2={current.wristL.y}
          stroke="#FF6B1A"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Right Arm */}
        <line
          x1={current.shoulder.x}
          y1={current.shoulder.y}
          x2={current.elbowR.x}
          y2={current.elbowR.y}
          stroke="#FF6B1A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1={current.elbowR.x}
          y1={current.elbowR.y}
          x2={current.wristR.x}
          y2={current.wristR.y}
          stroke="#FF6B1A"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Left Leg */}
        <line
          x1={current.hip.x}
          y1={current.hip.y}
          x2={current.kneeL.x}
          y2={current.kneeL.y}
          stroke="url(#storyGlowGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1={current.kneeL.x}
          y1={current.kneeL.y}
          x2={current.ankleL.x}
          y2={current.ankleL.y}
          stroke="url(#storyGlowGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Right Leg */}
        <line
          x1={current.hip.x}
          y1={current.hip.y}
          x2={current.kneeR.x}
          y2={current.kneeR.y}
          stroke="url(#storyGlowGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1={current.kneeR.x}
          y1={current.kneeR.y}
          x2={current.ankleR.x}
          y2={current.ankleR.y}
          stroke="url(#storyGlowGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Joint Nodes */}
        {[
          current.head,
          current.shoulder,
          current.elbowL,
          current.wristL,
          current.elbowR,
          current.wristR,
          current.hip,
          current.kneeL,
          current.ankleL,
          current.kneeR,
          current.ankleR,
        ].map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r="4" fill="#FF6B1A" />
            <circle cx={pt.x} cy={pt.y} r="7" stroke="#FFB547" strokeWidth="1" fill="none" opacity="0.6" />
          </g>
        ))}

        {/* HUD readout at bottom of stage */}
        <g transform="translate(200, 412)">
          <rect
            x="-140"
            y="-14"
            width="280"
            height="22"
            rx="4"
            fill="#17110E"
            stroke="rgba(255, 235, 220, 0.09)"
          />
          <text
            x="0"
            y="1"
            textAnchor="middle"
            fill="#FFB547"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
            letterSpacing="0.08em"
          >
            {current.hud}
          </text>
        </g>
      </svg>
    </div>
  );
};
