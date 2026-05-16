import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { EventType } from '@/constants/types';
import { useLogStore } from '@/store/log.store';
import { useBabyStore } from '@/store/baby.store';
import { useUIStore } from '@/store/ui.store';
import { Button } from '@/components/ui/Button';

interface NoteLoggerProps {
  type: 'note' | 'milestone';
  onClose: () => void;
}

export function NoteLogger({ type, onClose }: NoteLoggerProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const { addEntry } = useLogStore();
  const { baby, currentCaregiver } = useBabyStore();
  const { showToast } = useUIStore();

  const isMilestone = type === 'milestone';
  const accentColor = isMilestone ? Colors.aurora : Colors.starlight;

  const handleLog = async () => {
    if (!baby || !currentCaregiver) return;
    if (isMilestone && !title.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addEntry({
      babyId: baby.id,
      caregiverId: currentCaregiver.id,
      type,
      startTime: new Date(),
      metadata: isMilestone ? { milestoneTitle: title.trim() } : { noteText: notes.trim() },
      notes: isMilestone ? notes.trim() : undefined,
    });
    showToast(`${isMilestone ? 'Milestone' : 'Note'} saved ✓`);
    onClose();
  };

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 }}>
      <Text
        style={{
          color: Colors.moonrise,
          fontSize: 22,
          fontFamily: 'PlayfairDisplay_400Regular',
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        {isMilestone ? '⭐ Log Milestone' : '📝 Add Note'}
      </Text>

      {isMilestone && (
        <>
          <Text style={labelStyle}>Milestone</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="First smile, rolled over..."
            placeholderTextColor={Colors.starlight}
            style={inputStyle}
            autoFocus
          />
        </>
      )}

      <Text style={labelStyle}>{isMilestone ? 'Notes (optional)' : 'Note'}</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder={isMilestone ? 'Details about this moment...' : "What's on your mind?"}
        placeholderTextColor={Colors.starlight}
        style={[inputStyle, { height: 100, textAlignVertical: 'top' }]}
        multiline
        autoFocus={!isMilestone}
      />

      <Button label={isMilestone ? 'Save Milestone' : 'Save Note'} onPress={handleLog} />
    </View>
  );
}

const labelStyle = {
  color: Colors.starlight,
  fontSize: 11,
  fontFamily: 'DMSans_500Medium' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
  marginBottom: 8,
};

const inputStyle = {
  backgroundColor: Colors.twilight,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  color: Colors.moonrise,
  fontSize: 15,
  fontFamily: 'DMSans_400Regular' as const,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: Colors.border,
};
