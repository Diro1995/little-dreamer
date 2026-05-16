import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Dreamy aurora gradient background — replaces the old dark star field.
// Each blob is a soft circle via LinearGradient + borderRadius overlay.
export const StarField = memo(function StarField() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Base gradient */}
      <LinearGradient
        colors={['#FFD4C4', '#F0ECFF', '#E8F0FF']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Peach/pink blob — top left */}
      <View style={{
        position: 'absolute', top: -120, left: -100,
        width: 380, height: 380, borderRadius: 190,
        backgroundColor: 'rgba(255,168,140,0.52)',
      }} />
      {/* Purple blob — top right */}
      <View style={{
        position: 'absolute', top: -80, right: -100,
        width: 300, height: 300, borderRadius: 150,
        backgroundColor: 'rgba(185,135,238,0.42)',
      }} />
      {/* Warm orange blob — center */}
      <View style={{
        position: 'absolute', top: '35%', left: '10%',
        width: 280, height: 280, borderRadius: 140,
        backgroundColor: 'rgba(255,195,110,0.28)',
      }} />
      {/* Blue blob — bottom right */}
      <View style={{
        position: 'absolute', bottom: -80, right: -60,
        width: 260, height: 260, borderRadius: 130,
        backgroundColor: 'rgba(120,170,255,0.32)',
      }} />
    </View>
  );
});
