import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { Colors } from '@/constants/theme';
import { LogEntry } from '@/constants/types';
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
  editEntry?: LogEntry;
}

export function PumpLogger({ onClose, editEntry }: PumpLoggerProps) {
  const [leftMl, setLeftMl] = useState(editEntry?.metadata.leftMl ?? 0);
  const [rightMl, setRightMl] = useState(editEntry?.metadata.rightMl ?? 0);
  const [logTime, setLogTime] = useState<Date>(editEntry?.startTime ?? new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const { addEntry, updateEntry } = useLogStore();
  const { baby, currentCaregiver } = useBabyStore();
  const { showToast } = useUIStore();

  const total = leftMl + rightMl;

  const handleLog = async () => {
    if (!baby || !currentCaregiver) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (editEntry) {
      await updateEntry(editEntry.id, { startTime: logTime, metadata: { leftMl, rightMl } });
      showToast('Pump updated ✓');
    } else {
      await addEntry({
        babyId: baby.id,
        caregiverId: currentCaregiver.id,
        type: 'pump',
        startTime: logTime,
        metadata: { leftMl, rightMl },
      });
      showToast(`Pump logged · ${total}ml total ✓`);
    }
    onClose();
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Time row */}
      <TouchableOpacity
        onPress={() => setShowTimePicker((v) => !v)}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border }}
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
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        {editEntry ? 'Edit Pump' : 'Log Pump'}
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

      <Button label={editEntry ? 'Save Changes' : 'Log Pump'} onPress={handleLog} disabled={total === 0} />
    </ScrollView>
  );
}
