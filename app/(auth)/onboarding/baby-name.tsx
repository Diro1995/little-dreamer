import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { StarField } from '@/components/ui/StarField';

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: i === current ? 20 : 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: i === current ? Colors.aurora : Colors.twilight,
          }}
        />
      ))}
    </View>
  );
}

export default function BabyNameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [babyName, setBabyName] = useState('');

  const canContinue = babyName.trim().length > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    router.push({
      pathname: '/(auth)/onboarding/baby-birthday',
      params: { babyName: babyName.trim(), caregiverName: 'Parent' },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.midnight }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StarField />
      <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 48 }}>
          <StepDots current={0} total={5} />
        </View>

        {/* Content */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text
            style={{
              color: Colors.starlight,
              fontSize: 11,
              fontFamily: 'DMSans_500Medium',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              marginBottom: 12,
            }}
          >
            Step 1 of 5
          </Text>
          <Text
            style={{
              color: Colors.moonrise,
              fontSize: 32,
              fontFamily: 'PlayfairDisplay_400Regular_Italic',
              marginBottom: 40,
              lineHeight: 42,
            }}
          >
            Welcome! What's your{'\n'}baby's name?
          </Text>

          <TextInput
            value={babyName}
            onChangeText={setBabyName}
            placeholder="e.g. Emma, Youssef, Lara..."
            placeholderTextColor={`${Colors.starlight}80`}
            style={{
              color: Colors.moonrise,
              fontSize: 28,
              fontFamily: 'PlayfairDisplay_400Regular',
              textAlign: 'center',
              borderBottomWidth: 1.5,
              borderBottomColor: babyName ? Colors.aurora : Colors.border,
              paddingVertical: 12,
              marginBottom: 12,
            }}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
          <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular', textAlign: 'center', marginBottom: 48 }}>
            Any name or nickname works perfectly 🌙
          </Text>
        </View>

        <Button
          label="Continue →"
          onPress={handleContinue}
          disabled={!canContinue}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
