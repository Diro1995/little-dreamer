import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { differenceInMinutes, differenceInSeconds, format } from 'date-fns';
import { Colors } from '@/constants/theme';

interface TimerProps {
  startTime: Date;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LiveTimer({ startTime, color = Colors.moonrise, size = 'md' }: TimerProps) {
  const [elapsed, setElapsed] = useState(differenceInSeconds(new Date(), startTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(differenceInSeconds(new Date(), startTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const fontSizes: Record<string, number> = { sm: 16, md: 24, lg: 40 };
  const fontSize = fontSizes[size];

  const timeStr =
    hours > 0
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <Text
      style={{
        color,
        fontSize,
        fontFamily: 'DMSans_700Bold',
        fontVariant: ['tabular-nums'],
      }}
    >
      {timeStr}
    </Text>
  );
}

interface RelativeTimeProps {
  date: Date;
  style?: object;
}

export function RelativeTime({ date, style }: RelativeTimeProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const minutesAgo = differenceInMinutes(new Date(), date);

  let label: string;
  if (minutesAgo < 1) label = 'just now';
  else if (minutesAgo < 60) label = `${minutesAgo}m ago`;
  else {
    const h = Math.floor(minutesAgo / 60);
    label = `${h}h ago`;
  }

  return (
    <View>
      <Text style={[{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular' }, style]}>
        {label}
      </Text>
      <Text style={{ color: Colors.starlight, fontSize: 10, fontFamily: 'DMSans_400Regular', opacity: 0.6 }}>
        {format(date, 'h:mm a')}
      </Text>
    </View>
  );
}
