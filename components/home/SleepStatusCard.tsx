import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { format, differenceInMinutes } from 'date-fns';
import { Colors } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { LiveTimer } from '@/components/ui/TimeDisplay';
import { ArcProgress } from '@/components/ui/ArcProgress';
import { useLogStore } from '@/store/log.store';
import { useBabyStore } from '@/store/baby.store';
import { getAgeAppropriateWakeWindow } from '@/lib/sleep-engine';
import { getCorrectedAgeWeeks } from '@/lib/age';
import * as Haptics from 'expo-haptics';

export function SleepStatusCard() {
  const { activeSleep, endSleepTimer, entries } = useLogStore();
  const { baby } = useBabyStore();

  const lastSleep = entries.find((e) => e.type === 'sleep' && e.endTime != null);
  const isSleeping = !!activeSleep;

  const [, setTick] = useState(0);
  useEffect(() => {
    if (isSleeping) return;
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, [isSleeping]);

  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (isSleeping) {
      glowOpacity.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    } else {
      glowOpacity.value = 0.4;
    }
  }, [isSleeping]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  const color = isSleeping ? Colors.sleepGlow : Colors.feedGlow;

  const awakeMinutes = lastSleep?.endTime
    ? differenceInMinutes(new Date(), lastSleep.endTime)
    : null;

  const ageWeeks = baby ? getCorrectedAgeWeeks(baby) : 0;
  const wakeWindow = getAgeAppropriateWakeWindow(ageWeeks);
  const expectedWake = (wakeWindow.minMinutes + wakeWindow.maxMinutes) / 2;
  const progress = awakeMinutes != null ? Math.min(awakeMinutes / expectedWake, 1) : 0;

  const handleEndSleep = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await endSleepTimer();
  };

  return (
    <Card glowColor={color} style={{ overflow: 'hidden' }}>
      {/* Glow background */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: color,
            opacity: 0.06,
          },
          glowStyle,
        ]}
        pointerEvents="none"
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text style={{ fontSize: 20 }}>{isSleeping ? '💤' : '☀️'}</Text>
            <Text
              style={{
                color: color,
                fontSize: 11,
                fontFamily: 'DMSans_500Medium',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
              }}
            >
              {isSleeping ? 'Sleeping now' : 'Awake'}
            </Text>
          </View>

          {isSleeping && activeSleep ? (
            <>
              <LiveTimer startTime={activeSleep.startTime} color={Colors.moonrise} size="lg" />
              <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular', marginTop: 4 }}>
                Started at {format(activeSleep.startTime, 'h:mm a')}
              </Text>
            </>
          ) : (
            <>
              {awakeMinutes != null ? (
                <Text style={{ color: Colors.moonrise, fontSize: 28, fontFamily: 'DMSans_700Bold', fontVariant: ['tabular-nums'] }}>
                  {awakeMinutes < 60
                    ? `${awakeMinutes}m`
                    : `${Math.floor(awakeMinutes / 60)}h ${awakeMinutes % 60}m`}
                </Text>
              ) : (
                <Text style={{ color: Colors.starlight, fontSize: 16, fontFamily: 'DMSans_400Regular' }}>
                  No sleep logged yet
                </Text>
              )}
              {awakeMinutes != null && (
                <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular', marginTop: 2 }}>
                  Awake since {lastSleep?.endTime ? format(lastSleep.endTime, 'h:mm a') : '—'}
                </Text>
              )}
            </>
          )}

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            {isSleeping && (
              <TouchableOpacity
                onPress={handleEndSleep}
                style={{
                  backgroundColor: color,
                  borderRadius: 20,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  minHeight: 40,
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: Colors.midnight, fontSize: 14, fontFamily: 'DMSans_700Bold' }}>
                  Baby woke up
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {awakeMinutes != null && !isSleeping && (
          <ArcProgress
            progress={progress}
            size={72}
            color={color}
            strokeWidth={5}
          />
        )}
      </View>
    </Card>
  );
}
