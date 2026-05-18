import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { Colors } from '@/constants/theme';
import { DiaperType, LogEntry } from '@/constants/types';
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
  editEntry?: LogEntry;
}

export function DiaperLogger({ onClose, editEntry }: DiaperLoggerProps) {
  const { addEntry, updateEntry } = useLogStore();
  const { baby, currentCaregiver } = useBabyStore();
  const { showToast } = useUIStore();
  const [logTime, setLogTime] = useState<Date>(editEntry?.startTime ?? new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleLog = async (diaperType: DiaperType) => {
    if (!baby || !currentCaregiver) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (editEntry) {
      await updateEntry(editEntry.id, { startTime: logTime, metadata: { diaperType } });
      showToast('Diaper updated ✓');
    } else {
      await addEntry({
        babyId: baby.id,
        caregiverId: currentCaregiver.id,
        type: 'diaper',
        startTime: logTime,
        metadata: { diaperType },
      });
      showToast(`${diaperType.charAt(0).toUpperCase() + diaperType.slice(1)} diaper logged ✓`);
    }
    onClose();
  };

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
      {/* Time row */}
      <TouchableOpacity
        onPress={() => setShowTimePicker((v) => !v)}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: Colors.border }}
      >
        <Text style={{ color: Colors.starlight, fontSize: 12, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 0.8 }}>Time</Text>
        <Text style={{ color: Colors.aurora, fontSize: 15, fontFamily: 'DMSans_500Medium' }}>{format(logTime, 'h:mm a')}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={logTime}
          mode="time"
          display="spinner"
          onChange={(_, d) => { if (d) setLogTime(d); setShowTimePicker(false); }}
          textColor={Colors.moonrise}
          themeVariant="dark"
        />
      )}
      <Text
        style={{
          color: Colors.moonrise,
          fontSize: 22,
          fontFamily: 'PlayfairDisplay_400Regular',
          marginBottom: 6,
          textAlign: 'center',
        }}
      >
        {editEntry ? 'Edit Diaper' : 'Log Diaper'}
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
        {editEntry ? 'Tap type to update' : 'Tap to log instantly'}
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
