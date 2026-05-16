import React from 'react';
import { View, Text } from 'react-native';
import { format, isToday, isYesterday } from 'date-fns';
import { Colors } from '@/constants/theme';

interface DayDividerProps {
  date: Date;
}

export function DayDivider({ date }: DayDividerProps) {
  let label: string;
  if (isToday(date)) label = 'Today';
  else if (isYesterday(date)) label = 'Yesterday';
  else label = format(date, 'EEE, d MMM');

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: Colors.midnight,
      }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
      <Text
        style={{
          color: Colors.starlight,
          fontSize: 11,
          fontFamily: 'DMSans_500Medium',
          textTransform: 'uppercase',
          letterSpacing: 1.2,
          paddingHorizontal: 12,
        }}
      >
        {label}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
    </View>
  );
}
