import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { StarField } from '@/components/ui/StarField';
import { useBabyStore } from '@/store/baby.store';

export default function WelcomeCompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { babyName } = useLocalSearchParams<{ babyName: string }>();
  const { setOnboardingComplete } = useBabyStore();

  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(30);
  const cardsOpacity = useSharedValue(0);
  const btnOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 700 }));
    titleY.value = withDelay(300, withSpring(0, { damping: 18, stiffness: 160 }));
    cardsOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    btnOpacity.value = withDelay(1300, withTiming(1, { duration: 500 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const cardsStyle = useAnimatedStyle(() => ({ opacity: cardsOpacity.value }));
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnOpacity.value }));

  const handleStart = async () => {
    await setOnboardingComplete();
    router.replace('/(app)');
  };

  const BENEFITS = [
    { icon: '📊', text: 'Track sleep, feeds, diapers & more' },
    { icon: '🔮', text: 'Predict nap times from patterns' },
    { icon: '💊', text: 'Never miss a medicine dose' },
    { icon: '📖', text: 'Capture milestones & memories' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.midnight }}>
      <StarField />
      <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24, alignItems: 'center' }}>
        <Animated.View style={[titleStyle, { alignItems: 'center', marginBottom: 48 }]}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🌙</Text>
          <Text style={{
            color: Colors.moonrise,
            fontSize: 28,
            fontFamily: 'PlayfairDisplay_400Regular_Italic',
            textAlign: 'center',
            lineHeight: 38,
            marginBottom: 10,
          }}>
            Welcome to the world,{'\n'}little {babyName}!
          </Text>
          <Text style={{
            color: Colors.starlight,
            fontSize: 15,
            fontFamily: 'DMSans_400Regular',
            textAlign: 'center',
          }}>
            You're all set. Every little moment starts now.
          </Text>
        </Animated.View>

        <Animated.View style={[cardsStyle, { width: '100%', gap: 10, marginBottom: 40 }]}>
          {BENEFITS.map(({ icon, text }) => (
            <View key={text} style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              backgroundColor: Colors.cardBg,
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: Colors.border,
            }}>
              <Text style={{ fontSize: 22 }}>{icon}</Text>
              <Text style={{ color: Colors.moonrise, fontSize: 14, fontFamily: 'DMSans_400Regular', flex: 1 }}>{text}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View style={[btnStyle, { width: '100%' }]}>
          <Button label="Let's begin →" onPress={handleStart} />
        </Animated.View>
      </View>
    </View>
  );
}
