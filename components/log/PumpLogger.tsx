import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { useLogStore } from '@/store/log.store';
import { useBabyStore } from '@/store/baby.store';
import { useUIStore } from '@/store/ui.store';
import { Button } from '@/components/ui/Button';

function VolumeInput({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
        {label}
      </Text>
      <TouchableOpacity
        onPress={() => onChange(Math.min(500, value + 10))}
        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.twilight, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}
      >
        <Text style={{ color: Colors.moonrise, fontSize: 22 }}>+</Text>
      </TouchableOpacity>
      <Text style={{ color: Colors.moonrise, fontSize: 40, fontFamily: 'DMSans_700Bold', fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
      <Text style={{ color: Colors.starlight, fontSize: 12, fontFamily: 'DMSans_400Regular', marginBottom: 8 }}>ml</Text>
      <TouchableOpacity
        onPress={() => onChange(Math.max(0, value - 10))}
        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.twilight, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ color: Colors.moonrise, fontSize: 22 }}>−</Text>
      </TouchableOpacity>
    </View>
  );
}

interface PumpLoggerProps {
  onClose: () => void;
}

export function PumpLogger({ onClose }: PumpLoggerProps) {
  const [leftMl, setLeftMl] = useState(0);
  const [rightMl, setRightMl] = useState(0);

  const { addEntry } = useLogStore();
  const { baby, currentCaregiver } = useBabyStore();
  const { showToast } = useUIStore();

  const total = leftMl + rightMl;

  const handleLog = async () => {
    if (!baby || !currentCaregiver) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addEntry({
      babyId: baby.id,
      caregiverId: currentCaregiver.id,
      type: 'pump',
      startTime: new Date(),
      metadata: { leftMl, rightMl },
    });
    showToast(`Pump logged · ${total}ml total ✓`);
    onClose();
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={{
          color: Colors.moonrise,
          fontSize: 22,
          fontFamily: 'PlayfairDisplay_400Regular',
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        Log Pump
      </Text>

      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
        <VolumeInput label="Left" value={leftMl} onChange={setLeftMl} color={Colors.pumpGlow} />
        <View style={{ width: 1, backgroundColor: Colors.border }} />
        <VolumeInput label="Right" value={rightMl} onChange={setRightMl} color={Colors.pumpGlow} />
      </View>

      {total > 0 && (
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular' }}>Total</Text>
          <Text style={{ color: Colors.pumpGlow, fontSize: 32, fontFamily: 'DMSans_700Bold', fontVariant: ['tabular-nums'] }}>
            {total}ml
          </Text>
        </View>
      )}

      <Button label="Log Pump" onPress={handleLog} disabled={total === 0} />
    </ScrollView>
  );
}
