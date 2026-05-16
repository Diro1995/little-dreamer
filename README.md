# Little Dreamer 🌙

A premium baby tracking app for exhausted parents. Core law: **any log in ≤ 2 taps, zero cognitive load at 3am.**

## Design System — "Midnight Lullaby"
Deep dark celestial aesthetic. Warm gold accents. NOT clinical, NOT pastel.

---

## Setup

### 1. Install Node.js
Download from https://nodejs.org (LTS version)

### 2. Install dependencies
```bash
cd little-dreamer
npm install
```

### 3. Configure environment (optional — for cloud sync)
```bash
cp .env.example .env
# Edit .env with your Supabase URL and anon key
```

### 4. Start the dev server
```bash
npx expo start
```
Then press `i` for iOS simulator, `a` for Android, or scan the QR code with Expo Go.

---

## Architecture

```
app/                    Expo Router screens (file-based routing)
  (auth)/               Onboarding flow (4 steps)
  (app)/                Main tab screens
components/
  ui/                   Design system primitives
  home/                 Home screen cards
  log/                  Log bottom sheets
  timeline/             Timeline list items
  insights/             Charts
store/                  Zustand state (baby, logs, ui)
lib/                    Business logic (sleep engine, analytics, age)
constants/              Theme tokens, TypeScript types
```

## Key UX Laws (3am Mode)

1. **Diaper = 1 tap** from grid, auto-closes. No confirm.
2. **Sleep timer** = long-press the sleep tile, starts instantly.
3. All time inputs **default to NOW**.
4. **No confirmation dialogs** — undo toasts only (3s timeout).
5. **Tap targets minimum 48×48px** everywhere.

## Sleep Prediction Engine

`lib/sleep-engine.ts` blends age-appropriate wake windows with the last 7 days of observed data. Confidence increases as more data accumulates. Predicts next nap time and flags "approaching" when < 20 minutes away.

## Supabase (optional)

Run `supabase/schema.sql` in your Supabase SQL editor to create tables with RLS. Add your project URL and anon key to `.env`.

Real-time caregiver sync is enabled via `supabase_realtime` publication on `log_entries`.
