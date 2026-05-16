import { subDays, format, startOfDay, differenceInMinutes } from 'date-fns';
import { LogEntry, EventType } from '@/constants/types';

export function getTodayStats(entries: LogEntry[]) {
  const today = startOfDay(new Date());
  const todayEntries = entries.filter((e) => e.startTime >= today);

  const feeds = todayEntries.filter(
    (e) => e.type === 'feed_breast' || e.type === 'feed_bottle' || e.type === 'feed_solid'
  ).length;

  const sleepMinutes = todayEntries
    .filter((e) => e.type === 'sleep' && e.durationMinutes)
    .reduce((sum, e) => sum + (e.durationMinutes ?? 0), 0);

  const diapers = todayEntries.filter((e) => e.type === 'diaper').length;

  return {
    feeds,
    sleepHours: Math.round((sleepMinutes / 60) * 10) / 10,
    diapers,
  };
}

export function getWeeklySleeData(entries: LogEntry[]) {
  const days = 7;
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    const dayStr = format(date, 'yyyy-MM-dd');
    const daySleeps = entries.filter(
      (e) => e.type === 'sleep' && format(e.startTime, 'yyyy-MM-dd') === dayStr && e.durationMinutes
    );
    const napMinutes = daySleeps
      .filter((e) => {
        const hour = e.startTime.getHours();
        return hour >= 7 && hour < 19;
      })
      .reduce((s, e) => s + (e.durationMinutes ?? 0), 0);
    const nightMinutes = daySleeps
      .filter((e) => {
        const hour = e.startTime.getHours();
        return hour >= 19 || hour < 7;
      })
      .reduce((s, e) => s + (e.durationMinutes ?? 0), 0);

    return {
      date,
      label: format(date, 'EEE'),
      napHours: napMinutes / 60,
      nightHours: nightMinutes / 60,
      totalHours: (napMinutes + nightMinutes) / 60,
    };
  });
}

export function getFeedHeatmap(entries: LogEntry[]) {
  const feedEntries = entries.filter(
    (e) =>
      (e.type === 'feed_breast' || e.type === 'feed_bottle') &&
      e.startTime >= subDays(new Date(), 7)
  );

  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

  for (const e of feedEntries) {
    const dayIndex = 6 - Math.floor(
      (Date.now() - e.startTime.getTime()) / (1000 * 60 * 60 * 24)
    );
    const hour = e.startTime.getHours();
    if (dayIndex >= 0 && dayIndex < 7) {
      grid[dayIndex][hour]++;
    }
  }

  return grid;
}

export function getNapScatterData(entries: LogEntry[]) {
  return entries
    .filter(
      (e) =>
        e.type === 'sleep' &&
        e.startTime >= subDays(new Date(), 14) &&
        e.startTime.getHours() >= 7 &&
        e.startTime.getHours() < 19
    )
    .map((e) => ({
      date: e.startTime,
      minuteOfDay: e.startTime.getHours() * 60 + e.startTime.getMinutes(),
      durationMinutes: e.durationMinutes ?? 0,
    }));
}
