export const Colors = {
  midnight: '#EEF2FF',
  dusk: 'rgba(255,255,255,0.85)',
  twilight: 'rgba(215,212,248,0.85)',
  aurora: '#A0722A',
  auroraLight: '#C49040',
  moonrise: '#1C1A38',
  starlight: '#6A6898',
  sleepGlow: '#5468C4',
  feedGlow: '#C4723A',
  diaperGlow: '#3AAA8C',
  pumpGlow: '#9A4AC4',
  tempGlow: '#C87030',
  medsGlow: '#2AAABB',
  journalGlow: '#A0722A',
  success: '#2A9E68',
  warning: '#B89820',
  danger: '#C43A3A',
  border: 'rgba(100,90,180,0.15)',
  cardBg: 'rgba(255,255,255,0.52)',
  // Gradient background blobs
  gradientBase: '#EEF2FF',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 14,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const EventColors: Record<string, string> = {
  sleep: Colors.sleepGlow,
  feed_breast: Colors.feedGlow,
  feed_bottle: Colors.feedGlow,
  feed_solid: Colors.feedGlow,
  diaper: Colors.diaperGlow,
  pump: Colors.pumpGlow,
  medicine: Colors.warning,
  temperature: Colors.tempGlow,
  journal: Colors.journalGlow,
  milestone: Colors.aurora,
  note: Colors.starlight,
};

export const EventLabels: Record<string, string> = {
  sleep: 'Sleep',
  feed_breast: 'Breastfeed',
  feed_bottle: 'Bottle',
  feed_solid: 'Solids',
  diaper: 'Diaper',
  pump: 'Pump',
  medicine: 'Medicine',
  temperature: 'Temperature',
  journal: 'Journal',
  milestone: 'Milestone',
  note: 'Note',
};
