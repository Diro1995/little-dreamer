import { subDays, differenceInMinutes, isAfter } from 'date-fns';
import { Baby, LogEntry, WakeWindowRange, NapPrediction, SleepScore } from '@/constants/types';
import { getCorrectedAgeWeeks } from './age';

export function getAgeAppropriateWakeWindow(ageWeeks: number): WakeWindowRange {
  if (ageWeeks < 6)  return { minMinutes: 45,  maxMinutes: 60  };
  if (ageWeeks < 12) return { minMinutes: 60,  maxMinutes: 90  };
  if (ageWeeks < 16) return { minMinutes: 75,  maxMinutes: 120 };
  if (ageWeeks < 24) return { minMinutes: 120, maxMinutes: 180 };
  if (ageWeeks < 40) return { minMinutes: 150, maxMinutes: 210 };
  if (ageWeeks < 52) return { minMinutes: 180, maxMinutes: 240 };
  return { minMinutes: 240, maxMinutes: 360 };
}

// Returns minutes the baby has been awake since their last completed sleep.
// Requires activeSleep so it never infers sleep state from entry data.
export function calculateCurrentWakeTime(
  logs: LogEntry[],
  activeSleep: LogEntry | null
): number {
  if (activeSleep) return 0; // explicitly sleeping — no wake time

  // Only consider completed sleeps (endTime is required)
  const lastCompletedSleep = [...logs]
    .filter((l) => l.type === 'sleep' && l.endTime != null)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];

  if (!lastCompletedSleep?.endTime) return 0;

  return Math.max(0, differenceInMinutes(new Date(), lastCompletedSleep.endTime));
}

function getObservedWakeWindows(logs: LogEntry[], days = 7): number[] {
  const cutoff = subDays(new Date(), days);
  // Only use completed sleeps
  const sleepLogs = logs
    .filter((l) => l.type === 'sleep' && isAfter(l.startTime, cutoff) && l.endTime != null)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const windows: number[] = [];
  for (let i = 1; i < sleepLogs.length; i++) {
    const prev = sleepLogs[i - 1];
    const curr = sleepLogs[i];
    if (prev.endTime) {
      const gap = differenceInMinutes(curr.startTime, prev.endTime);
      if (gap > 10 && gap < 600) windows.push(gap);
    }
  }
  return windows;
}

// activeSleep must be passed so the engine never infers sleep state from raw entries.
export function predictNextNap(
  baby: Baby,
  recentLogs: LogEntry[],
  activeSleep: LogEntry | null
): NapPrediction {
  // Baby is currently sleeping — no prediction to make
  if (activeSleep) {
    return { predictedTime: null, minutesUntil: null, confidence: 'low', isApproaching: false };
  }

  const ageWeeks = getCorrectedAgeWeeks(baby);
  const agePrior = getAgeAppropriateWakeWindow(ageWeeks);
  const ageMidpoint = (agePrior.minMinutes + agePrior.maxMinutes) / 2;

  const observed = getObservedWakeWindows(recentLogs);
  const currentWakeMinutes = calculateCurrentWakeTime(recentLogs, activeSleep);

  // Not enough real data yet — don't show a prediction
  if (observed.length === 0) {
    return { predictedTime: null, minutesUntil: null, confidence: 'low', isApproaching: false };
  }

  let predictedWakeWindow: number;
  let confidence: 'low' | 'medium' | 'high';

  if (observed.length < 5) {
    const observedAvg = observed.reduce((a, b) => a + b, 0) / observed.length;
    const weight = Math.min(observed.length / 10, 0.5);
    predictedWakeWindow = ageMidpoint * (1 - weight) + observedAvg * weight;
    confidence = 'medium';
  } else {
    const observedAvg = observed.reduce((a, b) => a + b, 0) / observed.length;
    const weight = Math.min(observed.length / 14, 0.8);
    predictedWakeWindow = ageMidpoint * (1 - weight) + observedAvg * weight;
    confidence = 'high';
  }

  const minutesUntilNap = Math.max(0, predictedWakeWindow - currentWakeMinutes);
  const predictedTime = new Date(Date.now() + minutesUntilNap * 60000);
  const isApproaching = minutesUntilNap <= 20 && minutesUntilNap >= 0;

  return { predictedTime, minutesUntil: minutesUntilNap, confidence, isApproaching };
}

