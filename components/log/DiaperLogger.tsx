import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { DiaperType } from '@/constants/types';
import { useLogStore } from '@/store/log.store';
import { useBabyStore } from '@/store/baby.store';
import { useUIStore } from '@/store/ui.store';

const OPTIONS: { type: DiaperType; icon: string; label: string }[] = [
  { type: 'wet',   icon: '💧', label: 'Wet'   },
  { type: 'dirty', icon: '💩', label: 'Dirty' },
  { type: 'both',  icon: '💧💩', label: 'Both'  },
  { type: 'dry',   icon: '✨', label: 'Dry'   },
];

interface DiaperLoggerProps {
  onClose: () => void;
}

export function DiaperLogger({ onClose }: DiaperLoggerProps) {
  const { addEntry } = useLogStore();
  const { baby, currentCaregiver } = useBabyStore();
  const { showToast } = useUIStore();

  const handleLog = async (diaperType: DiaperType) => {
    if (!baby || !currentCaregiver) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addEntry({
      babyId: baby.id,
      caregiverId: currentCaregiver.id,
      type: 'diaper',
      startTime: new Date(),
      metadata: { diaperType },
    });
    showToast(`${diaperType.charAt(0).toUpperCase() + diaperType.slice(1)} diaper logged ✓`);
    onClose();
  };

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
      <Text
        style={{
          color: Colors.moonrise,
          fontSize: 22,
          fontFamily: 'PlayfairDisplay_400Regular',
          marginBottom: 6,
          textAlign: 'center',
        }}
      >
        Log Diaper
      </Text>
      <Text
        style={{
          color: Colors.starlight,
          fontSize: 13,
          fontFamily: 'DMSans_400Regular',
          textAlign: 'center',
          marginBottom: 28,
        }}
      >
        Tap to log instantly
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.type}
            onPress={() => handleLog(opt.type)}
            activeOpacity={0.8}
            style={{
              width: '45%',
              aspectRatio: 1.4,
              backgroundColor: `${Colors.diaperGlow}18`,
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: `${Colors.diaperGlow}35`,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              shadowColor: Colors.diaperGlow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 10,
            }}
          >
            <Text style={{ fontSize: 36 }}>{opt.icon}</Text>
            <Text
              style={{
                color: Colors.moonrise,
                fontSize: 15,
                fontFamily: 'DMSans_500Medium',
              }}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
