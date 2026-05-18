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
import Svg, { Circle, G, Path } from 'react-native-svg';
import { Colors } from '@/constants/theme';
import { StarField } from '@/components/ui/StarField';
import { Button } from '@/components/ui/Button';

const { width, height } = Dimensions.get('window');

function FootstepsIcon() {
  const c = Colors.aurora;
  // Soft teardrop sole path: wider at the ball (top), rounds to a heel (bottom)
  const sole = 'M0,-14 C-8,-14 -12,-8 -12,0 C-12,8 -8,14 0,16 C8,14 12,8 12,0 C12,-8 8,-14 0,-14 Z';
  return (
    <Svg width={80} height={80} viewBox="0 0 80 80">
      {/* Left foot — upper-left, big toe on the inner (right) side */}
      <G transform="translate(24,34) rotate(-22)">
        <Path d={sole} fill={c} />
        <Circle cx={-11} cy={-17} r={4.0} fill={c} />
        <Circle cx={-5}  cy={-21} r={3.6} fill={c} />
        <Circle cx={2}   cy={-22} r={3.2} fill={c} />
        <Circle cx={8}   cy={-20} r={2.8} fill={c} />
        <Circle cx={13}  cy={-15} r={2.4} fill={c} />
      </G>
      {/* Right foot — lower-right, big toe on the inner (left) side */}
      <G transform="translate(56,50) rotate(22)">
        <Path d={sole} fill={c} />
        <Circle cx={-13} cy={-15} r={2.4} fill={c} />
        <Circle cx={-8}  cy={-20} r={2.8} fill={c} />
        <Circle cx={-2}  cy={-22} r={3.2} fill={c} />
        <Circle cx={5}   cy={-21} r={3.6} fill={c} />
        <Circle cx={11}  cy={-17} r={4.0} fill={c} />
      </G>
    </Svg>
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
          <FootstepsIcon />
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
