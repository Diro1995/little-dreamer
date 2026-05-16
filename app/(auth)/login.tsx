import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { StarField } from '@/components/ui/StarField';
import { useAuthStore } from '@/store/auth.store';
import { useBabyStore } from '@/store/baby.store';
import { useLogStore } from '@/store/log.store';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuthStore();
  const { loadFromSupabase } = useBabyStore();
  const { syncFromSupabase } = useLogStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length >= 6;

  const handleSignIn = async () => {
    if (!canSubmit) return;
    setError(null);
    setLoading(true);

    const { error: err } = await signIn(email.trim().toLowerCase(), password);
    if (err) {
      setLoading(false);
      setError(err);
      return;
    }

    // Load baby profile from Supabase
    await loadFromSupabase();
    const { baby } = useBabyStore.getState();

    if (baby) {
      // Sync all logs for this baby then go to app
      await syncFromSupabase(baby.id);
      setLoading(false);
      router.replace('/(app)');
    } else {
      // No baby linked to this account yet
      setLoading(false);
      router.replace('/(auth)/join-family');
    }
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
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
          <Text style={{ color: Colors.aurora, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>

        {/* Heading */}
        <Text style={{
          color: Colors.starlight,
          fontSize: 11,
          fontFamily: 'DMSans_500Medium',
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          marginBottom: 8,
        }}>
          Welcome back
        </Text>
        <Text style={{
          color: Colors.moonrise,
          fontSize: 32,
          fontFamily: 'PlayfairDisplay_400Regular_Italic',
          marginBottom: 36,
          lineHeight: 42,
        }}>
          Sign in to{'\n'}Little Steps
        </Text>

        {/* Error */}
        {error && (
          <View style={{
            backgroundColor: `${Colors.danger}18`,
            borderRadius: 12,
            padding: 14,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: Colors.danger,
          }}>
            <Text style={{ color: Colors.danger, fontSize: 14, fontFamily: 'DMSans_400Regular' }}>
              {error}
            </Text>
          </View>
        )}

        {/* Email */}
        <Text style={{ color: Colors.starlight, fontSize: 12, fontFamily: 'DMSans_500Medium', marginBottom: 6 }}>
          Email
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={`${Colors.starlight}80`}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={{
            color: Colors.moonrise,
            fontSize: 16,
            fontFamily: 'DMSans_400Regular',
            backgroundColor: Colors.cardBg,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: Colors.border,
            padding: 16,
            marginBottom: 16,
          }}
        />

        {/* Password */}
        <Text style={{ color: Colors.starlight, fontSize: 12, fontFamily: 'DMSans_500Medium', marginBottom: 6 }}>
          Password
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          placeholderTextColor={`${Colors.starlight}80`}
          secureTextEntry
          autoComplete="current-password"
          onSubmitEditing={handleSignIn}
          returnKeyType="done"
          style={{
            color: Colors.moonrise,
            fontSize: 16,
            fontFamily: 'DMSans_400Regular',
            backgroundColor: Colors.cardBg,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: Colors.border,
            padding: 16,
            marginBottom: 36,
          }}
        />

        <Button
          label="Sign in"
          onPress={handleSignIn}
          disabled={!canSubmit}
          loading={loading}
        />

        {/* Switch to signup */}
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/signup')}
          style={{ marginTop: 20, alignItems: 'center' }}
        >
          <Text style={{ color: Colors.starlight, fontSize: 14, fontFamily: 'DMSans_400Regular' }}>
            No account yet?{' '}
            <Text style={{ color: Colors.aurora, fontFamily: 'DMSans_500Medium' }}>Create one</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
