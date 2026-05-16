import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated as RNAnimated } from 'react-native';
import { Colors } from '@/constants/theme';

interface StatPillProps {
  value: string;
  label: string;
  color: string;
  onPress?: () => void;
}

function StatPill({ value, label, color, onPress }: StatPillProps) {
  const animVal = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.timing(animVal, {
      toValue: 1,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [value]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: `${color}15`,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: `${color}25`,
        paddingVertical: 14,
        alignItems: 'center',
      }}
      activeOpacity={0.7}
    >
      <Text style={{ color: Colors.moonrise, fontSize: 28, fontFamily: 'DMSans_700Bold', fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
      <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface TodaySummaryProps {
  feeds: number;
  sleepHours: number;
  diapers: number;
  onPressFeeds?: () => void;
  onPressSleep?: () => void;
  onPressDiapers?: () => void;
}

export function TodaySummary({
  feeds,
  sleepHours,
  diapers,
  onPressFeeds,
  onPressSleep,
  onPressDiapers,
}: TodaySummaryProps) {
  return (
    <View>
      <Text
        style={{
          color: Colors.starlight,
          fontSize: 11,
          fontFamily: 'DMSans_500Medium',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        Today
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <StatPill
          value={String(feeds)}
          label="Feeds"
          color={Colors.feedGlow}
          onPress={onPressFeeds}
        />
        <StatPill
          value={`${sleepHours}h`}
          label="Sleep"
          color={Colors.sleepGlow}
          onPress={onPressSleep}
        />
        <StatPill
          value={String(diapers)}
          label="Diapers"
          color={Colors.diaperGlow}
          onPress={onPressDiapers}
        />
      </View>
    </View>
  );
}
