import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { StarField } from '@/components/ui/StarField';

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={{ width: i === current ? 20 : 7, height: 7, borderRadius: 4, backgroundColor: i === current ? Colors.aurora : Colors.twilight }} />
      ))}
    </View>
  );
}

const SLEEP_OPTIONS = [
  { id: 'chaotic', moon: '🌑', title: 'Still figuring it out', sub: 'Chaotic / newborn phase' },
  { id: 'emerging', moon: '🌓', title: 'Getting more regular', sub: 'Some patterns emerging' },
  { id: 'consistent', moon: '🌕', title: 'Pretty consistent', sub: 'Established routine' },
];

const NAP_OPTIONS = ['1', '2', '3', '4+'];

export default function SleepScheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    babyName: string;
    caregiverName: string;
    dob: string;
    premStatus: string;
    premWeeks: string;
    medsJson: string;
  }>();

  const [selected, setSelected] = useState<string | null>(null);
  const [naps, setNaps] = useState<string | null>(null);

  const showNaps = selected === 'emerging' || selected === 'consistent';

  const handleContinue = () => {
    router.push({
      pathname: '/(auth)/onboarding/first-log',
      params: { ...params, sleepPattern: selected ?? 'chaotic', napsPerDay: naps ?? '2' },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.midnight }}>
      <StarField />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: Colors.aurora, fontSize: 24 }}>‹</Text>
          </TouchableOpacity>
          <StepDots current={3} total={5} />
          <TouchableOpacity onPress={handleContinue}>
            <Text style={{ color: Colors.starlight, fontSize: 14, fontFamily: 'DMSans_400Regular' }}>Skip</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
          Step 4 of 5
        </Text>
        <Text style={{ color: Colors.moonrise, fontSize: 28, fontFamily: 'PlayfairDisplay_400Regular_Italic', marginBottom: 28, lineHeight: 36 }}>
          How is their{'\n'}sleep right now?
        </Text>

        <View style={{ gap: 10, marginBottom: 24 }}>
          {SLEEP_OPTIONS.map((opt) => {
            const active = selected === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelected(opt.id);
                }}
                activeOpacity={0.8}
                style={{
                  backgroundColor: active ? `${Colors.sleepGlow}18` : Colors.twilight,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: active ? Colors.sleepGlow : Colors.border,
                  padding: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <Text style={{ fontSize: 28 }}>{opt.moon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: active ? Colors.moonrise : Colors.moonrise, fontSize: 16, fontFamily: 'DMSans_500Medium' }}>
                    {opt.title}
                  </Text>
                  <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular', marginTop: 2 }}>
                    {opt.sub}
                  </Text>
                </View>
                {active && (
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.sleepGlow, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: Colors.midnight, fontSize: 12 }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {showNaps && (
          <>
            <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              How many naps a day?
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
              {NAP_OPTIONS.map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setNaps(n)}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: naps === n ? `${Colors.aurora}20` : Colors.twilight,
                    borderWidth: 1.5,
                    borderColor: naps === n ? Colors.aurora : Colors.border,
                  }}
                >
                  <Text style={{ color: naps === n ? Colors.aurora : Colors.starlight, fontSize: 18, fontFamily: 'DMSans_700Bold' }}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={{ flex: 1 }} />

        <Button
          label="Continue →"
          onPress={handleContinue}
          disabled={!selected}
        />
      </View>
    </View>
  );
}
