import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { format, differenceInMinutes } from 'date-fns';
import { Colors, EventColors, EventLabels } from '@/constants/theme';
import { LogEntry } from '@/constants/types';
import { useRouter } from 'expo-router';

interface RecentFeedItemProps {
  entry: LogEntry;
}

function formatEventDetail(entry: LogEntry): string {
  const { type, metadata, durationMinutes } = entry;
  if (type === 'feed_bottle') return metadata.volumeMl ? `${metadata.volumeMl}ml` : 'Bottle';
  if (type === 'feed_breast') return metadata.breastSide ? `${metadata.breastSide} side` : 'Breast';
  if (type === 'feed_solid') return metadata.solidFoods?.join(', ') || 'Solids';
  if (type === 'diaper') return metadata.diaperType ?? 'Diaper';
  if (type === 'sleep' && durationMinutes) {
    const h = Math.floor(durationMinutes / 60);
    const m = durationMinutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
  return EventLabels[type] ?? type;
}

function relativeTime(date: Date): string {
  const m = differenceInMinutes(new Date(), date);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

function RecentFeedItem({ entry }: RecentFeedItemProps) {
  const color = EventColors[entry.type] ?? Colors.starlight;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(155,163,194,0.08)',
      }}
    >
      <View
        style={{
          width: 3,
          height: 36,
          borderRadius: 2,
          backgroundColor: color,
          marginRight: 12,
        }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ color: Colors.moonrise, fontSize: 15, fontFamily: 'DMSans_500Medium' }}>
          {EventLabels[entry.type] ?? entry.type}
        </Text>
        <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular', marginTop: 1 }}>
          {formatEventDetail(entry)}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular' }}>
          {relativeTime(entry.startTime)}
        </Text>
        <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_400Regular', opacity: 0.6, marginTop: 1 }}>
          {format(entry.startTime, 'h:mm a')}
        </Text>
      </View>
    </View>
  );
}

interface RecentFeedProps {
  entries: LogEntry[];
}

export function RecentFeed({ entries }: RecentFeedProps) {
  const router = useRouter();
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  if (entries.length === 0) return null;

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text
          style={{
            color: Colors.starlight,
            fontSize: 11,
            fontFamily: 'DMSans_500Medium',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          Recent
        </Text>
        <TouchableOpacity onPress={() => router.push('/(app)/timeline')}>
          <Text style={{ color: Colors.aurora, fontSize: 13, fontFamily: 'DMSans_500Medium' }}>
            See all
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          backgroundColor: Colors.cardBg,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Colors.border,
          paddingHorizontal: 12,
        }}
      >
        {entries.slice(0, 4).map((entry) => (
          <RecentFeedItem key={entry.id} entry={entry} />
        ))}
      </View>
    </View>
  );
}
