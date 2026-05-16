import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { StarField } from '@/components/ui/StarField';
import { useBabyStore } from '@/store/baby.store';
import { supabase } from '@/lib/supabase';
import type { SavedMedication } from '@/constants/types';

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={{ width: i === current ? 20 : 7, height: 7, borderRadius: 4, backgroundColor: i === current ? Colors.aurora : Colors.twilight }} />
      ))}
    </View>
  );
}

function HourPicker({ value, onChange, label }: { value: number; onChange: (h: number) => void; label: string }) {
  const fmt = (h: number) => {
    const ampm = h < 12 ? 'AM' : 'PM';
    const disp = h % 12 === 0 ? 12 : h % 12;
    return `${disp}:00 ${ampm}`;
  };

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>
        {label}
      </Text>
      <View style={{ backgroundColor: Colors.cardBg, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', width: '100%' }}>
        <TouchableOpacity
          onPress={() => onChange((value - 1 + 24) % 24)}
          style={{ padding: 12, alignItems: 'center' }}
        >
          <Text style={{ color: Colors.aurora, fontSize: 20 }}>▲</Text>
        </TouchableOpacity>
        <View style={{ backgroundColor: Colors.twilight, paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ color: Colors.moonrise, fontSize: 20, fontFamily: 'DMSans_700Bold' }}>{fmt(value)}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onChange((value + 1) % 24)}
          style={{ padding: 12, alignItems: 'center' }}
        >
          <Text style={{ color: Colors.aurora, fontSize: 20 }}>▼</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FirstLogScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    babyName: string;
    caregiverName: string;
    dob: string;
    premStatus: string;
    premWeeks: string;
    medsJson: string;
    sleepPattern: string;
    napsPerDay: string;
  }>();

  const [dayStart, setDayStart] = useState(6);
  const [dayEnd, setDayEnd] = useState(20);
  const { setBaby, setCurrentCaregiver } = useBabyStore();

  const nightHours = ((dayStart - dayEnd + 24) % 24);
  const dayHours = 24 - nightHours;

  const handleContinue = async () => {
    // Use the authenticated user's ID as the canonical caregiver ID
    const { data: { user } } = await supabase.auth.getUser();
    const caregiverId = user?.id ?? `cg-${Date.now()}`;
    const caregiverName = params.caregiverName ?? 'Parent';
    const savedMedications: SavedMedication[] = params.medsJson ? JSON.parse(params.medsJson) : [];

    await setBaby({
      id: `baby-${Date.now()}`, // temporary local ID, replaced with UUID by setBaby()
      name: params.babyName,
      dob: new Date(params.dob),
      prematureWeeks: parseInt(params.premWeeks) || 0,
      caregivers: [{ id: caregiverId, name: caregiverName, role: 'parent', avatarColor: Colors.aurora }],
      savedMedications,
      dayStartHour: dayStart,
      dayEndHour: dayEnd,
    });
    setCurrentCaregiver({ id: caregiverId, name: caregiverName, role: 'parent', avatarColor: Colors.aurora });

    router.replace({
      pathname: '/(auth)/onboarding/welcome-complete',
      params: { babyName: params.babyName },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.midnight }}>
      <StarField />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 28, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: Colors.aurora, fontSize: 24 }}>‹</Text>
          </TouchableOpacity>
          <StepDots current={4} total={5} />
          <View style={{ width: 24 }} />
        </View>

        <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
          Step 5 of 5
        </Text>
        <Text style={{ color: Colors.moonrise, fontSize: 28, fontFamily: 'PlayfairDisplay_400Regular_Italic', marginBottom: 8, lineHeight: 36 }}>
          Set your day{'\n'}& night windows
        </Text>
        <Text style={{ color: Colors.starlight, fontSize: 14, fontFamily: 'DMSans_400Regular', marginBottom: 32 }}>
          This helps us show sleep stats correctly. You can change it anytime.
        </Text>

        {/* Time pickers */}
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 28 }}>
          <HourPicker value={dayStart} onChange={setDayStart} label="🌅  Day starts" />
          <HourPicker value={dayEnd} onChange={setDayEnd} label="🌙  Night starts" />
        </View>

        {/* Summary bar */}
        <View style={{ backgroundColor: Colors.cardBg, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: Colors.aurora, fontSize: 22, fontFamily: 'DMSans_700Bold' }}>{dayHours}h</Text>
              <Text style={{ color: Colors.starlight, fontSize: 12, fontFamily: 'DMSans_400Regular' }}>daytime</Text>
            </View>
            <View style={{ width: 1, backgroundColor: Colors.border }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: Colors.sleepGlow, fontSize: 22, fontFamily: 'DMSans_700Bold' }}>{nightHours}h</Text>
              <Text style={{ color: Colors.starlight, fontSize: 12, fontFamily: 'DMSans_400Regular' }}>nighttime</Text>
            </View>
          </View>
        </View>

        <Button label="Finish →" onPress={handleContinue} />
      </ScrollView>
    </View>
  );
}
