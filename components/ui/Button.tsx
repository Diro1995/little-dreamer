import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const heights: Record<string, number> = { sm: 44, md: 52, lg: 60 };
  const fontSizes: Record<string, number> = { sm: 14, md: 16, lg: 16 };
  const height = heights[size];
  const fontSize = fontSizes[size];

  if (variant === 'primary') {
    return (
      <Animated.View style={[animatedStyle, style]}>
        <AnimatedTouchable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={1}
          style={{ borderRadius: 30, overflow: 'hidden', opacity: disabled ? 0.5 : 1 }}
        >
          <LinearGradient
            colors={[Colors.aurora, Colors.auroraLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 24,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#1C1A38" />
            ) : (
              <Text
                style={{
                  color: '#1C1A38',
                  fontSize,
                  fontFamily: 'DMSans_700Bold',
                  letterSpacing: 0.3,
                }}
              >
                {label}
              </Text>
            )}
          </LinearGradient>
        </AnimatedTouchable>
      </Animated.View>
    );
  }

  if (variant === 'ghost') {
    return (
      <Animated.View style={[animatedStyle, style]}>
        <AnimatedTouchable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.7}
          style={{
            height,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <Text
            style={{
              color: Colors.aurora,
              fontSize,
              fontFamily: 'DMSans_500Medium',
            }}
          >
            {label}
          </Text>
        </AnimatedTouchable>
      </Animated.View>
    );
  }

  // danger
  return (
    <Animated.View style={[animatedStyle, style]}>
      <AnimatedTouchable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={{
          height,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          borderRadius: 30,
          backgroundColor: 'rgba(212, 107, 107, 0.15)',
          borderWidth: 1,
          borderColor: Colors.danger,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Text
          style={{
            color: Colors.danger,
            fontSize,
            fontFamily: 'DMSans_500Medium',
          }}
        >
          {label}
        </Text>
      </AnimatedTouchable>
    </Animated.View>
  );
}
