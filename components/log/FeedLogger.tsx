import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { EventType, BreastSide } from '@/constants/types';
import { useLogStore } from '@/store/log.store';
import { useBabyStore } from '@/store/baby.store';
import { useUIStore } from '@/store/ui.store';
import { Button } from '@/components/ui/Button';

const COMMON_SOLIDS = [
  'Puree', 'Oatmeal', 'Banana', 'Avocado', 'Sweet Potato',
  'Apple', 'Pear', 'Carrot', 'Peas', 'Mango',
];

type FeedTab = 'breast' | 'bottle' | 'solid';

interface FeedLoggerProps {
  onClose: () => void;
  initialTab?: FeedTab;
}

export function FeedLogger({ onClose, initialTab = 'breast' }: FeedLoggerProps) {
  const [tab, setTab] = useState<FeedTab>(initialTab);
  const [breastSide, setBreastSide] = useState<BreastSide>('left');
  const [volumeMl, setVolumeMl] = useState(120);
  const [unit, setUnit] = useState<'ml' | 'oz'>('ml');
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [customFood, setCustomFood] = useState('');

  const { addEntry } = useLogStore();
  const { baby, currentCaregiver } = useBabyStore();
  const { showToast } = useUIStore();

  const displayVolume = unit === 'oz' ? Math.round((volumeMl / 29.574) * 10) / 10 : volumeMl;

  const adjustVolume = (delta: number) => {
    const step = unit === 'ml' ? 10 : 0.5;
    const next = unit === 'ml'
      ? Math.max(0, volumeMl + delta * 10)
      : Math.max(0, volumeMl + delta * 29.574 * 0.5);
    setVolumeMl(Math.round(next));
  };

  const toggleFood = (food: string) => {
    setSelectedFoods((prev) =>
      prev.includes(food) ? prev.filter((f) => f !== food) : [...prev, food]
    );
  };

  const handleLog = async () => {
    if (!baby || !currentCaregiver) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const typeMap: Record<FeedTab, EventType> = {
      breast: 'feed_breast',
      bottle: 'feed_bottle',
      solid: 'feed_solid',
    };

    const foods = customFood.trim()
      ? [...selectedFoods, customFood.trim()]
      : selectedFoods;

    await addEntry({
      babyId: baby.id,
      caregiverId: currentCaregiver.id,
      type: typeMap[tab],
      startTime: new Date(),
      metadata: {
        breastSide: tab === 'breast' ? breastSide : undefined,
        volumeMl: tab === 'bottle' ? volumeMl : undefined,
        solidFoods: tab === 'solid' ? foods : undefined,
      },
    });

    showToast('Feed logged ✓');
    onClose();
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={{
          color: Colors.moonrise,
          fontSize: 22,
          fontFamily: 'PlayfairDisplay_400Regular',
          textAlign: 'center',
          marginBottom: 16,
        }}
      >
        Log Feed
      </Text>

      {/* Tabs */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: Colors.twilight,
          borderRadius: 12,
          padding: 3,
          marginBottom: 24,
        }}
      >
        {(['breast', 'bottle', 'solid'] as FeedTab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: tab === t ? Colors.dusk : 'transparent',
            }}
          >
            <Text
              style={{
                color: tab === t ? Colors.moonrise : Colors.starlight,
                fontSize: 13,
                fontFamily: 'DMSans_500Medium',
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'breast' && (
        <>
          <Text style={labelStyle}>Which side?</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
            {(['left', 'right', 'both'] as BreastSide[]).map((side) => (
              <TouchableOpacity
                key={side}
                onPress={() => setBreastSide(side)}
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 14,
                  alignItems: 'center',
                  backgroundColor: breastSide === side ? `${Colors.feedGlow}25` : Colors.twilight,
                  borderWidth: 1.5,
                  borderColor: breastSide === side ? Colors.feedGlow : Colors.border,
                }}
              >
                <Text style={{ fontSize: 24 }}>
                  {side === 'left' ? 'L' : side === 'right' ? 'R' : 'B'}
                </Text>
                <Text
                  style={{
                    color: breastSide === side ? Colors.feedGlow : Colors.starlight,
                    fontSize: 12,
                    fontFamily: 'DMSans_500Medium',
                    marginTop: 4,
                    textTransform: 'capitalize',
                  }}
                >
                  {side}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {tab === 'bottle' && (
        <>
          <Text style={labelStyle}>How much?</Text>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
              <TouchableOpacity
                onPress={() => adjustVolume(-1)}
                style={adjBtn}
              >
                <Text style={{ color: Colors.moonrise, fontSize: 28, fontFamily: 'DMSans_400Regular' }}>−</Text>
              </TouchableOpacity>
              <Text style={{ color: Colors.moonrise, fontSize: 48, fontFamily: 'DMSans_700Bold', fontVariant: ['tabular-nums'], minWidth: 100, textAlign: 'center' }}>
                {displayVolume}
              </Text>
              <TouchableOpacity
                onPress={() => adjustVolume(1)}
                style={adjBtn}
              >
                <Text style={{ color: Colors.moonrise, fontSize: 28, fontFamily: 'DMSans_400Regular' }}>+</Text>
              </TouchableOpacity>
            </View>
            {/* Unit toggle */}
            <View style={{ flexDirection: 'row', backgroundColor: Colors.twilight, borderRadius: 99, padding: 2, marginTop: 12 }}>
              {(['ml', 'oz'] as const).map((u) => (
                <TouchableOpacity
                  key={u}
                  onPress={() => setUnit(u)}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 6,
                    borderRadius: 99,
                    backgroundColor: unit === u ? Colors.dusk : 'transparent',
                  }}
                >
                  <Text style={{ color: unit === u ? Colors.moonrise : Colors.starlight, fontSize: 14, fontFamily: 'DMSans_500Medium' }}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}

      {tab === 'solid' && (
        <>
          <Text style={labelStyle}>What foods?</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {COMMON_SOLIDS.map((food) => (
              <TouchableOpacity
                key={food}
                onPress={() => toggleFood(food)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 99,
                  backgroundColor: selectedFoods.includes(food) ? `${Colors.feedGlow}25` : Colors.twilight,
                  borderWidth: 1,
                  borderColor: selectedFoods.includes(food) ? Colors.feedGlow : Colors.border,
                }}
              >
                <Text style={{ color: selectedFoods.includes(food) ? Colors.feedGlow : Colors.starlight, fontSize: 13, fontFamily: 'DMSans_500Medium' }}>
                  {food}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            value={customFood}
            onChangeText={setCustomFood}
            placeholder="Other food..."
            placeholderTextColor={Colors.starlight}
            style={{
              backgroundColor: Colors.twilight,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: Colors.moonrise,
              fontSize: 15,
              fontFamily: 'DMSans_400Regular',
              marginBottom: 16,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          />
        </>
      )}

      <Button label="Log Feed" onPress={handleLog} />
    </ScrollView>
  );
}

const labelStyle = {
  color: Colors.starlight,
  fontSize: 11,
  fontFamily: 'DMSans_500Medium' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
  marginBottom: 10,
};

const adjBtn = {
  width: 52,
  height: 52,
  borderRadius: 26,
  backgroundColor: Colors.twilight,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  borderWidth: 1,
  borderColor: Colors.border,
};
