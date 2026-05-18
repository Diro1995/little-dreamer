import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { StarField } from '@/components/ui/StarField';
import { supabase } from '@/lib/supabase';
import { useBabyStore } from '@/store/baby.store';
import { useLogStore } from '@/store/log.store';
import { useAuthStore } from '@/store/auth.store';

export default function JoinFamilyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { loadFromSupabase } = useBabyStore();
  const { syncFromSupabase } = useLogStore();
  const { signOut } = useAuthStore();

  const [caregiverName, setCaregiverName] = useState('');
  const [babyCode, setBabyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    const code = babyCode.trim().toUpperCase();
    if (!code) return;
    setError(null);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Look up baby by the short invite code
    const { data: baby, error: fetchErr } = await supabase
      .from('babies')
      .select('id, name')
      .eq('invite_code', code)
      .maybeSingle();

    if (fetchErr || !baby) {
      setLoading(false);
      setError("Invite code not found. Double-check the code and try again.");
      return;
    }

    // Check if already linked
    const { data: existing } = await supabase
      .from('caregiver_babies')
      .select('baby_id')
      .eq('caregiver_id', user.id)
      .eq('baby_id', baby.id)
      .maybeSingle();

    if (!existing) {
      const avatarColors = ['#5468C4', '#C4723A', '#3AAA8C', '#9A4AC4', '#C87030'];
      const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
      const { error: linkErr } = await supabase.from('caregiver_babies').insert({
        caregiver_id: user.id,
        baby_id: baby.id,
        role: 'parent',
        caregiver_name: caregiverName.trim() || 'Parent',
        avatar_color: randomColor,
      });

      if (linkErr) {
        setLoading(false);
        setError("Couldn't link to this family. Please try again.");
        return;
      }
    }

    // Load baby + logs then navigate to app
    await loadFromSupabase();
    const { baby: loaded } = useBabyStore.getState();
    if (loaded) await syncFromSupabase(loaded.id);
    setLoading(false);
    router.replace('/(app)');
  };

  const handleSignOut = async () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.midnight }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StarField />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 28,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{
          color: Colors.starlight,
          fontSize: 11,
          fontFamily: 'DMSans_500Medium',
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          marginBottom: 8,
        }}>
          No baby linked yet
        </Text>
        <Text style={{
          color: Colors.moonrise,
          fontSize: 30,
          fontFamily: 'PlayfairDisplay_400Regular_Italic',
          marginBottom: 10,
          lineHeight: 40,
        }}>
          Set up or join{'\n'}your family
        </Text>
        <Text style={{ color: Colors.starlight, fontSize: 14, fontFamily: 'DMSans_400Regular', marginBottom: 36 }}>
          Create a new baby profile, or join an existing one with a baby code.
        </Text>

        {/* Option A — new baby */}
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/onboarding/baby-name')}
          activeOpacity={0.8}
          style={{
            backgroundColor: Colors.cardBg,
            borderRadius: 18,
            padding: 20,
            borderWidth: 1.5,
            borderColor: Colors.border,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 28, marginBottom: 8 }}>🌱</Text>
          <Text style={{ color: Colors.moonrise, fontSize: 17, fontFamily: 'DMSans_700Bold', marginBottom: 4 }}>
            New baby
          </Text>
          <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular' }}>
            Set up a fresh profile for your baby
          </Text>
        </TouchableOpacity>

        {/* Option B — join existing */}
        <View style={{
          backgroundColor: Colors.cardBg,
          borderRadius: 18,
          padding: 20,
          borderWidth: 1.5,
          borderColor: Colors.border,
          marginBottom: 32,
        }}>
          <Text style={{ fontSize: 28, marginBottom: 8 }}>🔗</Text>
          <Text style={{ color: Colors.moonrise, fontSize: 17, fontFamily: 'DMSans_700Bold', marginBottom: 4 }}>
            Join existing family
          </Text>
          <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular', marginBottom: 16 }}>
            Ask your partner to share the baby code from their profile screen.
          </Text>

          {error && (
            <View style={{
              backgroundColor: `${Colors.danger}18`,
              borderRadius: 10,
              padding: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: Colors.danger,
            }}>
              <Text style={{ color: Colors.danger, fontSize: 13, fontFamily: 'DMSans_400Regular' }}>
                {error}
              </Text>
            </View>
          )}

          <TextInput
            value={caregiverName}
            onChangeText={setCaregiverName}
            placeholder="Your name"
            placeholderTextColor={`${Colors.starlight}80`}
            autoCorrect={false}
            style={{
              color: Colors.moonrise,
              fontSize: 14,
              fontFamily: 'DMSans_400Regular',
              backgroundColor: Colors.twilight,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 14,
              marginBottom: 12,
            }}
          />

          <TextInput
            value={babyCode}
            onChangeText={(t) => setBabyCode(t.toUpperCase())}
            placeholder="Invite code (e.g. LUNA42)"
            placeholderTextColor={`${Colors.starlight}80`}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            style={{
              color: Colors.moonrise,
              fontSize: 22,
              fontFamily: 'DMSans_700Bold',
              letterSpacing: 8,
              backgroundColor: Colors.twilight,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 14,
              marginBottom: 12,
              textAlign: 'center',
            }}
          />

          <Button
            label="Join family"
            onPress={handleJoin}
            disabled={babyCode.trim().length < 6}
            loading={loading}
          />
        </View>

        {/* Sign out */}
        <TouchableOpacity onPress={handleSignOut} style={{ alignItems: 'center' }}>
          <Text style={{ color: Colors.starlight, fontSize: 13, fontFamily: 'DMSans_400Regular' }}>
            Wrong account?{' '}
            <Text style={{ color: Colors.danger, fontFamily: 'DMSans_500Medium' }}>Sign out</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
