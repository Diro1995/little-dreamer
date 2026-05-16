import { differenceInWeeks, differenceInDays, differenceInMonths } from 'date-fns';
import { Baby } from '@/constants/types';

export function getCorrectedAgeWeeks(baby: Baby): number {
  const chronoWeeks = differenceInWeeks(new Date(), baby.dob);
  const premWeeks = baby.prematureWeeks ?? 0;
  return Math.max(0, chronoWeeks - premWeeks);
}

export function formatAge(baby: Baby): string {
  const ageWeeks = getCorrectedAgeWeeks(baby);

  if (ageWeeks < 4) {
    return `${ageWeeks}w old`;
  }

  const months = Math.floor(ageWeeks / 4.33);
  const remainingWeeks = Math.floor(ageWeeks - months * 4.33);

  if (months === 0) {
    return `${ageWeeks} weeks old`;
  }
  if (remainingWeeks === 0) {
    return `${months} month${months !== 1 ? 's' : ''} old`;
  }
  return `${months}mo ${remainingWeeks}wk`;
}

export function getAgeMonths(baby: Baby): number {
  return Math.floor(getCorrectedAgeWeeks(baby) / 4.33);
}
