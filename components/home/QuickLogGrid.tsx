import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { EventType } from '@/constants/types';

interface TileConfig {
  type: EventType;
  icon: string;
  label: string;
  color: string;
}

const TILES: TileConfig[] = [
  { type: 'sleep',       icon: '😴', label: 'Sleep',   color: Colors.sleepGlow  },
  { type: 'feed_bottle', icon: '🍼', label: 'Feed',    color: Colors.feedGlow   },
  { type: 'diaper',      icon: '💧', label: 'Diaper',  color: Colors.diaperGlow },
  { type: 'pump',        icon: '🫧', label: 'Pump',    color: Colors.pumpGlow   },
  { type: 'temperature', icon: '🌡️', label: 'Temp',    color: Colors.tempGlow   },
  { type: 'medicine',    icon: '💊', label: 'Meds',    color: Colors.medsGlow   },
  { type: 'journal',     icon: '📖', label: 'Journal', color: Colors.journalGlow},
];

interface QuickLogTileProps {
  tile: TileConfig;
  onPress: (type: EventType) => void;
  onLongPress?: (type: EventType) => void;
}

function QuickLogTile({ tile, onPress, onLongPress }: QuickLogTileProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.94, { damping: 20, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress(tile.type);
        }}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          onLongPress?.(tile.type);
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={{
          width: 76,
          height: 76,
          borderRadius: 18,
          backgroundColor: `${tile.color}18`,
          borderWidth: 1,
          borderColor: `${tile.color}30`,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: tile.color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
          gap: 4,
        }}
      >
        <Text style={{ fontSize: 28 }}>{tile.icon}</Text>
        <Text
          style={{
            color: tile.color,
            fontSize: 10,
            fontFamily: 'DMSans_500Medium',
            letterSpacing: 0.5,
          }}
        >
          {tile.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface QuickLogGridProps {
  onTilePress: (type: EventType) => void;
  onSleepLongPress?: () => void;
}

export function QuickLogGrid({ onTilePress, onSleepLongPress }: QuickLogGridProps) {
  const [whiteNoiseOn, setWhiteNoiseOn] = useState(false);

  const handleWhiteNoisePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWhiteNoiseOn(prev => !prev);
  };

  return (
    <View>
      <Text
        style={{
          color: Colors.starlight,
          fontSize: 11,
          fontFamily: 'DMSans_500Medium',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        Quick Log
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {TILES.map((tile) => (
          <QuickLogTile
            key={tile.type}
            tile={tile}
            onPress={onTilePress}
            onLongPress={tile.type === 'sleep' ? () => onSleepLongPress?.() : undefined}
          />
        ))}
        {/* White noise toggle tile */}
        <TouchableOpacity
          onPress={handleWhiteNoisePress}
          activeOpacity={0.8}
          style={{
            width: 76,
            height: 76,
            borderRadius: 18,
            backgroundColor: whiteNoiseOn ? 'rgba(100,149,237,0.22)' : 'rgba(100,149,237,0.1)',
            borderWidth: 1,
            borderColor: whiteNoiseOn ? 'rgba(100,149,237,0.6)' : 'rgba(100,149,237,0.25)',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#6495ED',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: whiteNoiseOn ? 0.4 : 0.15,
            shadowRadius: 8,
            elevation: 4,
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 28 }}>{whiteNoiseOn ? '🔊' : '🌧️'}</Text>
          <Text style={{ color: '#6495ED', fontSize: 10, fontFamily: 'DMSans_500Medium', letterSpacing: 0.5 }}>
            {whiteNoiseOn ? 'On' : 'Rain'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
