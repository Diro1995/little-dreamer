import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { differenceInMinutes, format } from 'date-fns';
import { Colors } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { NapPrediction as NapPredictionType } from '@/constants/types';

interface NapPredictionProps {
  prediction: NapPredictionType;
}

export function NapPredictionCard({ prediction }: NapPredictionProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  if (!prediction.predictedTime || prediction.confidence === 'low') return null;

  const { predictedTime } = prediction;

  // Recompute live from real clock every tick
  const minutesUntil = Math.max(0, differenceInMinutes(predictedTime, new Date()));
  const isApproaching = minutesUntil <= 20;
  const color = isApproaching ? Colors.aurora : Colors.sleepGlow;

  const minutesLabel =
    minutesUntil < 60
      ? `In ${minutesUntil}m`
      : `In ${Math.floor(minutesUntil / 60)}h ${minutesUntil % 60}m`;

  return (
    <Card glowColor={color} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: `${color}20`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 22 }}>🌙</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 1 }}>
          {isApproaching ? '⚡ Nap window approaching' : 'Next nap'}
        </Text>
        <Text style={{ color: Colors.moonrise, fontSize: 20, fontFamily: 'DMSans_700Bold', marginTop: 2 }}>
          ~{format(predictedTime, 'h:mm a')}
        </Text>
      </View>
      <Text style={{ color, fontSize: 14, fontFamily: 'DMSans_500Medium' }}>
        {minutesUntil === 0 ? 'Now' : minutesLabel}
      </Text>
    </Card>
  );
}
