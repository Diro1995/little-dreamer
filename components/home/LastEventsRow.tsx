import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { differenceInMinutes } from 'date-fns';
import { Colors } from '@/constants/theme';
import { LogEntry } from '@/constants/types';

function relativeTime(date: Date): string {
  const m = differenceInMinutes(new Date(), date);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m ago` : `${h}h ago`;
}

interface EventPillProps {
  emoji: string;
  label: string;
  time: Date | null;
  color: string;
}

function EventPill({ emoji, label, time, color }: EventPillProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.cardBg,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingVertical: 12,
        paddingHorizontal: 12,
        gap: 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 16 }}>{emoji}</Text>
        <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 0.8 }}>
          {label}
        </Text>
      </View>
      <Text style={{ color: time ? color : Colors.starlight, fontSize: 14, fontFamily: 'DMSans_600SemiBold' ?? 'DMSans_500Medium' }}>
        {time ? relativeTime(time) : 'Not logged'}
      </Text>
    </View>
  );
}

interface LastEventsRowProps {
  entries: LogEntry[];
}

export function LastEventsRow({ entries }: LastEventsRowProps) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const lastFeed = entries.find(
    (e) => e.type === 'feed_breast' || e.type === 'feed_bottle' || e.type === 'feed_solid'
  ) ?? null;

  const lastDiaper = entries.find((e) => e.type === 'diaper') ?? null;

  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <EventPill
        emoji="🍼"
        label="Last feed"
        time={lastFeed?.startTime ?? null}
        color={Colors.feedGlow}
      />
      <EventPill
        emoji="🧷"
        label="Last diaper"
        time={lastDiaper?.startTime ?? null}
        color={Colors.diaperGlow}
      />
    </View>
  );
}
