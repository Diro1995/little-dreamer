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

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    password === confirmPassword;

  const handleSignUp = async () => {
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    const { error: err } = await signUp(email.trim().toLowerCase(), password, name.trim());
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    // Signed up — go to onboarding to create baby profile
    router.replace('/(auth)/onboarding/baby-name');
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
          Create account
        </Text>
        <Text style={{
          color: Colors.moonrise,
          fontSize: 32,
          fontFamily: 'PlayfairDisplay_400Regular_Italic',
          marginBottom: 36,
          lineHeight: 42,
        }}>
          Let's get you{'\n'}set up
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

        {/* Name */}
        <Text style={{ color: Colors.starlight, fontSize: 12, fontFamily: 'DMSans_500Medium', marginBottom: 6 }}>
          Your first name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Sara, James..."
          placeholderTextColor={`${Colors.starlight}80`}
          autoCapitalize="words"
          autoComplete="given-name"
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
          placeholder="Min. 6 characters"
          placeholderTextColor={`${Colors.starlight}80`}
          secureTextEntry
          autoComplete="new-password"
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

        {/* Confirm password */}
        <Text style={{ color: Colors.starlight, fontSize: 12, fontFamily: 'DMSans_500Medium', marginBottom: 6 }}>
          Confirm password
        </Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repeat your password"
          placeholderTextColor={`${Colors.starlight}80`}
          secureTextEntry
          autoComplete="new-password"
          style={{
            color: Colors.moonrise,
            fontSize: 16,
            fontFamily: 'DMSans_400Regular',
            backgroundColor: Colors.cardBg,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: confirmPassword && password !== confirmPassword
              ? Colors.danger
              : Colors.border,
            padding: 16,
            marginBottom: confirmPassword && password !== confirmPassword ? 6 : 36,
          }}
        />
        {confirmPassword !== '' && password !== confirmPassword && (
          <Text style={{
            color: Colors.danger,
            fontSize: 12,
            fontFamily: 'DMSans_400Regular',
            marginBottom: 28,
          }}>
            Passwords don't match
          </Text>
        )}

        <Button
          label="Create account"
          onPress={handleSignUp}
          disabled={!canSubmit}
          loading={loading}
        />

        {/* Switch to login */}
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          style={{ marginTop: 20, alignItems: 'center' }}
        >
          <Text style={{ color: Colors.starlight, fontSize: 14, fontFamily: 'DMSans_400Regular' }}>
            Already have an account?{' '}
            <Text style={{ color: Colors.aurora, fontFamily: 'DMSans_500Medium' }}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
