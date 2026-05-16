import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { format } from 'date-fns';
import { Colors, EventColors, EventLabels } from '@/constants/theme';
import { LogEntry } from '@/constants/types';
import { useLogStore } from '@/store/log.store';
import { useUIStore } from '@/store/ui.store';

function formatDetail(entry: LogEntry): string {
  const { type, metadata, durationMinutes } = entry;
  if (type === 'feed_bottle') return metadata.volumeMl ? `${metadata.volumeMl}ml` : '';
  if (type === 'feed_breast') {
    const parts = [];
    if (metadata.breastSide) parts.push(metadata.breastSide + ' side');
    if (durationMinutes) parts.push(`${durationMinutes}m`);
    return parts.join(' · ');
  }
  if (type === 'feed_solid') return metadata.solidFoods?.join(', ') ?? '';
  if (type === 'diaper') return metadata.diaperType ?? '';
  if (type === 'pump') {
    const parts = [];
    if (metadata.leftMl) parts.push(`L: ${metadata.leftMl}ml`);
    if (metadata.rightMl) parts.push(`R: ${metadata.rightMl}ml`);
    return parts.join(' · ');
  }
  if (type === 'sleep' && durationMinutes) {
    const h = Math.floor(durationMinutes / 60);
    const m = durationMinutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
  if (type === 'milestone') return metadata.milestoneTitle ?? '';
  if (type === 'note') return entry.notes ?? '';
  return '';
}

interface TimelineItemProps {
  entry: LogEntry;
  delay?: number;
}

export function TimelineItem({ entry, delay = 0 }: TimelineItemProps) {
  const [expanded, setExpanded] = useState(false);
  const { deleteEntry } = useLogStore();
  const { showToast } = useUIStore();
  const color = EventColors[entry.type] ?? Colors.starlight;
  const detail = formatDetail(entry);

  const handleDelete = () => {
    Alert.alert('Delete entry?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteEntry(entry.id);
          showToast('Entry deleted');
        },
      },
    ]);
  };

  return (
    <Animated.View entering={FadeIn.delay(delay).duration(300)}>
      <TouchableOpacity
        onPress={() => setExpanded((e) => !e)}
        activeOpacity={0.8}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(155,163,194,0.07)',
        }}
      >
        {/* Colored dot */}
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: color,
            marginRight: 12,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
          }}
        />

        {/* Content */}
        <View style={{ flex: 1 }}>
          <Text style={{ color: Colors.moonrise, fontSize: 15, fontFamily: 'DMSans_500Medium' }}>
            {EventLabels[entry.type]}
            {detail ? (
              <Text style={{ color: Colors.starlight, fontFamily: 'DMSans_400Regular' }}>
                {' · '}{detail}
              </Text>
            ) : null}
          </Text>
          {expanded && entry.notes && (
            <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular', marginTop: 4 }}>
              {entry.notes}
            </Text>
          )}
          {expanded && (
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
              <TouchableOpacity onPress={handleDelete}>
                <Text style={{ color: Colors.danger, fontSize: 13, fontFamily: 'DMSans_500Medium' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Time */}
        <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular' }}>
          {format(entry.startTime, 'h:mm a')}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
