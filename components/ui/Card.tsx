import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glowColor?: string;
  padding?: number;
}

export function Card({ children, style, glowColor, padding = 16 }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: Colors.cardBg,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: Colors.border,
          padding,
          shadowColor: glowColor ?? Colors.aurora,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
