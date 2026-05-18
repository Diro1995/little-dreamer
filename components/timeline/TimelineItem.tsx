import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import ReanimatedAnimated, { FadeIn } from 'react-native-reanimated';
import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react-native';
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
  onEdit: (entry: LogEntry) => void;
}

export function TimelineItem({ entry, delay = 0, onEdit }: TimelineItemProps) {
  const swipeRef = useRef<Swipeable>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { deleteEntry } = useLogStore();
  const { showToast } = useUIStore();
  const color = EventColors[entry.type] ?? Colors.starlight;
  const detail = formatDetail(entry);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    swipeRef.current?.close();
    await deleteEntry(entry.id);
    showToast('Entry deleted');
  };

  const renderRightActions = (_: any, dragX: Animated.AnimatedInterpolation<number>) => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
        {/* Edit button */}
        <TouchableOpacity
          onPress={() => {
            swipeRef.current?.close();
            onEdit(entry);
          }}
          style={{
            backgroundColor: Colors.aurora,
            width: 72,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Pencil size={18} color="#fff" strokeWidth={2} />
          <Text style={{ color: '#fff', fontSize: 11, fontFamily: 'DMSans_500Medium' }}>Edit</Text>
        </TouchableOpacity>

        {/* Delete button */}
        <TouchableOpacity
          onPress={handleDelete}
          style={{
            backgroundColor: confirmDelete ? '#8B0000' : Colors.danger,
            width: 72,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Trash2 size={18} color="#fff" strokeWidth={2} />
          <Text style={{ color: '#fff', fontSize: 11, fontFamily: 'DMSans_500Medium' }}>
            {confirmDelete ? 'Sure?' : 'Delete'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ReanimatedAnimated.View entering={FadeIn.delay(delay).duration(300)}>
      <Swipeable
        ref={swipeRef}
        renderRightActions={renderRightActions}
        rightThreshold={40}
        onSwipeableWillOpen={() => setConfirmDelete(false)}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: Colors.midnight,
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
            {entry.notes && (
              <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular', marginTop: 2 }}>
                {entry.notes}
              </Text>
            )}
          </View>

          {/* Time */}
          <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular' }}>
            {format(entry.startTime, 'h:mm a')}
          </Text>
        </TouchableOpacity>
      </Swipeable>
    </ReanimatedAnimated.View>
  );
}
