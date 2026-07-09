-- 통증 기록(entries) 테이블
-- content: 자유롭게 작성한 일상 기록 원문
-- logged_at: 이 기록이 설명하는 날짜 (작성일과 다를 수 있음, 예: 어제 일을 오늘 기록)
-- analysis: classifyEntry()가 추출한 신체부위/증상/생활습관 태그, 통증 강도 (jsonb 캐시)
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  logged_at date not null,
  created_at timestamptz not null default now(),
  analysis jsonb not null default '{}'::jsonb
);

create index if not exists entries_user_id_logged_at_idx
  on public.entries (user_id, logged_at desc);

alter table public.entries enable row level security;

create policy "entries_select_own" on public.entries
  for select using (auth.uid() = user_id);

create policy "entries_insert_own" on public.entries
  for insert with check (auth.uid() = user_id);

create policy "entries_update_own" on public.entries
  for update using (auth.uid() = user_id);

create policy "entries_delete_own" on public.entries
  for delete using (auth.uid() = user_id);
