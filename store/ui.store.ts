import { create } from 'zustand';
import { EventType } from '@/constants/types';

interface UIState {
  activeLogSheet: EventType | null;
  toastMessage: string | null;
  toastTimer: ReturnType<typeof setTimeout> | null;
  openLogSheet: (type: EventType) => void;
  closeLogSheet: () => void;
  showToast: (message: string, duration?: number) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  activeLogSheet: null,
  toastMessage: null,
  toastTimer: null,

  openLogSheet: (type) => set({ activeLogSheet: type }),
  closeLogSheet: () => set({ activeLogSheet: null }),

  showToast: (message, duration = 3000) => {
    const prev = get().toastTimer;
    if (prev) clearTimeout(prev);
    const timer = setTimeout(() => {
      set({ toastMessage: null, toastTimer: null });
    }, duration);
    set({ toastMessage: message, toastTimer: timer });
  },

  hideToast: () => {
    const prev = get().toastTimer;
    if (prev) clearTimeout(prev);
    set({ toastMessage: null, toastTimer: null });
  },
}));
