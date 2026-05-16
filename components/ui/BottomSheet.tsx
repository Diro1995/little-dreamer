import React, { useEffect, useCallback } from 'react';
import { View, TouchableWithoutFeedback, Dimensions, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  heightPercent?: number;
  scrollable?: boolean;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  heightPercent = 65,
  scrollable = false,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const sheetHeight = (SCREEN_HEIGHT * heightPercent) / 100;
  const translateY = useSharedValue(sheetHeight);

  const open = useCallback(() => {
    translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
  }, []);

  const close = useCallback(() => {
    translateY.value = withSpring(sheetHeight, { damping: 20, stiffness: 300 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  }, [sheetHeight, onClose]);

  useEffect(() => {
    if (visible) open();
    else translateY.value = sheetHeight;
  }, [visible]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > sheetHeight * 0.3 || e.velocityY > 500) {
        runOnJS(close)();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const ContentWrapper = scrollable ? ScrollView : View;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={close}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: sheetHeight,
            backgroundColor: Colors.dusk,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: Colors.border,
            overflow: 'hidden',
          },
          animatedStyle,
        ]}
      >
        <GestureDetector gesture={panGesture}>
          <View>
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: Colors.starlight,
                  opacity: 0.4,
                }}
              />
            </View>
          </View>
        </GestureDetector>

        <ContentWrapper
          style={{ flex: 1, paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ContentWrapper>
      </Animated.View>
    </View>
  );
}
