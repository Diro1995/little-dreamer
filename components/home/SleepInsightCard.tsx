import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { getSleepInsight } from '@/lib/sleep-engine';

interface SleepInsightCardProps {
  ageWeeks: number;
}

export function SleepInsightCard({ ageWeeks }: SleepInsightCardProps) {
  const { emoji, message } = getSleepInsight(ageWeeks);

  return (
    <Card glowColor={Colors.aurora}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: `${Colors.aurora}18`,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Text style={{ fontSize: 20 }}>{emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{
            color: Colors.aurora,
            fontSize: 11,
            fontFamily: 'DMSans_500Medium',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 6,
          }}>
            Sleep insight
          </Text>
          <Text style={{
            color: Colors.moonrise,
            fontSize: 14,
            fontFamily: 'DMSans_400Regular',
            lineHeight: 21,
          }}>
            {message}
          </Text>
        </View>
      </View>
    </Card>
  );
}
