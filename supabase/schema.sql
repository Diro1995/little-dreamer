-- ============================================================
-- Little Steps — Supabase Schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor)
-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS guards
-- ============================================================

-- ── Babies ───────────────────────────────────────────────────
create table if not exists babies (
  id                uuid        primary key default gen_random_uuid(),
  name              text        not null,
  dob               date        not null,
  premature_weeks   int         not null default 0,
  photo_url         text,
  weight_kg         numeric(5,3),
  saved_medications jsonb       not null default '[]',
  day_start_hour    int         not null default 6,
  day_end_hour      int         not null default 20,
  created_at        timestamptz not null default now()
);

-- ── Caregiver ↔ Baby (many-to-many) ──────────────────────────
create table if not exists caregiver_babies (
  caregiver_id   uuid        not null references auth.users on delete cascade,
  baby_id        uuid        not null references babies     on delete cascade,
  role           text        not null default 'parent'
                             check (role in ('parent','partner','nanny','grandparent')),
  caregiver_name text        not null default 'Parent',
  avatar_color   text        not null default '#A0722A',
  joined_at      timestamptz not null default now(),
  primary key (caregiver_id, baby_id)
);

-- ── Log entries ───────────────────────────────────────────────
create table if not exists log_entries (
  id               uuid        primary key default gen_random_uuid(),
  baby_id          uuid        not null references babies     on delete cascade,
  caregiver_id     uuid        not null references auth.users,
  type             text        not null
                   check (type in (
                     'sleep','feed_breast','feed_bottle','feed_solid',
                     'diaper','pump','medicine','temperature','journal',
                     'milestone','note'
                   )),
  start_time       timestamptz not null,
  end_time         timestamptz,
  duration_minutes int,
  metadata         jsonb       not null default '{}',
  notes            text,
  created_at       timestamptz not null default now()
);

create index if not exists log_entries_baby_start
  on log_entries (baby_id, start_time desc);

-- Enable realtime so both parents see live updates
alter publication supabase_realtime add table log_entries;

-- ── Row Level Security ────────────────────────────────────────
alter table babies           enable row level security;
alter table caregiver_babies enable row level security;
alter table log_entries      enable row level security;

-- Drop old catch-all policies if present (idempotent cleanup)
drop policy if exists "caregivers_read_own_baby"   on babies;
drop policy if exists "caregivers_update_own_baby" on babies;
drop policy if exists "caregivers_insert_baby"     on babies;
drop policy if exists "own_links"                  on caregiver_babies;
drop policy if exists "caregivers_see_logs"        on log_entries;

-- ── babies policies ─────────────────────────────────────────
-- SELECT: only see babies you are linked to
create policy "babies_select" on babies
  for select using (
    id in (
      select baby_id from caregiver_babies
      where caregiver_id = auth.uid()
    )
  );

-- INSERT: any authenticated user can create a baby (link added right after)
create policy "babies_insert" on babies
  for insert with check (auth.uid() is not null);

-- UPDATE: only linked caregivers
create policy "babies_update" on babies
  for update using (
    id in (
      select baby_id from caregiver_babies
      where caregiver_id = auth.uid()
    )
  );

-- ── caregiver_babies policies ────────────────────────────────
-- A user can only read/write their own link rows
create policy "cb_select" on caregiver_babies
  for select using (caregiver_id = auth.uid());

create policy "cb_insert" on caregiver_babies
  for insert with check (caregiver_id = auth.uid());

create policy "cb_update" on caregiver_babies
  for update using (caregiver_id = auth.uid());

create policy "cb_delete" on caregiver_babies
  for delete using (caregiver_id = auth.uid());

-- ── log_entries policies ─────────────────────────────────────
-- SELECT: any caregiver linked to the baby sees all its logs
create policy "logs_select" on log_entries
  for select using (
    baby_id in (
      select baby_id from caregiver_babies
      where caregiver_id = auth.uid()
    )
  );

-- INSERT: must be the authenticated user and linked to the baby
create policy "logs_insert" on log_entries
  for insert with check (
    caregiver_id = auth.uid()
    and baby_id in (
      select baby_id from caregiver_babies
      where caregiver_id = auth.uid()
    )
  );

-- UPDATE / DELETE: only the entry's own author
create policy "logs_update" on log_entries
  for update using (caregiver_id = auth.uid());

create policy "logs_delete" on log_entries
  for delete using (caregiver_id = auth.uid());
