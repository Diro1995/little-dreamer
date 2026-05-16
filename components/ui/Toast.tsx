import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useUIStore } from '@/store/ui.store';

export function ToastContainer() {
  const { toastMessage } = useUIStore();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (toastMessage) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withSpring(-80, { damping: 20, stiffness: 300 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [toastMessage]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: insets.top + 12,
          left: 20,
          right: 20,
          zIndex: 999,
          backgroundColor: Colors.twilight,
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: Colors.border,
          shadowColor: Colors.aurora,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
        },
        style,
      ]}
      pointerEvents="none"
    >
      <Text style={{ color: Colors.moonrise, fontSize: 14, fontFamily: 'DMSans_500Medium' }}>
        {toastMessage}
      </Text>
    </Animated.View>
  );
}
