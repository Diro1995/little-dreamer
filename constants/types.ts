export type EventType =
  | 'sleep'
  | 'feed_breast'
  | 'feed_bottle'
  | 'feed_solid'
  | 'diaper'
  | 'pump'
  | 'medicine'
  | 'temperature'
  | 'journal'
  | 'milestone'
  | 'note';

export type SleepLocation = 'crib' | 'bassinet' | 'arms' | 'carrier' | 'car' | 'other';
export type BreastSide = 'left' | 'right' | 'both';
export type DiaperType = 'wet' | 'dirty' | 'both' | 'dry';
export type CaregiverRole = 'parent' | 'partner' | 'nanny' | 'grandparent';

export type TempUnit = 'C' | 'F';
export type TempMethod = 'Forehead' | 'Ear' | 'Armpit' | 'Rectal';
export type JournalEntryType = 'note' | 'milestone' | 'concern' | 'doctor' | 'reaction';

export interface SavedMedication {
  id: string;
  name: string;
  dose: string;
  unit: 'ml' | 'drops' | 'mg' | 'IU' | 'tablet';
  reminderTime?: string; // "HH:MM"
}

export interface EventMetadata {
  sleepQuality?: 1 | 2 | 3;
  sleepLocation?: SleepLocation;
  breastSide?: BreastSide;
  volumeMl?: number;
  solidFoods?: string[];
  diaperType?: DiaperType;
  leftMl?: number;
  rightMl?: number;
  medicineName?: string;
  doseMl?: number;
  milestoneTitle?: string;
  noteText?: string;
  // Temperature
  tempCelsius?: number;
  tempUnit?: TempUnit;
  tempMethod?: TempMethod;
  // Journal
  journalType?: JournalEntryType;
  journalText?: string;
}

export interface Caregiver {
  id: string;
  name: string;
  role: CaregiverRole;
  avatarColor: string;
}

export interface Baby {
  id: string;
  name: string;
  dob: Date;
  prematureWeeks?: number;
  photoUri?: string;
  weightKg?: number;
  caregivers: Caregiver[];
  savedMedications?: SavedMedication[];
  dayStartHour?: number;  // 0-23, default 6
  dayEndHour?: number;    // 0-23, default 20
}

export interface LogEntry {
  id: string;
  babyId: string;
  caregiverId: string;
  type: EventType;
  startTime: Date;
  endTime?: Date;
  durationMinutes?: number;
  metadata: EventMetadata;
  notes?: string;
  createdAt: Date;
}

export interface WakeWindowRange {
  minMinutes: number;
  maxMinutes: number;
}

export interface NapPrediction {
  predictedTime: Date | null;
  minutesUntil: number | null;
  confidence: 'low' | 'medium' | 'high';
  isApproaching: boolean;
}

export interface SleepScore {
  totalHours: number;
  avgNapCount: number;
  avgNightStretch: number;
  score: number;
  bestNight: { date: Date; hours: number } | null;
}
