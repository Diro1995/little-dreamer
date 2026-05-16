import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useBabyStore } from '@/store/baby.store';
import { useLogStore } from '@/store/log.store';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 2, paddingTop: 8 }}>
      <Text style={{ fontSize: 21, opacity: focused ? 1 : 0.4 }}>{icon}</Text>
      <Text
        style={{
          color: focused ? Colors.aurora : '#9CA3AF',
          fontSize: 10,
          fontFamily: 'DMSans_500Medium',
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          marginTop: 3,
          width: focused ? 18 : 0,
          height: 3,
          borderRadius: 99,
          backgroundColor: focused ? Colors.aurora : 'transparent',
        }}
      />
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
          backgroundColor: '#FFFFFF',
          borderTopColor: 'rgba(0,0,0,0.06)',
          borderTopWidth: 1,
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
