import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { StarField } from '@/components/ui/StarField';
import { Button } from '@/components/ui/Button';

const { width, height } = Dimensions.get('window');

function MoonIcon() {
  return (
    <View style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }}>
      {/* Crescent moon SVG-like via views */}
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: Colors.aurora,
          shadowColor: Colors.aurora,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 24,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Inner cutout to make crescent */}
        <View
          style={{
            position: 'absolute',
            top: -8,
            right: -12,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: Colors.gradientBase,
          }}
        />
        {/* Sleeping face dots */}
        <View style={{ position: 'absolute', bottom: 18, left: 12 }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <View style={{ width: 5, height: 2, borderRadius: 1, backgroundColor: Colors.midnight }} />
            <View style={{ width: 5, height: 2, borderRadius: 1, backgroundColor: Colors.midnight }} />
          </View>
          <View style={{
            width: 16,
            height: 6,
            borderRadius: 3,
            borderBottomWidth: 2,
            borderBottomColor: Colors.midnight,
            borderLeftWidth: 0,
            borderRightWidth: 0,
            borderTopWidth: 0,
            marginTop: 4,
            marginLeft: 2,
          }} />
        </View>
      </View>
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const iconScale = useSharedValue(0.6);
  const iconOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);
  const buttonsOpacity = useSharedValue(0);
  const buttonsY = useSharedValue(20);

  useEffect(() => {
    iconScale.value = withDelay(200, withSpring(1, { damping: 14, stiffness: 120 }));
    iconOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    titleOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    titleY.value = withDelay(600, withSpring(0, { damping: 20, stiffness: 200 }));
    buttonsOpacity.value = withDelay(1000, withTiming(1, { duration: 500 }));
    buttonsY.value = withDelay(1000, withSpring(0, { damping: 20, stiffness: 200 }));
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsY.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: Colors.midnight }}>
      <StarField />

      {/* Aurora glow behind icon */}
      <View
        style={{
          position: 'absolute',
          top: height * 0.25,
          alignSelf: 'center',
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: Colors.aurora,
          opacity: 0.04,
        }}
        pointerEvents="none"
      />

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
          paddingBottom: insets.bottom + 32,
        }}
      >
        {/* Icon */}
        <Animated.View style={[iconStyle, { marginBottom: 32 }]}>
          <MoonIcon />
        </Animated.View>

        {/* Title + tagline */}
        <Animated.View style={[titleStyle, { alignItems: 'center', marginBottom: 64 }]}>
          <Text
            style={{
              color: Colors.aurora,
              fontSize: 40,
              fontFamily: 'PlayfairDisplay_400Regular_Italic',
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            Little Steps
          </Text>
          <Text
            style={{
              color: Colors.starlight,
              fontSize: 16,
              fontFamily: 'DMSans_400Regular',
              textAlign: 'center',
            }}
          >
            every little moment, remembered
          </Text>
        </Animated.View>

        {/* Buttons */}
        <Animated.View style={[buttonsStyle, { width: '100%', gap: 12 }]}>
          <Button
            label="Get Started"
            onPress={() => router.push('/(auth)/signup')}
          />
          <Button
            label="I have an account"
            variant="ghost"
            onPress={() => router.push('/(auth)/login')}
          />
        </Animated.View>
      </View>
    </View>
  );
}
