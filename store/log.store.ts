import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogEntry, EventType } from '@/constants/types';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface LogState {
  entries: LogEntry[];
  activeSleep: LogEntry | null;
  addEntry: (entry: Omit<LogEntry, 'id' | 'createdAt'>) => Promise<LogEntry>;
  updateEntry: (id: string, updates: Partial<LogEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  startSleepTimer: (babyId: string, caregiverId: string, overrideStartTime?: Date) => Promise<LogEntry>;
  endSleepTimer: (endTime?: Date) => Promise<void>;
  loadFromStorage: () => Promise<void>;
  syncFromSupabase: (babyId: string) => Promise<void>;
  subscribeToRealtime: (babyId: string) => () => void;
  getEntriesForDay: (date: Date) => LogEntry[];
  getRecentEntries: (limit?: number) => LogEntry[];
}

const STORAGE_KEY = 'ld_log_entries';
const ACTIVE_SLEEP_KEY = 'ld_active_sleep';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function deserializeEntry(raw: any): LogEntry {
  return {
    ...raw,
    startTime: new Date(raw.startTime),
    endTime: raw.endTime ? new Date(raw.endTime) : undefined,
    createdAt: new Date(raw.createdAt),
  };
}

function dbRowToEntry(row: any): LogEntry {
  return {
    id: row.id,
    babyId: row.baby_id,
    caregiverId: row.caregiver_id,
    type: row.type as EventType,
    startTime: new Date(row.start_time),
    endTime: row.end_time ? new Date(row.end_time) : undefined,
    durationMinutes: row.duration_minutes ?? undefined,
    metadata: row.metadata ?? {},
    notes: row.notes ?? undefined,
    createdAt: new Date(row.created_at),
  };
}

function entryToDbRow(entry: LogEntry, authUserId: string) {
  return {
    id: entry.id,
    baby_id: entry.babyId,
    caregiver_id: authUserId,
    type: entry.type,
    start_time: entry.startTime.toISOString(),
    end_time: entry.endTime?.toISOString() ?? null,
    duration_minutes: entry.durationMinutes ?? null,
    metadata: entry.metadata,
    notes: entry.notes ?? null,
    created_at: entry.createdAt.toISOString(),
  };
}

export const useLogStore = create<LogState>((set, get) => ({
  entries: [],
  activeSleep: null,

  addEntry: async (entryData) => {
    const { data: { user } } = await supabase.auth.getUser();
    const entry: LogEntry = {
      ...entryData,
      caregiverId: user?.id ?? entryData.caregiverId,
      id: generateUUID(),
      createdAt: new Date(),
    };

    const entries = [entry, ...get().entries];
    set({ entries });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

    if (user) {
      const { error } = await supabase
        .from('log_entries')
        .insert(entryToDbRow(entry, user.id));
      if (error) console.error('addEntry sync error:', error.message);
    }

    return entry;
  },

  updateEntry: async (id, updates) => {
    const entries = get().entries.map((e) =>
      e.id === id ? { ...e, ...updates } : e
    );
    set({ entries });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dbUpdates: Record<string, any> = {};
    if (updates.endTime !== undefined)
      dbUpdates.end_time = updates.endTime?.toISOString() ?? null;
    if (updates.durationMinutes !== undefined)
      dbUpdates.duration_minutes = updates.durationMinutes;
    if (updates.metadata !== undefined)
      dbUpdates.metadata = updates.metadata;
    if (updates.notes !== undefined)
      dbUpdates.notes = updates.notes;

    if (Object.keys(dbUpdates).length > 0) {
      await supabase
        .from('log_entries')
        .update(dbUpdates)
        .eq('id', id)
        .eq('caregiver_id', user.id);
    }
  },

  deleteEntry: async (id) => {
    const entries = get().entries.filter((e) => e.id !== id);
    set({ entries });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

    if (get().activeSleep?.id === id) {
      set({ activeSleep: null });
      await AsyncStorage.removeItem(ACTIVE_SLEEP_KEY);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('log_entries')
        .delete()
        .eq('id', id)
        .eq('caregiver_id', user.id);
    }
  },

  startSleepTimer: async (babyId, caregiverId, overrideStartTime?: Date) => {
    const { data: { user } } = await supabase.auth.getUser();
    const entry: LogEntry = {
      id: generateUUID(),
      babyId,
      caregiverId: user?.id ?? caregiverId,
      type: 'sleep',
      startTime: overrideStartTime ?? new Date(),
      metadata: {},
      createdAt: new Date(),
    };

    const entries = [entry, ...get().entries];
    set({ entries, activeSleep: entry });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    await AsyncStorage.setItem(ACTIVE_SLEEP_KEY, JSON.stringify(entry));

    if (user) {
      const { error } = await supabase
        .from('log_entries')
        .insert(entryToDbRow(entry, user.id));
      if (error) console.error('startSleepTimer sync error:', error.message);
    }

    return entry;
  },

  endSleepTimer: async (endTime = new Date()) => {
    const active = get().activeSleep;
    if (!active) return;

    const durationMinutes = Math.round(
      (endTime.getTime() - active.startTime.getTime()) / 60000
    );
    const entries = get().entries.map((e) =>
      e.id === active.id ? { ...e, endTime, durationMinutes } : e
    );
    set({ entries, activeSleep: null });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    await AsyncStorage.removeItem(ACTIVE_SLEEP_KEY);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('log_entries')
        .update({
          end_time: endTime.toISOString(),
          duration_minutes: durationMinutes,
        })
        .eq('id', active.id)
        .eq('caregiver_id', user.id);
    }
  },

  loadFromStorage: async () => {
    const [entriesJson, activeSleepJson] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(ACTIVE_SLEEP_KEY),
    ]);
    if (entriesJson) {
      set({ entries: JSON.parse(entriesJson).map(deserializeEntry) });
    }
    if (activeSleepJson) {
      set({ activeSleep: deserializeEntry(JSON.parse(activeSleepJson)) });
    }
  },

  syncFromSupabase: async (babyId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: rows, error } = await supabase
      .from('log_entries')
      .select('*')
      .eq('baby_id', babyId)
      .order('start_time', { ascending: false })
      .limit(500);

    if (error || !rows) {
      console.error('syncFromSupabase error:', error?.message);
      return;
    }

    const entries = rows.map(dbRowToEntry);
    set({ entries });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  },

  subscribeToRealtime: (babyId) => {
    const channel = supabase
      .channel(`logs-${babyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'log_entries',
          filter: `baby_id=eq.${babyId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const entry = dbRowToEntry(payload.new);
            // Skip if we already have it (optimistic insert from this device)
            const exists = get().entries.some((e) => e.id === entry.id);
            if (!exists) {
              set({ entries: [entry, ...get().entries] });
            }
          } else if (payload.eventType === 'UPDATE') {
            const entry = dbRowToEntry(payload.new);
            set({
              entries: get().entries.map((e) => (e.id === entry.id ? entry : e)),
            });
          } else if (payload.eventType === 'DELETE') {
            const id = (payload.old as any).id;
            set({ entries: get().entries.filter((e) => e.id !== id) });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  getEntriesForDay: (date) => {
    const dayStr = format(date, 'yyyy-MM-dd');
    return get().entries.filter(
      (e) => format(e.startTime, 'yyyy-MM-dd') === dayStr
    );
  },

  getRecentEntries: (limit = 10) => get().entries.slice(0, limit),
}));
