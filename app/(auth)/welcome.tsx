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
import Svg, { Ellipse, Circle, G } from 'react-native-svg';
import { Colors } from '@/constants/theme';
import { StarField } from '@/components/ui/StarField';
import { Button } from '@/components/ui/Button';

const { width, height } = Dimensions.get('window');

function FootstepsIcon() {
  const c = Colors.aurora;
  return (
    <View
      style={{
        width: 88,
        height: 88,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.aurora,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.55,
        shadowRadius: 22,
      }}
    >
      <Svg width={80} height={80} viewBox="0 0 80 80">
        {/* Left foot — upper left, angled inward */}
        <G transform="rotate(-18, 26, 44)">
          <Ellipse cx={26} cy={44} rx={9} ry={13} fill={c} />
          <Circle cx={16} cy={26} r={4.5} fill={c} />
          <Circle cx={22} cy={21} r={4} fill={c} />
          <Circle cx={29} cy={19} r={3.5} fill={c} />
          <Circle cx={35} cy={22} r={3} fill={c} />
          <Circle cx={39} cy={27} r={2.5} fill={c} />
        </G>
        {/* Right foot — lower right, angled inward (mirror) */}
        <G transform="rotate(18, 54, 54)">
          <Ellipse cx={54} cy={54} rx={9} ry={13} fill={c} />
          <Circle cx={44} cy={36} r={2.5} fill={c} />
          <Circle cx={48} cy={31} r={3} fill={c} />
          <Circle cx={55} cy={29} r={3.5} fill={c} />
          <Circle cx={62} cy={32} r={4} fill={c} />
          <Circle cx={66} cy={37} r={4.5} fill={c} />
        </G>
      </Svg>
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
