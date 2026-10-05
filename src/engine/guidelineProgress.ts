import type { WorkoutSessionLog, Explanation } from '../types';

export interface GuidelineMetric {
  current: number;
  target: number;
  percentage: number;
}

export interface GuidelineProgressResult {
  activeMinutes: GuidelineMetric;
  strengthDays: GuidelineMetric;
  caveat: string;
  explanation: Explanation;
}

/**
 * Computes weekly public-health activity progress against WHO / CDC benchmarks:
 * - 150 minutes of active movement / week
 * - 2 days of muscle-strengthening activity / week
 *
 * Caveat: "These are general public-health guidelines, not a personal prediction."
 */
export function calculateGuidelineProgress(
  sessions: WorkoutSessionLog[],
  referenceDateStr?: string
): GuidelineProgressResult {
  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();

  // Find Monday of the reference date's week (0:00:00)
  const dayOfWeek = refDate.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = (dayOfWeek + 6) % 7; // Days since Monday
  const monday = new Date(refDate);
  monday.setDate(refDate.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Filter completed sessions that fall in this week
  const thisWeekSessions = sessions.filter((s) => {
    if (!s.completed) return false;
    const sessionDate = new Date(s.date);
    return sessionDate >= monday && sessionDate <= sunday;
  });

  // 1. Total active minutes
  const totalMinutes = thisWeekSessions.reduce(
    (sum, s) => sum + (s.durationMinutes || 0),
    0
  );

  // 2. Distinct strength days (sessions with at least 1 completed exercise set)
  const strengthDates = new Set<string>();
  thisWeekSessions.forEach((s) => {
    const hasCompletedSets = s.exercises?.some((ex) =>
      ex.sets?.some((st) => st.completed)
    );
    if (hasCompletedSets || (s.exercises && s.exercises.length > 0)) {
      strengthDates.add(s.date.split('T')[0]);
    }
  });

  const strengthDayCount = strengthDates.size;

  const targetMinutes = 150;
  const targetStrengthDays = 2;

  const minutesPct = Math.min(100, Math.round((totalMinutes / targetMinutes) * 100));
  const strengthPct = Math.min(100, Math.round((strengthDayCount / targetStrengthDays) * 100));

  const caveat = 'These are general public-health guidelines, not a personal prediction.';

  const explanation: Explanation = {
    formula:
      'Active Minutes = Sum(durationMinutes in current week); Strength Days = Distinct days with completed resistance sets in current week.',
    inputs: {
      activeMinutes: totalMinutes,
      targetMinutes,
      strengthDays: strengthDayCount,
      targetStrengthDays,
    },
    ruleFired:
      'WHO/CDC public-health guideline: >=150 min aerobic volume and >=2 days muscle strengthening per week.',
    caveat,
  };

  return {
    activeMinutes: {
      current: totalMinutes,
      target: targetMinutes,
      percentage: minutesPct,
    },
    strengthDays: {
      current: strengthDayCount,
      target: targetStrengthDays,
      percentage: strengthPct,
    },
    caveat,
    explanation,
  };
}
