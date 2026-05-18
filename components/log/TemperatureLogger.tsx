import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { Colors } from '@/constants/theme';
import { TempUnit, TempMethod, LogEntry } from '@/constants/types';
import { useLogStore } from '@/store/log.store';
import { useBabyStore } from '@/store/baby.store';
import { useUIStore } from '@/store/ui.store';

const METHODS: TempMethod[] = ['Forehead', 'Ear', 'Armpit', 'Rectal'];

function tempColor(c: number): string {
  if (c < 37.5) return Colors.success;
  if (c < 38.5) return Colors.warning;
  return Colors.danger;
}

function tempLabel(c: number): string {
  if (c < 37.5) return 'Normal';
  if (c < 38.5) return 'Low fever';
  return 'High fever';
}

export function TemperatureLogger({ onClose, editEntry }: { onClose: () => void; editEntry?: LogEntry }) {
  const { addEntry, updateEntry } = useLogStore();
  const { baby, currentCaregiver } = useBabyStore();
  const { showToast } = useUIStore();

  const [tempC, setTempC] = useState(editEntry?.metadata.tempCelsius ?? 37.0);
  const [unit, setUnit] = useState<TempUnit>(editEntry?.metadata.tempUnit ?? 'C');
  const [method, setMethod] = useState<TempMethod>(editEntry?.metadata.tempMethod ?? 'Forehead');
  const [logTime, setLogTime] = useState<Date>(editEntry?.startTime ?? new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const displayed = unit === 'C' ? tempC : +(tempC * 9 / 5 + 32).toFixed(1);
  const step = unit === 'C' ? 0.1 : 0.2;

  const adjust = (delta: number) => {
    const stepC = unit === 'C' ? delta : delta * 5 / 9;
    setTempC(prev => +Math.max(34, Math.min(42, prev + stepC)).toFixed(1));
  };

  const color = tempColor(tempC);

  const handleLog = async () => {
    if (!baby || !currentCaregiver) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (editEntry) {
      await updateEntry(editEntry.id, { startTime: logTime, metadata: { tempCelsius: tempC, tempUnit: unit, tempMethod: method } });
      showToast('Temperature updated ✓');
    } else {
      await addEntry({
        babyId: baby.id,
        caregiverId: currentCaregiver.id,
        type: 'temperature',
        startTime: logTime,
        metadata: { tempCelsius: tempC, tempUnit: unit, tempMethod: method },
      });
      showToast(`Temperature logged: ${displayed}°${unit} ✓`);
    }
    onClose();
  };

  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
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
      <Text style={{ color: Colors.moonrise, fontSize: 22, fontFamily: 'PlayfairDisplay_400Regular', textAlign: 'center', marginBottom: 20 }}>
        {editEntry ? 'Edit Temperature' : 'Log Temperature'}
      </Text>

      {/* °C / °F toggle */}
      <View style={{ flexDirection: 'row', backgroundColor: Colors.twilight, borderRadius: 24, padding: 3, alignSelf: 'center', marginBottom: 24 }}>
        {(['C', 'F'] as TempUnit[]).map(u => (
          <TouchableOpacity
            key={u}
            onPress={() => setUnit(u)}
            style={{ paddingHorizontal: 24, paddingVertical: 8, borderRadius: 22, backgroundColor: unit === u ? Colors.tempGlow : 'transparent' }}
          >
            <Text style={{ color: unit === u ? '#fff' : Colors.starlight, fontSize: 15, fontFamily: 'DMSans_700Bold' }}>°{u}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Big temp display */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <View style={{ width: 140, height: 140, borderRadius: 70, borderWidth: 5, borderColor: color, alignItems: 'center', justifyContent: 'center', backgroundColor: `${color}12` }}>
          <Text style={{ color, fontSize: 36, fontFamily: 'DMSans_700Bold' }}>{displayed.toFixed(1)}°</Text>
          <Text style={{ color, fontSize: 12, fontFamily: 'DMSans_500Medium', marginTop: 2 }}>{unit === 'C' ? '°C' : '°F'}</Text>
        </View>
        <Text style={{ color, fontSize: 13, fontFamily: 'DMSans_500Medium', marginTop: 8 }}>{tempLabel(tempC)}</Text>
      </View>

      {/* ± adjusters */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
        {[-step * 5, -step, step, step * 5].map(d => (
          <TouchableOpacity
            key={d}
            onPress={() => adjust(d)}
            style={{ width: 52, height: 44, borderRadius: 12, backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: Colors.moonrise, fontSize: 14, fontFamily: 'DMSans_700Bold' }}>
              {d > 0 ? '+' : ''}{(Math.round(d * 10) / 10).toFixed(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Method pills */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
        {METHODS.map(m => (
          <TouchableOpacity
            key={m}
            onPress={() => setMethod(m)}
            style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: method === m ? Colors.tempGlow : Colors.twilight, borderWidth: 1, borderColor: method === m ? Colors.tempGlow : Colors.border }}
          >
            <Text style={{ color: method === m ? '#fff' : Colors.moonrise, fontSize: 13, fontFamily: 'DMSans_500Medium' }}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={handleLog}
        style={{ backgroundColor: Colors.tempGlow, borderRadius: 28, height: 54, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'DMSans_700Bold' }}>{editEntry ? 'Save Changes' : 'Log Temperature'}</Text>
      </TouchableOpacity>
    </View>
  );
}
