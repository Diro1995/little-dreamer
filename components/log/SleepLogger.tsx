import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Switch, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { format, differenceInMinutes } from 'date-fns';
import { Colors } from '@/constants/theme';
import { SleepLocation } from '@/constants/types';
import { useLogStore } from '@/store/log.store';
import { useBabyStore } from '@/store/baby.store';
import { useUIStore } from '@/store/ui.store';
import { Button } from '@/components/ui/Button';
import { LiveTimer } from '@/components/ui/TimeDisplay';

const LOCATIONS: { value: SleepLocation; label: string }[] = [
  { value: 'crib',     label: 'Crib'     },
  { value: 'bassinet', label: 'Bassinet' },
  { value: 'arms',     label: 'Arms'     },
  { value: 'carrier',  label: 'Carrier'  },
  { value: 'car',      label: 'Car'      },
  { value: 'other',    label: 'Other'    },
];

interface SleepLoggerProps {
  onClose: () => void;
}

export function SleepLogger({ onClose }: SleepLoggerProps) {
  const [tab, setTab] = useState<'quick' | 'timer'>('quick');
  const [startTime, setStartTime] = useState(new Date());
  const [stillSleeping, setStillSleeping] = useState(false);
  const [endTime, setEndTime] = useState(new Date());
  const [location, setLocation] = useState<SleepLocation | null>(null);

  const { addEntry, activeSleep, startSleepTimer, endSleepTimer } = useLogStore();
  const { baby, currentCaregiver } = useBabyStore();
  const { showToast } = useUIStore();

  const durationMinutes = stillSleeping
    ? null
    : differenceInMinutes(endTime, startTime);

  const handleQuickLog = async () => {
    if (!baby || !currentCaregiver) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (stillSleeping) {
      // Start the live timer anchored to the chosen start time — this is the
      // only way to mark the baby as currently sleeping so the rest of the app
      // (sleep card, nap prediction) agrees on sleep state.
      await startSleepTimer(baby.id, currentCaregiver.id, startTime);
      showToast('Sleep timer started 💤');
    } else {
      await addEntry({
        babyId: baby.id,
        caregiverId: currentCaregiver.id,
        type: 'sleep',
        startTime,
        endTime,
        durationMinutes: durationMinutes ?? undefined,
        metadata: { sleepLocation: location ?? undefined },
      });
      showToast('Sleep logged ✓');
    }
    onClose();
  };

  const handleStartTimer = async () => {
    if (!baby || !currentCaregiver) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await startSleepTimer(baby.id, currentCaregiver.id);
    showToast('Sleep timer started');
    onClose();
  };

  const handleEndTimer = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await endSleepTimer();
    showToast('Sleep ended ✓');
    onClose();
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={{
          color: Colors.moonrise,
          fontSize: 22,
          fontFamily: 'PlayfairDisplay_400Regular',
          textAlign: 'center',
          marginBottom: 16,
        }}
      >
        Log Sleep
      </Text>

      {/* Tabs */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: Colors.twilight,
          borderRadius: 12,
          padding: 3,
          marginBottom: 24,
        }}
      >
        {(['quick', 'timer'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: tab === t ? Colors.dusk : 'transparent',
            }}
          >
            <Text
              style={{
                color: tab === t ? Colors.moonrise : Colors.starlight,
                fontSize: 14,
                fontFamily: 'DMSans_500Medium',
              }}
            >
              {t === 'quick' ? 'Quick Log' : 'Timer'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'quick' ? (
        <>
          <Text style={labelStyle}>When did they fall asleep?</Text>
          <View style={timePickerWrap}>
            <DateTimePicker
              value={startTime}
              mode="time"
              display="spinner"
              onChange={(_, d) => d && setStartTime(d)}
              style={{ flex: 1 }}
              textColor={Colors.moonrise}
              themeVariant="dark"
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12 }}>
            <Text style={labelStyle}>Still sleeping</Text>
            <Switch
              value={stillSleeping}
              onValueChange={setStillSleeping}
              trackColor={{ false: Colors.twilight, true: Colors.sleepGlow }}
              thumbColor={Colors.moonrise}
            />
          </View>

          {!stillSleeping && (
            <>
              <Text style={labelStyle}>When did they wake up?</Text>
              <View style={timePickerWrap}>
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  display="spinner"
                  onChange={(_, d) => d && setEndTime(d)}
                  style={{ flex: 1 }}
                  textColor={Colors.moonrise}
                  themeVariant="dark"
                />
              </View>
            </>
          )}

          {durationMinutes != null && durationMinutes > 0 && (
            <View style={{ alignItems: 'center', marginVertical: 8 }}>
              <Text style={{ color: Colors.aurora, fontSize: 28, fontFamily: 'DMSans_700Bold' }}>
                {durationMinutes < 60
                  ? `${durationMinutes} min`
                  : `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`}
              </Text>
            </View>
          )}

          <Text style={[labelStyle, { marginTop: 8 }]}>Where? (optional)</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 20 }}>
            {LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc.value}
                onPress={() => setLocation(location === loc.value ? null : loc.value)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 99,
                  backgroundColor: location === loc.value ? `${Colors.sleepGlow}30` : Colors.twilight,
                  borderWidth: 1,
                  borderColor: location === loc.value ? Colors.sleepGlow : Colors.border,
                }}
              >
                <Text style={{ color: location === loc.value ? Colors.sleepGlow : Colors.starlight, fontSize: 13, fontFamily: 'DMSans_500Medium' }}>
                  {loc.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button label="Log Sleep" onPress={handleQuickLog} />
        </>
      ) : (
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          {activeSleep ? (
            <>
              <Text style={{ color: Colors.starlight, fontSize: 14, fontFamily: 'DMSans_400Regular', marginBottom: 16 }}>
                Sleep in progress
              </Text>
              <LiveTimer startTime={activeSleep.startTime} color={Colors.sleepGlow} size="lg" />
              <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular', marginTop: 8, marginBottom: 32 }}>
                Started at {format(activeSleep.startTime, 'h:mm a')}
              </Text>
              <Button label="Baby woke up ☀️" onPress={handleEndTimer} />
            </>
          ) : (
            <>
              <Text style={{ color: Colors.starlight, fontSize: 14, fontFamily: 'DMSans_400Regular', marginBottom: 32, textAlign: 'center' }}>
                Tap when baby falls asleep — we'll track the duration automatically
              </Text>
              <Button label="Started sleeping 💤" onPress={handleStartTimer} />
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const labelStyle = {
  color: Colors.starlight,
  fontSize: 13,
  fontFamily: 'DMSans_500Medium' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.8,
  marginBottom: 8,
};

const timePickerWrap = {
  backgroundColor: Colors.twilight,
  borderRadius: 14,
  overflow: 'hidden' as const,
  marginBottom: 8,
};
