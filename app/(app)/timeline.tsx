import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, SectionList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, startOfDay } from 'date-fns';
import { Colors, EventLabels } from '@/constants/theme';
import { StarField } from '@/components/ui/StarField';
import { TimelineItem } from '@/components/timeline/TimelineItem';
import { DayDivider } from '@/components/timeline/DayDivider';
import { LogSheetRouter } from '@/components/log/LogSheetRouter';
import { useLogStore } from '@/store/log.store';
import { EventType, LogEntry } from '@/constants/types';

const FILTERS: { key: EventType | 'all'; label: string }[] = [
  { key: 'all',          label: 'All'     },
  { key: 'sleep',        label: 'Sleep'   },
  { key: 'feed_breast',  label: 'Feed'    },
  { key: 'diaper',       label: 'Diaper'  },
  { key: 'pump',         label: 'Pump'    },
];

export default function TimelineScreen() {
  const insets = useSafeAreaInsets();
  const { entries } = useLogStore();
  const [filter, setFilter] = useState<EventType | 'all'>('all');
  const [activeSheet, setActiveSheet] = useState<EventType | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return entries;
    if (filter === 'feed_breast') {
      return entries.filter(
        (e) => e.type === 'feed_breast' || e.type === 'feed_bottle' || e.type === 'feed_solid'
      );
    }
    return entries.filter((e) => e.type === filter);
  }, [entries, filter]);

  // Group by day
  const sections = useMemo(() => {
    const groups = new Map<string, LogEntry[]>();
    for (const entry of filtered) {
      const key = format(startOfDay(entry.startTime), 'yyyy-MM-dd');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(entry);
    }
    return Array.from(groups.entries()).map(([key, data]) => ({
      date: new Date(key),
      data,
    }));
  }, [filtered]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.midnight }}>
      <StarField />

      {/* Fixed header */}
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 0 }}>
        <Text
          style={{
            color: Colors.moonrise,
            fontSize: 26,
            fontFamily: 'PlayfairDisplay_400Regular',
            marginBottom: 16,
          }}
        >
          Timeline
        </Text>

        {/* Filter chips */}
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(f) => f.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
          renderItem={({ item }) => {
            const active = filter === item.key;
            return (
              <TouchableOpacity
                onPress={() => setFilter(item.key)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 7,
                  borderRadius: 99,
                  backgroundColor: active ? Colors.aurora : Colors.twilight,
                  borderWidth: 1,
                  borderColor: active ? Colors.aurora : Colors.border,
                }}
              >
                <Text
                  style={{
                    color: active ? Colors.midnight : Colors.starlight,
                    fontSize: 13,
                    fontFamily: 'DMSans_500Medium',
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Text style={{ fontSize: 48 }}>🌙</Text>
          <Text style={{ color: Colors.moonrise, fontSize: 20, fontFamily: 'PlayfairDisplay_400Regular_Italic' }}>
            Nothing logged yet
          </Text>
          <Text style={{ color: Colors.starlight, fontSize: 14, fontFamily: 'DMSans_400Regular' }}>
            Tap the quick log on the home screen to get started
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TimelineItem entry={item} delay={index * 30} />
          )}
          renderSectionHeader={({ section }) => (
            <DayDivider date={section.date} />
          )}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled
        />
      )}

      <LogSheetRouter type={activeSheet} onClose={() => setActiveSheet(null)} />
    </View>
  );
}
