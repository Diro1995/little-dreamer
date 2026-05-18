import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Colors } from '@/constants/theme';
import { StarField } from '@/components/ui/StarField';
import { SleepChart } from '@/components/insights/SleepChart';
import { FeedChart } from '@/components/insights/FeedChart';
import { Card } from '@/components/ui/Card';
import { useLogStore } from '@/store/log.store';
import { getSleepScore } from '@/lib/sleep-engine';

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '30 days', days: 30 },
] as const;

type Range = 7 | 14 | 30;

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { entries } = useLogStore();
  const [days, setDays] = useState<Range>(7);

  const sleepScore = getSleepScore(entries, days);
  const milestones = entries.filter((e) => e.type === 'milestone');

  return (
    <View style={{ flex: 1, backgroundColor: Colors.midnight }}>
      <StarField />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ color: Colors.moonrise, fontSize: 26, fontFamily: 'PlayfairDisplay_400Regular', marginBottom: 4 }}>
          Insights
        </Text>

        {/* Filter chips */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {RANGES.map((r) => {
            const active = r.days === days;
            return (
              <TouchableOpacity
                key={r.days}
                onPress={() => setDays(r.days as Range)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 99,
                  backgroundColor: active ? Colors.sleepGlow : Colors.cardBg,
                  borderWidth: 1,
                  borderColor: active ? Colors.sleepGlow : Colors.border,
                }}
              >
                <Text style={{
                  color: active ? '#fff' : Colors.starlight,
                  fontSize: 13,
                  fontFamily: 'DMSans_500Medium',
                }}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {entries.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60, gap: 12, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 48 }}>📊</Text>
            <Text
              style={{
                color: Colors.moonrise,
                fontSize: 20,
                fontFamily: 'PlayfairDisplay_400Regular_Italic',
                textAlign: 'center',
              }}
            >
              Patterns appear over time
            </Text>
            <Text
              style={{
                color: Colors.starlight,
                fontSize: 14,
                fontFamily: 'DMSans_400Regular',
                textAlign: 'center',
                lineHeight: 22,
              }}
            >
              Log a few days of feeds and sleep and you'll see charts, averages, and trends here.
            </Text>
          </View>
        ) : (
          <>
            {/* Stats row */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Card style={{ flex: 1 }}>
                <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Avg sleep/day
                </Text>
                <Text style={{ color: Colors.moonrise, fontSize: 22, fontFamily: 'DMSans_700Bold', marginTop: 4 }}>
                  {(sleepScore.totalHours / days).toFixed(1)}h
                </Text>
              </Card>
              <Card style={{ flex: 1 }}>
                <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Avg naps/day
                </Text>
                <Text style={{ color: Colors.moonrise, fontSize: 22, fontFamily: 'DMSans_700Bold', marginTop: 4 }}>
                  {sleepScore.avgNapCount.toFixed(1)}
                </Text>
              </Card>
              <Card style={{ flex: 1 }}>
                <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Best stretch
                </Text>
                <Text style={{ color: Colors.moonrise, fontSize: 22, fontFamily: 'DMSans_700Bold', marginTop: 4 }}>
                  {sleepScore.avgNightStretch.toFixed(1)}h
                </Text>
              </Card>
            </View>

            {/* Sleep chart */}
            <Card>
              <SleepChart entries={entries} days={days} />
            </Card>

            {/* Feed chart */}
            <Card>
              <FeedChart entries={entries} days={days} />
            </Card>

            {/* Best night */}
            {sleepScore.bestNight && (
              <Card glowColor={Colors.sleepGlow}>
                <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Best night this period
                </Text>
                <Text style={{ color: Colors.moonrise, fontSize: 28, fontFamily: 'DMSans_700Bold', marginTop: 4 }}>
                  {Math.round(sleepScore.bestNight.hours * 10) / 10}h
                </Text>
                <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular' }}>
                  {format(sleepScore.bestNight.date, 'EEEE, MMM d')}
                </Text>
              </Card>
            )}

            {/* Milestones */}
            {milestones.length > 0 && (
              <Card>
                <Text style={{ color: Colors.moonrise, fontSize: 16, fontFamily: 'PlayfairDisplay_400Regular', marginBottom: 16 }}>
                  Milestones
                </Text>
                <View style={{ gap: 12 }}>
                  {milestones.map((m) => (
                    <View key={m.id} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                      <Text style={{ fontSize: 20 }}>⭐</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: Colors.moonrise, fontSize: 15, fontFamily: 'DMSans_500Medium' }}>
                          {m.metadata.milestoneTitle}
                        </Text>
                        <Text style={{ color: Colors.starlight, fontSize: 12, fontFamily: 'DMSans_400Regular', marginTop: 2 }}>
                          {format(m.startTime, 'MMMM d, yyyy')}
                        </Text>
                        {m.notes && (
                          <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular', marginTop: 4 }}>
                            {m.notes}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
