import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getHours } from 'date-fns';
import { Colors } from '@/constants/theme';
import { StarField } from '@/components/ui/StarField';
import { SleepStatusCard } from '@/components/home/SleepStatusCard';
import { NapPredictionCard } from '@/components/home/NapPrediction';
import { QuickLogGrid } from '@/components/home/QuickLogGrid';
import { TodaySummary } from '@/components/home/TodaySummary';
import { RecentFeed } from '@/components/home/RecentFeed';
import { LastEventsRow } from '@/components/home/LastEventsRow';
import { SleepInsightCard } from '@/components/home/SleepInsightCard';
import { LogSheetRouter } from '@/components/log/LogSheetRouter';
import { useBabyStore } from '@/store/baby.store';
import { useLogStore } from '@/store/log.store';
import { useUIStore } from '@/store/ui.store';
import { getTodayStats } from '@/lib/analytics';
import { predictNextNap } from '@/lib/sleep-engine';
import { formatAge, getCorrectedAgeWeeks } from '@/lib/age';
import { EventType } from '@/constants/types';

function getGreeting(): string {
  const h = getHours(new Date());
  if (h < 5)  return 'Still up?';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { baby, currentCaregiver } = useBabyStore();
  const { entries, activeSleep, startSleepTimer } = useLogStore();
  const { showToast } = useUIStore();

  const [activeSheet, setActiveSheet] = useState<EventType | null>(null);

  const stats = getTodayStats(entries);
  const prediction = baby ? predictNextNap(baby, entries, activeSleep) : null;
  const ageWeeks = baby ? getCorrectedAgeWeeks(baby) : 0;

  const handleSleepLongPress = async () => {
    if (!baby || !currentCaregiver) return;
    if (activeSleep) {
      showToast('Sleep timer already running');
      return;
    }
    await startSleepTimer(baby.id, currentCaregiver.id);
    showToast('Sleep timer started 💤');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.midnight }}>
      <StarField />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: `${currentCaregiver?.avatarColor ?? Colors.aurora}30`,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1.5,
                borderColor: currentCaregiver?.avatarColor ?? Colors.aurora,
              }}
            >
              <Text style={{ color: currentCaregiver?.avatarColor ?? Colors.aurora, fontSize: 16, fontFamily: 'DMSans_700Bold' }}>
                {(currentCaregiver?.name ?? 'Y')[0].toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={{ color: Colors.moonrise, fontSize: 15, fontFamily: 'DMSans_500Medium' }}>
                {getGreeting()}, {currentCaregiver?.name ?? 'there'}
              </Text>
              {baby && (
                <Text style={{ color: Colors.starlight, fontSize: 12, fontFamily: 'DMSans_400Regular', marginTop: 1 }}>
                  {baby.name} · {formatAge(baby)}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Sleep status */}
        <SleepStatusCard />

        {/* Nap prediction */}
        {prediction && <NapPredictionCard prediction={prediction} />}

        {/* Last feed + last diaper */}
        <LastEventsRow entries={entries} />

        {/* Sleep insight */}
        {baby && <SleepInsightCard ageWeeks={ageWeeks} />}

        {/* Quick log */}
        <QuickLogGrid
          onTilePress={(type) => setActiveSheet(type)}
          onSleepLongPress={handleSleepLongPress}
        />

        {/* Today's summary */}
        <TodaySummary
          feeds={stats.feeds}
          sleepHours={stats.sleepHours}
          diapers={stats.diapers}
        />

        {/* Recent */}
        <RecentFeed entries={entries} />
      </ScrollView>

      <LogSheetRouter type={activeSheet} onClose={() => setActiveSheet(null)} />
    </View>
  );
}