export function getSleepInsight(ageWeeks: number): { emoji: string; message: string } {
  const months = Math.round(ageWeeks / 4.33);

  if (ageWeeks < 6) {
    return {
      emoji: '🌱',
      message: `Newborns need 4–5 short naps spread through the day. Wake windows are tiny right now — just 45–60 minutes before they're ready to sleep again. Overtiredness sneaks up fast, so watch for yawns and eye rubbing.`,
    };
  }
  if (ageWeeks < 12) {
    return {
      emoji: '🌙',
      message: `At ${months} months, most babies take 4–5 naps a day with wake windows of about 60–90 minutes. Sleep still feels unpredictable — that's completely normal right now.`,
    };
  }
  if (ageWeeks < 20) {
    return {
      emoji: '☀️',
      message: `At ${months} months, expect 3–4 naps with wake windows of 75–120 minutes. The 4-month sleep regression can shake things up around now — it's a sign their sleep cycles are maturing. You've got this!`,
    };
  }
  if (ageWeeks < 32) {
    return {
      emoji: '✨',
      message: `Most ${months}-month-olds do well with 3 naps and can handle about 1.5–2.5 hours of wake time. Naps tend to get a bit longer and more predictable through this stretch.`,
    };
  }
  if (ageWeeks < 40) {
    return {
      emoji: '🌟',
      message: `Around ${months} months, many babies start transitioning to 2 naps. Wake windows stretch to 2.5–3.5 hours. If the third nap turns into a wrestling match, that's a hint it might be time to drop it.`,
    };
  }
  if (ageWeeks < 52) {
    return {
      emoji: '🌈',
      message: `At ${months} months, 2 naps is the sweet spot. Wake windows land around 3–4 hours. A consistent morning wake time makes the whole day more predictable — even on rough nights.`,
    };
  }
  if (ageWeeks < 72) {
    return {
      emoji: '⭐',
      message: `At this stage, 1–2 naps a day is typical. The 2-to-1 nap transition usually happens between 14–18 months. Wake windows of 4–5 hours are normal, and a post-lunch nap tends to work best.`,
    };
  }
  return {
    emoji: '🌞',
    message: `Most toddlers this age are down to 1 nap a day, usually after lunch. They can handle 5–6 hours of wake time comfortably. A predictable routine really pays off at this stage.`,
  };
}

export function getSleepScore(logs: LogEntry[], days = 7): SleepScore {
  const cutoff = subDays(new Date(), days);
  // Only score completed sleeps
  const sleepLogs = logs.filter(
    (l) => l.type === 'sleep' && isAfter(l.startTime, cutoff) && l.durationMinutes
  );

  if (sleepLogs.length === 0) {
    return { totalHours: 0, avgNapCount: 0, avgNightStretch: 0, score: 0, bestNight: null };
  }

  const totalMinutes = sleepLogs.reduce((sum, l) => sum + (l.durationMinutes ?? 0), 0);
  const totalHours = totalMinutes / 60;
  const avgNapCount = sleepLogs.length / days;

  const nightSleeps = sleepLogs.filter((l) => {
    const hour = l.startTime.getHours();
    return hour >= 19 || hour < 7;
  });
  const avgNightStretch =
    nightSleeps.length > 0
      ? nightSleeps.reduce((s, l) => s + (l.durationMinutes ?? 0), 0) / nightSleeps.length / 60
      : 0;

  let bestNight: { date: Date; hours: number } | null = null;
  for (const l of nightSleeps) {
    const hours = (l.durationMinutes ?? 0) / 60;
    if (!bestNight || hours > bestNight.hours) {
      bestNight = { date: l.startTime, hours };
    }
  }

  const score = Math.min(10, (totalHours / days / 14) * 10);

  return { totalHours, avgNapCount, avgNightStretch, score, bestNight };
}
