import { describe, it, expect } from 'vitest';
import { calculateGuidelineProgress } from '../src/engine/guidelineProgress';
import type { WorkoutSessionLog } from '../src/types';

describe('calculateGuidelineProgress (Longevity Public-Health Guidelines)', () => {
  it('returns 0 progress and exact clinical caveat when no sessions exist', () => {
    const result = calculateGuidelineProgress([], '2026-10-04T12:00:00.000Z');

    expect(result.activeMinutes.current).toBe(0);
    expect(result.activeMinutes.target).toBe(150);
    expect(result.activeMinutes.percentage).toBe(0);

    expect(result.strengthDays.current).toBe(0);
    expect(result.strengthDays.target).toBe(2);
    expect(result.strengthDays.percentage).toBe(0);

    expect(result.caveat).toBe(
      'These are general public-health guidelines, not a personal prediction.'
    );
    expect(result.explanation.caveat).toBe(
      'These are general public-health guidelines, not a personal prediction.'
    );
  });

  it('aggregates minutes and distinct strength days within the reference week', () => {
    // 2026-10-04 is Sunday.
    // The week runs from Monday 2026-09-28 to Sunday 2026-10-04.
    const mockSessions: WorkoutSessionLog[] = [
      {
        id: 's1',
        date: '2026-09-29T10:00:00.000Z', // Tuesday (in week)
        planDayTitle: 'Upper Body A',
        durationMinutes: 50,
        completed: true,
        exercises: [
          {
            exerciseId: 'bench-press',
            exerciseName: 'Bench Press',
            sets: [{ setNumber: 1, reps: 10, weightKg: 60, completed: true }],
          },
        ],
      },
      {
        id: 's2',
        date: '2026-10-01T10:00:00.000Z', // Thursday (in week)
        planDayTitle: 'Lower Body A',
        durationMinutes: 45,
        completed: true,
        exercises: [
          {
            exerciseId: 'squat',
            exerciseName: 'Squat',
            sets: [{ setNumber: 1, reps: 8, weightKg: 80, completed: true }],
          },
        ],
      },
      {
        id: 's3',
        date: '2026-10-03T10:00:00.000Z', // Saturday (in week)
        planDayTitle: 'Cardio Intervals',
        durationMinutes: 30,
        completed: true,
        exercises: [],
      },
      {
        id: 's4_uncompleted',
        date: '2026-10-02T10:00:00.000Z', // in week but incomplete
        planDayTitle: 'Incomplete Session',
        durationMinutes: 60,
        completed: false,
        exercises: [],
      },
      {
        id: 's5_past_week',
        date: '2026-09-20T10:00:00.000Z', // Outside week
        planDayTitle: 'Past Session',
        durationMinutes: 60,
        completed: true,
        exercises: [],
      },
    ];

    const result = calculateGuidelineProgress(mockSessions, '2026-10-04T12:00:00.000Z');

    // Total minutes in week: 50 + 45 + 30 = 125 minutes
    expect(result.activeMinutes.current).toBe(125);
    expect(result.activeMinutes.target).toBe(150);
    expect(result.activeMinutes.percentage).toBe(83); // 125 / 150 = 83%

    // Distinct strength days in week: Tuesday (s1) and Thursday (s2) = 2 days
    expect(result.strengthDays.current).toBe(2);
    expect(result.strengthDays.target).toBe(2);
    expect(result.strengthDays.percentage).toBe(100);
  });

  it('caps percentages at 100% when targets are exceeded', () => {
    const mockSessions: WorkoutSessionLog[] = [
      {
        id: 's1',
        date: '2026-09-29T10:00:00.000Z',
        planDayTitle: 'Heavy Session 1',
        durationMinutes: 100,
        completed: true,
        exercises: [{ exerciseId: 'deadlift', exerciseName: 'Deadlift', sets: [{ setNumber: 1, reps: 5, weightKg: 100, completed: true }] }],
      },
      {
        id: 's2',
        date: '2026-09-30T10:00:00.000Z',
        planDayTitle: 'Heavy Session 2',
        durationMinutes: 100,
        completed: true,
        exercises: [{ exerciseId: 'press', exerciseName: 'Overhead Press', sets: [{ setNumber: 1, reps: 5, weightKg: 50, completed: true }] }],
      },
      {
        id: 's3',
        date: '2026-10-01T10:00:00.000Z',
        planDayTitle: 'Heavy Session 3',
        durationMinutes: 60,
        completed: true,
        exercises: [{ exerciseId: 'row', exerciseName: 'Barbell Row', sets: [{ setNumber: 1, reps: 8, weightKg: 60, completed: true }] }],
      },
    ];

    const result = calculateGuidelineProgress(mockSessions, '2026-10-04T12:00:00.000Z');

    expect(result.activeMinutes.current).toBe(260);
    expect(result.activeMinutes.percentage).toBe(100); // capped

    expect(result.strengthDays.current).toBe(3);
    expect(result.strengthDays.percentage).toBe(100); // capped
  });
});
