import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { JournalEntryType } from '@/constants/types';
import { useLogStore } from '@/store/log.store';
import { useBabyStore } from '@/store/baby.store';
import { useUIStore } from '@/store/ui.store';

const TYPES: { type: JournalEntryType; label: string; emoji: string }[] = [
  { type: 'note',      label: 'Note',         emoji: '📝' },
  { type: 'milestone', label: 'Milestone',    emoji: '⭐' },
  { type: 'concern',   label: 'Concern',      emoji: '💭' },
  { type: 'doctor',    label: 'Doctor Visit', emoji: '🩺' },
  { type: 'reaction',  label: 'Reaction',     emoji: '⚡' },
];

const MILESTONES = [
  'First smile', 'First laugh', 'Rolled over', 'Sat up',
  'First word', 'First steps', 'First tooth', 'Clapped hands',
];

export function JournalLogger({ onClose }: { onClose: () => void }) {
  const { addEntry } = useLogStore();
  const { baby, currentCaregiver } = useBabyStore();
  const { showToast } = useUIStore();

  const [entryType, setEntryType] = useState<JournalEntryType>('note');
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [text, setText] = useState('');

  const canLog = text.trim().length > 0 || (entryType === 'milestone' && milestoneTitle.trim().length > 0);

  const handleLog = async () => {
    if (!baby || !currentCaregiver || !canLog) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addEntry({
      babyId: baby.id,
      caregiverId: currentCaregiver.id,
      type: 'journal',
      startTime: new Date(),
      metadata: {
        journalType: entryType,
        journalText: text.trim(),
        milestoneTitle: entryType === 'milestone' ? milestoneTitle.trim() : undefined,
      },
    });
    showToast(`${entryType.charAt(0).toUpperCase() + entryType.slice(1)} saved ✓`);
    onClose();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ color: Colors.moonrise, fontSize: 22, fontFamily: 'PlayfairDisplay_400Regular', textAlign: 'center', marginBottom: 16 }}>
          Journal
        </Text>

        {/* Type chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {TYPES.map(t => (
              <TouchableOpacity
                key={t.type}
                onPress={() => setEntryType(t.type)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: entryType === t.type ? Colors.journalGlow : Colors.twilight, borderWidth: 1, borderColor: entryType === t.type ? Colors.journalGlow : Colors.border }}
              >
                <Text style={{ fontSize: 14 }}>{t.emoji}</Text>
                <Text style={{ color: entryType === t.type ? '#fff' : Colors.moonrise, fontSize: 13, fontFamily: 'DMSans_500Medium' }}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Milestone sub-chips */}
        {entryType === 'milestone' && (
          <View style={{ marginBottom: 14 }}>
            <Text style={{ color: Colors.starlight, fontSize: 12, fontFamily: 'DMSans_500Medium', marginBottom: 8 }}>Common milestones:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {MILESTONES.map(m => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMilestoneTitle(milestoneTitle === m ? '' : m)}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: milestoneTitle === m ? `${Colors.journalGlow}20` : Colors.cardBg, borderWidth: 1, borderColor: milestoneTitle === m ? Colors.journalGlow : Colors.border }}
                >
                  <Text style={{ color: milestoneTitle === m ? Colors.journalGlow : Colors.moonrise, fontSize: 12, fontFamily: 'DMSans_400Regular' }}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Text area */}
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={entryType === 'milestone' ? 'Add details (optional)...' : 'Write something...'}
          placeholderTextColor={`${Colors.starlight}99`}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          style={{ color: Colors.moonrise, fontSize: 15, fontFamily: 'DMSans_400Regular', backgroundColor: Colors.cardBg, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14, minHeight: 120, marginBottom: 20 }}
        />

        <TouchableOpacity
          onPress={handleLog}
          disabled={!canLog}
          style={{ backgroundColor: Colors.journalGlow, borderRadius: 28, height: 54, alignItems: 'center', justifyContent: 'center', opacity: canLog ? 1 : 0.4 }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'DMSans_700Bold' }}>Save Entry</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
