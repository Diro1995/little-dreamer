import React, { useEffect, useRef } from 'react';
import { View, Text, AppState } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Clock, BarChart2, User } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { useBabyStore } from '@/store/baby.store';
import { useLogStore } from '@/store/log.store';

const ACTIVE = '#C8A97E';
const INACTIVE = '#9BA3C2';

function TabIcon({
  Icon,
  label,
  focused,
}: {
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  focused: boolean;
}) {
  const color = focused ? ACTIVE : INACTIVE;
  return (
    <View style={{ alignItems: 'center', gap: 3, paddingTop: 8 }}>
      <Icon size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
      <Text
        style={{
          color,
          fontSize: 10,
          fontFamily: 'DMSans_500Medium',
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          marginTop: 2,
          width: focused ? 16 : 0,
          height: 3,
          borderRadius: 99,
          backgroundColor: focused ? ACTIVE : 'transparent',
        }}
      />
    </View>
  );
}

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const { baby } = useBabyStore();
  const { syncFromSupabase, subscribeToRealtime, flushOfflineQueue } = useLogStore();
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!baby?.id) return;

    // Pull latest logs from Supabase then start listening for live changes
    syncFromSupabase(baby.id);
    unsubRef.current = subscribeToRealtime(baby.id);

    return () => {
      unsubRef.current?.();
    };
  }, [baby?.id]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') flushOfflineQueue();
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={{ flex: 1 }}>
    <OfflineBanner />
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: 'rgba(0,0,0,0.06)',
          borderTopWidth: 1,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={Home} label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={Clock} label="Timeline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={BarChart2} label="Insights" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="baby"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={User} label="Baby" focused={focused} />,
        }}
      />
    </Tabs>
    </View>
  );
}
