import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useBabyStore } from '@/store/baby.store';
import { useLogStore } from '@/store/log.store';
import { useAuthStore } from '@/store/auth.store';
import { ToastContainer } from '@/components/ui/Toast';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  } as Record<string, any>);

  const { loadFromStorage, loadFromSupabase, setBaby, hasCompletedOnboarding, baby } = useBabyStore();
  const { loadFromStorage: loadLogs } = useLogStore();
  const { initialize, session, initialized } = useAuthStore();

  const router = useRouter();
  const segments = useSegments();
  const [storageLoaded, setStorageLoaded] = React.useState(false);

  // Initialize auth listener + load local cache in parallel
  useEffect(() => {
    initialize();
    Promise.all([loadFromStorage(), loadLogs()]).then(() => {
      setStorageLoaded(true);
    });
  }, []);

  // When session arrives (e.g. email confirmed), sync any locally-created baby to Supabase
  const syncedRef = React.useRef(false);
  useEffect(() => {
    if (!session || !baby || syncedRef.current) return;
    const isLocalId = !baby.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    if (isLocalId) {
      syncedRef.current = true;
      setBaby(baby);
    }
  }, [session, baby?.id]);

  useEffect(() => {
    if (!initialized || !fontsLoaded || !storageLoaded) return;
    SplashScreen.hideAsync();

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments.includes('onboarding');

    if (!session) {
      // Allow users who finished onboarding to stay on the app while email confirms
      if (baby && hasCompletedOnboarding) return;
      if (!inAuth) router.replace('/(auth)/welcome');
      return;
    }

    // ── Authenticated ──────────────────────────────────────────
    if (baby && hasCompletedOnboarding) {
      // All good — push to app if stuck on an auth screen (but not mid-onboarding)
      if (inAuth && !inOnboarding) router.replace('/(app)');
      return;
    }

    // Session exists but no baby in local cache — check Supabase once
    if (inOnboarding) return; // Never interrupt active onboarding

    loadFromSupabase().then(() => {
      const { baby: loaded, hasCompletedOnboarding: done } =
        useBabyStore.getState();
      if (loaded && done) {
        router.replace('/(app)');
      } else {
        // Authenticated user with no baby → join-family or start onboarding
        router.replace('/(auth)/join-family');
      }
    });
  }, [initialized, fontsLoaded, storageLoaded, session, baby, hasCompletedOnboarding]);

  if (!fontsLoaded || !storageLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: Colors.midnight }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.midnight },
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
          <ToastContainer />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
