import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Baby, Caregiver } from '@/constants/types';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';

interface BabyState {
  baby: Baby | null;
  currentCaregiver: Caregiver | null;
  hasCompletedOnboarding: boolean;
  setBaby: (baby: Baby) => Promise<void>;
  updateBaby: (updates: Partial<Baby>) => Promise<void>;
  setCurrentCaregiver: (caregiver: Caregiver) => void;
  setOnboardingComplete: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
  reset: () => Promise<void>;
}

const KEYS = {
  BABY: 'ld_baby',
  CAREGIVER: 'ld_caregiver',
  ONBOARDING: 'ld_onboarding_done',
};

// No ambiguous chars: excludes 0/O and 1/I
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export const useBabyStore = create<BabyState>((set, get) => ({
  baby: null,
  currentCaregiver: null,
  hasCompletedOnboarding: false,

  setBaby: async (baby) => {
    // Optimistic local update first
    set({ baby });
    await AsyncStorage.setItem(KEYS.BABY, JSON.stringify(baby));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isLocalId = !baby.id.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );

    if (isLocalId) {
      // New baby — INSERT and get the real Supabase UUID back
      const { data: row, error } = await supabase
        .from('babies')
        .insert({
          name: baby.name,
          dob: baby.dob.toISOString().split('T')[0],
          premature_weeks: baby.prematureWeeks ?? 0,
          weight_kg: baby.weightKg ?? null,
          saved_medications: baby.savedMedications ?? [],
          day_start_hour: baby.dayStartHour ?? 6,
          day_end_hour: baby.dayEndHour ?? 20,
        })
        .select('id')
        .single();

      if (error || !row) {
        console.error('setBaby insert error:', error?.message);
        return;
      }

      // Generate a short human-friendly invite code and store it on the baby row
      const inviteCode = generateInviteCode();
      await supabase.from('babies').update({ invite_code: inviteCode }).eq('id', row.id);

      // Replace local ID with Supabase UUID everywhere
      const finalBaby = { ...baby, id: row.id, inviteCode };
      set({ baby: finalBaby });
      await AsyncStorage.setItem(KEYS.BABY, JSON.stringify(finalBaby));

      // Link this caregiver to the baby
      await supabase.from('caregiver_babies').insert({
        caregiver_id: user.id,
        baby_id: row.id,
        role: baby.caregivers[0]?.role ?? 'parent',
        caregiver_name: baby.caregivers[0]?.name ?? 'Parent',
        avatar_color: baby.caregivers[0]?.avatarColor ?? Colors.aurora,
      });
    } else {
      // Existing baby — UPDATE
      await supabase
        .from('babies')
        .update({
          name: baby.name,
          dob: baby.dob.toISOString().split('T')[0],
          premature_weeks: baby.prematureWeeks ?? 0,
          weight_kg: baby.weightKg ?? null,
          saved_medications: baby.savedMedications ?? [],
          day_start_hour: baby.dayStartHour ?? 6,
          day_end_hour: baby.dayEndHour ?? 20,
        })
        .eq('id', baby.id);
    }
  },

  updateBaby: async (updates) => {
    const current = get().baby;
    if (!current) return;
    const updated = { ...current, ...updates };
    set({ baby: updated });
    await AsyncStorage.setItem(KEYS.BABY, JSON.stringify(updated));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('babies')
      .update({
        name: updated.name,
        premature_weeks: updated.prematureWeeks ?? 0,
        weight_kg: updated.weightKg ?? null,
        saved_medications: updated.savedMedications ?? [],
        day_start_hour: updated.dayStartHour ?? 6,
        day_end_hour: updated.dayEndHour ?? 20,
      })
      .eq('id', updated.id);
  },

  setCurrentCaregiver: (caregiver) => {
    set({ currentCaregiver: caregiver });
    AsyncStorage.setItem(KEYS.CAREGIVER, JSON.stringify(caregiver));
  },

  setOnboardingComplete: async () => {
    set({ hasCompletedOnboarding: true });
    await AsyncStorage.setItem(KEYS.ONBOARDING, 'true');
  },

  loadFromStorage: async () => {
    const [babyJson, caregiverJson, onboardingDone] = await Promise.all([
      AsyncStorage.getItem(KEYS.BABY),
      AsyncStorage.getItem(KEYS.CAREGIVER),
      AsyncStorage.getItem(KEYS.ONBOARDING),
    ]);

    const updates: Partial<BabyState> = {};
    if (babyJson) {
      const b = JSON.parse(babyJson);
      b.dob = new Date(b.dob);
      updates.baby = b;
    }
    if (caregiverJson) updates.currentCaregiver = JSON.parse(caregiverJson);
    if (onboardingDone === 'true') updates.hasCompletedOnboarding = true;
    set(updates);
  },

  loadFromSupabase: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: link, error } = await supabase
      .from('caregiver_babies')
      .select('baby_id, role, caregiver_name, avatar_color, babies(*)')
      .eq('caregiver_id', user.id)
      .limit(1)
      .maybeSingle();

    if (error || !link) return;

    // Load all caregivers linked to this baby
    const { data: allLinks } = await supabase
      .from('caregiver_babies')
      .select('caregiver_id, caregiver_name, role, avatar_color')
      .eq('baby_id', link.baby_id);

    const caregivers: Caregiver[] = (allLinks ?? []).map((cg: any) => ({
      id: cg.caregiver_id,
      name: cg.caregiver_name ?? 'Parent',
      role: cg.role as Caregiver['role'],
      avatarColor: cg.avatar_color ?? Colors.aurora,
    }));

    const row = link.babies as any;
    const baby: Baby = {
      id: row.id,
      name: row.name,
      dob: new Date(row.dob),
      prematureWeeks: row.premature_weeks ?? 0,
      weightKg: row.weight_kg ?? undefined,
      savedMedications: row.saved_medications ?? [],
      dayStartHour: row.day_start_hour ?? 6,
      dayEndHour: row.day_end_hour ?? 20,
      caregivers,
      inviteCode: row.invite_code ?? undefined,
    };

    const caregiver: Caregiver = {
      id: user.id,
      name: link.caregiver_name ?? 'Parent',
      role: link.role as Caregiver['role'],
      avatarColor: link.avatar_color ?? Colors.aurora,
    };

    set({ baby, currentCaregiver: caregiver, hasCompletedOnboarding: true });
    await AsyncStorage.setItem(KEYS.BABY, JSON.stringify(baby));
    await AsyncStorage.setItem(KEYS.CAREGIVER, JSON.stringify(caregiver));
    await AsyncStorage.setItem(KEYS.ONBOARDING, 'true');
  },

  reset: async () => {
    set({ baby: null, currentCaregiver: null, hasCompletedOnboarding: false });
    await AsyncStorage.multiRemove([KEYS.BABY, KEYS.CAREGIVER, KEYS.ONBOARDING]);
  },
}));
