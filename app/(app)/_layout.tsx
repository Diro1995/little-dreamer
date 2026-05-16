import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useBabyStore } from '@/store/baby.store';
import { useLogStore } from '@/store/log.store';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 3, paddingTop: 6 }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
      <Text
        style={{
          color: focused ? Colors.aurora : Colors.starlight,
          fontSize: 10,
          fontFamily: 'DMSans_500Medium',
          opacity: focused ? 1 : 0.6,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const { baby } = useBabyStore();
  const { syncFromSupabase, subscribeToRealtime } = useLogStore();
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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.dusk,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 0,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="📋" label="Timeline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="📊" label="Insights" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="baby"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👶" label="Baby" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
