import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { StarField } from '@/components/ui/StarField';
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

const UNITS = ['ml', 'drops', 'mg', 'IU', 'tablet'] as const;

export default function MedicationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    babyName: string;
    caregiverName: string;
    dob: string;
    premStatus: string;
    premWeeks: string;
  }>();

  const [hasMeds, setHasMeds] = useState<boolean | null>(null);
  const [meds, setMeds] = useState<SavedMedication[]>([]);
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [unit, setUnit] = useState<SavedMedication['unit']>('ml');
  const [reminderTime, setReminderTime] = useState('');

  const addMed = () => {
    if (!name.trim() || !dose.trim()) return;
    setMeds(prev => [...prev, {
      id: Date.now().toString(),
      name: name.trim(),
      dose: dose.trim(),
      unit,
      reminderTime: reminderTime.trim() || undefined,
    }]);
    setName('');
    setDose('');
    setReminderTime('');
  };

  const removeMed = (id: string) => setMeds(prev => prev.filter(m => m.id !== id));

  const handleContinue = () => {
    router.push({
      pathname: '/(auth)/onboarding/sleep-schedule',
      params: {
        ...params,
        medsJson: hasMeds ? JSON.stringify(meds) : '[]',
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.midnight }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StarField />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 28, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: Colors.aurora, fontSize: 24 }}>‹</Text>
          </TouchableOpacity>
          <StepDots current={2} total={5} />
          <View style={{ width: 24 }} />
        </View>

        <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
          Step 3 of 5
        </Text>
        <Text style={{ color: Colors.moonrise, fontSize: 32, fontFamily: 'PlayfairDisplay_400Regular_Italic', marginBottom: 8, lineHeight: 42 }}>
          Any vitamins or{'\n'}regular medicine?
        </Text>
        <Text style={{ color: Colors.starlight, fontSize: 14, fontFamily: 'DMSans_400Regular', marginBottom: 28 }}>
          We'll add these to your quick-log for easy tracking.
        </Text>

        {/* Yes / No cards */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 28 }}>
          {([
            { val: true, label: 'Yes', emoji: '💊' },
            { val: false, label: 'No, skip', emoji: '✕' },
          ] as const).map(({ val, label, emoji }) => {
            const selected = hasMeds === val;
            return (
              <TouchableOpacity
                key={String(val)}
                onPress={() => setHasMeds(val)}
                style={{
                  flex: 1,
                  backgroundColor: selected ? Colors.aurora : Colors.cardBg,
                  borderRadius: 16,
                  padding: 18,
                  alignItems: 'center',
                  borderWidth: 1.5,
                  borderColor: selected ? Colors.aurora : Colors.border,
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 6 }}>{emoji}</Text>
                <Text style={{
                  color: selected ? Colors.gradientBase : Colors.moonrise,
                  fontSize: 15,
                  fontFamily: 'DMSans_500Medium',
                }}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {hasMeds && (
          <View>
            {/* Existing meds list */}
            {meds.map(med => (
              <View key={med.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: Colors.moonrise, fontSize: 15, fontFamily: 'DMSans_500Medium' }}>{med.name}</Text>
                  <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular' }}>
                    {med.dose} {med.unit}{med.reminderTime ? ` · ${med.reminderTime}` : ''}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeMed(med.id)} style={{ padding: 6 }}>
                  <Text style={{ color: Colors.danger, fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Add new med form */}
            <View style={{ backgroundColor: Colors.cardBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 }}>
              <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 }}>
                Add medicine
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Medicine name (e.g. Vitamin D)"
                placeholderTextColor={`${Colors.starlight}99`}
                style={{ color: Colors.moonrise, fontSize: 15, fontFamily: 'DMSans_400Regular', backgroundColor: Colors.twilight, borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.border }}
              />
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                <TextInput
                  value={dose}
                  onChangeText={setDose}
                  placeholder="Dose (e.g. 0.5)"
                  placeholderTextColor={`${Colors.starlight}99`}
                  keyboardType="decimal-pad"
                  style={{ flex: 1, color: Colors.moonrise, fontSize: 15, fontFamily: 'DMSans_400Regular', backgroundColor: Colors.twilight, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.border }}
                />
                <TextInput
                  value={reminderTime}
                  onChangeText={setReminderTime}
                  placeholder="Time HH:MM"
                  placeholderTextColor={`${Colors.starlight}99`}
                  style={{ flex: 1, color: Colors.moonrise, fontSize: 15, fontFamily: 'DMSans_400Regular', backgroundColor: Colors.twilight, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.border }}
                />
              </View>
              {/* Unit pills */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {UNITS.map(u => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setUnit(u)}
                    style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: unit === u ? Colors.medsGlow : Colors.twilight, borderWidth: 1, borderColor: unit === u ? Colors.medsGlow : Colors.border }}
                  >
                    <Text style={{ color: unit === u ? '#fff' : Colors.moonrise, fontSize: 13, fontFamily: 'DMSans_500Medium' }}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={addMed}
                disabled={!name.trim() || !dose.trim()}
                style={{ backgroundColor: (!name.trim() || !dose.trim()) ? Colors.twilight : Colors.medsGlow, borderRadius: 10, padding: 12, alignItems: 'center' }}
              >
                <Text style={{ color: (!name.trim() || !dose.trim()) ? Colors.starlight : '#fff', fontSize: 14, fontFamily: 'DMSans_500Medium' }}>
                  + Add to list
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Button
          label="Continue →"
          onPress={handleContinue}
          disabled={hasMeds === null || (hasMeds && meds.length === 0)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
