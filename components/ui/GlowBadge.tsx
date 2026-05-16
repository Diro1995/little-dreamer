import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '@/constants/theme';

interface GlowBadgeProps {
  label: string;
  color: string;
  size?: 'sm' | 'md';
}

export function GlowBadge({ label, color, size = 'md' }: GlowBadgeProps) {
  const padding = size === 'sm' ? { paddingHorizontal: 8, paddingVertical: 3 } : { paddingHorizontal: 12, paddingVertical: 5 };
  const fontSize = size === 'sm' ? 10 : 11;

  return (
    <View
      style={[
        {
          borderRadius: 99,
          backgroundColor: `${color}20`,
          borderWidth: 1,
          borderColor: `${color}40`,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 6,
        },
        padding,
      ]}
    >
      <Text
        style={{
          color,
          fontSize,
          fontFamily: 'DMSans_500Medium',
          letterSpacing: 0.08 * 16,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
