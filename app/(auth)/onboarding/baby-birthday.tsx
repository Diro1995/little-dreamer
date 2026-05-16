import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { differenceInWeeks } from 'date-fns';
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

export default function BabyBirthdayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { babyName, caregiverName } = useLocalSearchParams<{ babyName: string; caregiverName: string }>();

  const [dob, setDob] = useState(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)); // default 3mo ago
  const [premStatus, setPremStatus] = useState<'term' | 'early' | 'unsure' | null>(null);
  const [premWeeks, setPremWeeks] = useState('');

  const ageWeeks = differenceInWeeks(new Date(), dob);
  const premW = premStatus === 'early' ? (parseInt(premWeeks) || 0) : 0;
  const correctedWeeks = Math.max(0, ageWeeks - premW);
  const months = Math.floor(correctedWeeks / 4.33);
  const remWeeks = Math.floor(correctedWeeks - months * 4.33);

  const ageLabel =
    correctedWeeks < 4
      ? `${correctedWeeks} weeks old`
      : remWeeks === 0
      ? `${months} month${months !== 1 ? 's' : ''} old`
      : `${months}mo ${remWeeks}wk old`;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.midnight }}>
      <StarField />
      <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: Colors.aurora, fontSize: 24 }}>‹</Text>
          </TouchableOpacity>
          <StepDots current={1} total={5} />
          <View style={{ width: 24 }} />
        </View>

        <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
          Step 2 of 5
        </Text>
        <Text style={{ color: Colors.moonrise, fontSize: 32, fontFamily: 'PlayfairDisplay_400Regular_Italic', marginBottom: 8, lineHeight: 42 }}>
          When was{'\n'}{babyName} born?
        </Text>

        {/* Age feedback */}
        <Text style={{ color: Colors.aurora, fontSize: 16, fontFamily: 'DMSans_500Medium', marginBottom: 24 }}>
          {babyName} is {ageLabel}
        </Text>

        {/* Date picker */}
        <View style={{ backgroundColor: Colors.twilight, borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
          <DateTimePicker
            value={dob}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, d) => d && setDob(d)}
            maximumDate={new Date()}
            themeVariant="dark"
            textColor={Colors.moonrise}
            style={{ height: 160 }}
          />
        </View>

        {/* Premature cards */}
        <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_500Medium', marginBottom: 10 }}>
          Was {babyName} born at full term?
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {([
            { key: 'term', label: 'Born at term', emoji: '✓' },
            { key: 'early', label: 'Born early', emoji: '🌱' },
            { key: 'unsure', label: 'Not sure', emoji: '?' },
          ] as const).map(({ key, label, emoji }) => {
            const selected = premStatus === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setPremStatus(key)}
                style={{
                  flex: 1,
                  backgroundColor: selected ? Colors.aurora : Colors.cardBg,
                  borderRadius: 14,
                  padding: 14,
                  alignItems: 'center',
                  borderWidth: 1.5,
                  borderColor: selected ? Colors.aurora : Colors.border,
                }}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>{emoji}</Text>
                <Text style={{
                  color: selected ? Colors.gradientBase : Colors.moonrise,
                  fontSize: 12,
                  fontFamily: 'DMSans_500Medium',
                  textAlign: 'center',
                }}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {premStatus === 'early' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Text style={{ color: Colors.starlight, fontSize: 14, fontFamily: 'DMSans_400Regular', flex: 1 }}>
              How many weeks early?
            </Text>
            <TextInput
              value={premWeeks}
              onChangeText={setPremWeeks}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={Colors.starlight}
              style={{
                color: Colors.moonrise,
                fontSize: 20,
                fontFamily: 'DMSans_700Bold',
                textAlign: 'center',
                backgroundColor: Colors.twilight,
                borderRadius: 10,
                paddingHorizontal: 16,
                paddingVertical: 10,
                width: 80,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            />
          </View>
        )}

        <View style={{ flex: 1 }} />

        <Button
          label="Continue →"
          onPress={() =>
            router.push({
              pathname: '/(auth)/onboarding/medications',
              params: {
                babyName,
                caregiverName,
                dob: dob.toISOString(),
                premStatus: premStatus ?? 'term',
                premWeeks: premStatus === 'early' ? premWeeks : '0',
              },
            })
          }
        />
      </View>
    </View>
  );
}
