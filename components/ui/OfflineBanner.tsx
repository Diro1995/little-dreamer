import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useLogStore } from '@/store/log.store';
import { Colors } from '@/constants/theme';

export function OfflineBanner() {
  const pendingSync = useLogStore((s) => s.pendingSync);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(pendingSync ? 1 : 0, { duration: 300 });
  }, [pendingSync]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        animStyle,
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          alignItems: 'center',
        },
      ]}
    >
      <View
        style={{
          backgroundColor: 'rgba(60,55,110,0.95)',
          paddingHorizontal: 14,
          paddingVertical: 6,
          borderRadius: 99,
          marginTop: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          borderWidth: 1,
          borderColor: 'rgba(200,169,126,0.3)',
        }}
      >
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: Colors.aurora,
          }}
        />
        <Text
          style={{
            color: Colors.moonrise,
            fontSize: 12,
            fontFamily: 'DMSans_500Medium',
          }}
        >
          Saved offline · will sync when connected
        </Text>
      </View>
    </Animated.View>
  );
}
