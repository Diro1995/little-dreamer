import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import type { SavedMedication } from '@/constants/types';
import { useLogStore } from '@/store/log.store';
import { useBabyStore } from '@/store/baby.store';
import { useUIStore } from '@/store/ui.store';

const UNITS = ['ml', 'drops', 'mg', 'IU', 'tablet'] as const;

export function MedsLogger({ onClose }: { onClose: () => void }) {
  const { addEntry } = useLogStore();
  const { baby, currentCaregiver, updateBaby } = useBabyStore();
  const { showToast } = useUIStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDose, setNewDose] = useState('');
  const [newUnit, setNewUnit] = useState<SavedMedication['unit']>('ml');

  const savedMeds = baby?.savedMedications ?? [];

  const handleLogMed = async (med: SavedMedication) => {
    if (!baby || !currentCaregiver) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addEntry({
      babyId: baby.id,
      caregiverId: currentCaregiver.id,
      type: 'medicine',
      startTime: new Date(),
      metadata: { medicineName: med.name, doseMl: parseFloat(med.dose) },
    });
    showToast(`${med.name} logged ✓`);
    onClose();
  };

  const handleAddNew = async () => {
    if (!newName.trim() || !newDose.trim() || !baby) return;
    const newMed: SavedMedication = {
      id: Date.now().toString(),
      name: newName.trim(),
      dose: newDose.trim(),
      unit: newUnit,
    };
    await updateBaby({ savedMedications: [...savedMeds, newMed] });
    setNewName('');
    setNewDose('');
    setShowAddForm(false);
  };

  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 8, flex: 1 }}>
      <Text style={{ color: Colors.moonrise, fontSize: 22, fontFamily: 'PlayfairDisplay_400Regular', textAlign: 'center', marginBottom: 16 }}>
        Log Medicine
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {savedMeds.length === 0 && !showAddForm && (
          <Text style={{ color: Colors.starlight, fontSize: 14, fontFamily: 'DMSans_400Regular', textAlign: 'center', marginBottom: 20 }}>
            No saved medicines yet. Add one below.
          </Text>
        )}

        {savedMeds.map(med => (
          <TouchableOpacity
            key={med.id}
            onPress={() => handleLogMed(med)}
            activeOpacity={0.8}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: `${Colors.medsGlow}12`, borderRadius: 14, borderWidth: 1.5, borderColor: `${Colors.medsGlow}30`, padding: 16, marginBottom: 10 }}
          >
            <Text style={{ fontSize: 24, marginRight: 14 }}>💊</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: Colors.moonrise, fontSize: 16, fontFamily: 'DMSans_500Medium' }}>{med.name}</Text>
              <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular' }}>{med.dose} {med.unit}</Text>
            </View>
            <Text style={{ color: Colors.medsGlow, fontSize: 13, fontFamily: 'DMSans_500Medium' }}>Log →</Text>
          </TouchableOpacity>
        ))}

        {showAddForm ? (
          <View style={{ backgroundColor: Colors.cardBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 }}>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Medicine name"
              placeholderTextColor={`${Colors.starlight}99`}
              style={{ color: Colors.moonrise, fontSize: 15, fontFamily: 'DMSans_400Regular', backgroundColor: Colors.twilight, borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.border }}
            />
            <TextInput
              value={newDose}
              onChangeText={setNewDose}
              placeholder="Dose (e.g. 0.5)"
              keyboardType="decimal-pad"
              placeholderTextColor={`${Colors.starlight}99`}
              style={{ color: Colors.moonrise, fontSize: 15, fontFamily: 'DMSans_400Regular', backgroundColor: Colors.twilight, borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.border }}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {UNITS.map(u => (
                <TouchableOpacity
                  key={u}
                  onPress={() => setNewUnit(u)}
                  style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: newUnit === u ? Colors.medsGlow : Colors.twilight, borderWidth: 1, borderColor: newUnit === u ? Colors.medsGlow : Colors.border }}
                >
                  <Text style={{ color: newUnit === u ? '#fff' : Colors.moonrise, fontSize: 13, fontFamily: 'DMSans_500Medium' }}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowAddForm(false)} style={{ flex: 1, height: 44, borderRadius: 22, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: Colors.starlight, fontSize: 14, fontFamily: 'DMSans_500Medium' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddNew} disabled={!newName.trim() || !newDose.trim()} style={{ flex: 1, height: 44, borderRadius: 22, backgroundColor: Colors.medsGlow, alignItems: 'center', justifyContent: 'center', opacity: (!newName.trim() || !newDose.trim()) ? 0.5 : 1 }}>
                <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'DMSans_700Bold' }}>Save & Log</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShowAddForm(true)}
            style={{ height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: Colors.medsGlow, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}
          >
            <Text style={{ color: Colors.medsGlow, fontSize: 14, fontFamily: 'DMSans_500Medium' }}>+ Add new medicine</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
