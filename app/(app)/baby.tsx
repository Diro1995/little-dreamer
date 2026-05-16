import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, Alert, Switch, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';
import { Colors } from '@/constants/theme';
import { StarField } from '@/components/ui/StarField';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useBabyStore } from '@/store/baby.store';
import { useAuthStore } from '@/store/auth.store';
import { useLogStore } from '@/store/log.store';
import { formatAge } from '@/lib/age';

export default function BabyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { baby, currentCaregiver, updateBaby, reset } = useBabyStore();
  const { signOut } = useAuthStore();
  const { entries } = useLogStore();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(baby?.name ?? '');
  const [use24h, setUse24h] = useState(false);
  const [useOz, setUseOz] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          await reset();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const handleShareCode = async () => {
    if (!baby?.id) return;
    await Share.share({
      message: `Join my baby's Little Steps profile! Baby code: ${baby.id}`,
    });
  };

  if (!baby) return null;

  const saveName = async () => {
    if (nameInput.trim()) {
      await updateBaby({ name: nameInput.trim() });
    }
    setEditingName(false);
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await updateBaby({ photoUri: result.assets[0].uri });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.midnight }}>
      <StarField />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ color: Colors.moonrise, fontSize: 26, fontFamily: 'PlayfairDisplay_400Regular', marginBottom: 4 }}>
          Profile
        </Text>

        {/* Baby card */}
        <Card glowColor={Colors.aurora}>
          <View style={{ alignItems: 'center', gap: 12 }}>
            {/* Photo */}
            <TouchableOpacity onPress={pickPhoto}>
              <View
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  backgroundColor: `${Colors.aurora}25`,
                  borderWidth: 2,
                  borderColor: Colors.aurora,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Text style={{ fontSize: 40 }}>👶</Text>
              </View>
              <View style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: Colors.aurora,
                borderRadius: 12,
                width: 24,
                height: 24,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 12 }}>✏️</Text>
              </View>
            </TouchableOpacity>

            {/* Name */}
            {editingName ? (
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TextInput
                  value={nameInput}
                  onChangeText={setNameInput}
                  style={{
                    color: Colors.moonrise,
                    fontSize: 22,
                    fontFamily: 'PlayfairDisplay_400Regular',
                    textAlign: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.aurora,
                    paddingVertical: 4,
                    minWidth: 120,
                  }}
                  autoFocus
                  onSubmitEditing={saveName}
                />
                <TouchableOpacity onPress={saveName}>
                  <Text style={{ color: Colors.aurora, fontSize: 14, fontFamily: 'DMSans_500Medium' }}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setEditingName(true)}>
                <Text style={{ color: Colors.moonrise, fontSize: 24, fontFamily: 'PlayfairDisplay_400Regular' }}>
                  {baby.name}
                </Text>
              </TouchableOpacity>
            )}

            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: Colors.aurora, fontSize: 16, fontFamily: 'DMSans_700Bold' }}>
                  {formatAge(baby)}
                </Text>
                <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_400Regular' }}>Age</Text>
              </View>
              <View style={{ width: 1, backgroundColor: Colors.border }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: Colors.aurora, fontSize: 16, fontFamily: 'DMSans_700Bold' }}>
                  {format(baby.dob, 'MMM d, yyyy')}
                </Text>
                <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_400Regular' }}>Birthday</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Caregivers */}
        <Card>
          <Text style={{ color: Colors.moonrise, fontSize: 16, fontFamily: 'PlayfairDisplay_400Regular', marginBottom: 12 }}>
            Caregivers
          </Text>
          {baby.caregivers.map((cg) => (
            <View key={cg.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}>
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: `${cg.avatarColor}25`,
                borderWidth: 1.5,
                borderColor: cg.avatarColor,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ color: cg.avatarColor, fontSize: 15, fontFamily: 'DMSans_700Bold' }}>
                  {cg.name[0].toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.moonrise, fontSize: 15, fontFamily: 'DMSans_500Medium' }}>{cg.name}</Text>
                <Text style={{ color: Colors.starlight, fontSize: 12, fontFamily: 'DMSans_400Regular', textTransform: 'capitalize' }}>{cg.role}</Text>
              </View>
              {currentCaregiver?.id === cg.id && (
                <View style={{ backgroundColor: `${Colors.aurora}20`, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ color: Colors.aurora, fontSize: 11, fontFamily: 'DMSans_500Medium' }}>You</Text>
                </View>
              )}
            </View>
          ))}
          {/* Baby code — share with partner to link their account */}
          <View style={{
            backgroundColor: `${Colors.aurora}12`,
            borderRadius: 12,
            padding: 14,
            marginTop: 12,
            borderWidth: 1,
            borderColor: `${Colors.aurora}30`,
          }}>
            <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_500Medium', marginBottom: 6 }}>
              Baby code — share with your partner
            </Text>
            <Text
              selectable
              style={{
                color: Colors.moonrise,
                fontSize: 12,
                fontFamily: 'DMSans_400Regular',
                letterSpacing: 0.5,
                marginBottom: 10,
              }}
            >
              {baby.id}
            </Text>
            <TouchableOpacity
              onPress={handleShareCode}
              style={{
                backgroundColor: Colors.aurora,
                borderRadius: 8,
                paddingVertical: 8,
                paddingHorizontal: 14,
                alignSelf: 'flex-start',
              }}
            >
              <Text style={{ color: '#1C1A38', fontSize: 13, fontFamily: 'DMSans_700Bold' }}>
                Share code
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Settings */}
        <Card>
          <Text style={{ color: Colors.moonrise, fontSize: 16, fontFamily: 'PlayfairDisplay_400Regular', marginBottom: 12 }}>
            Settings
          </Text>

          <View style={{ gap: 0 }}>
            {[
              { label: '24-hour time', value: use24h, set: setUse24h },
              { label: 'Use oz instead of ml', value: useOz, set: setUseOz },
            ].map((s, i) => (
              <View
                key={s.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  borderBottomWidth: i < 1 ? 1 : 0,
                  borderBottomColor: Colors.border,
                }}
              >
                <Text style={{ color: Colors.moonrise, fontSize: 15, fontFamily: 'DMSans_400Regular' }}>
                  {s.label}
                </Text>
                <Switch
                  value={s.value}
                  onValueChange={s.set}
                  trackColor={{ false: Colors.twilight, true: Colors.aurora }}
                  thumbColor={Colors.moonrise}
                />
              </View>
            ))}
          </View>
        </Card>

        {/* Account */}
        <Button
          label="Export data (CSV)"
          variant="ghost"
          onPress={async () => {
            if (!entries.length) {
              Alert.alert('No data', 'Start logging to see data here.');
              return;
            }
            const header = 'Date,Time,Type,Duration (min),Notes\n';
            const rows = entries.map((e) =>
              [
                format(e.startTime, 'yyyy-MM-dd'),
                format(e.startTime, 'HH:mm'),
                e.type,
                e.durationMinutes ?? '',
                (e.notes ?? '').replace(/,/g, ';'),
              ].join(',')
            );
            const csv = header + rows.join('\n');
            await Share.share({ message: csv, title: `${baby.name} Log Export` });
          }}
        />
        <Button
          label="Sign out"
          variant="danger"
          onPress={handleSignOut}
        />
      </ScrollView>
    </View>
  );
}
