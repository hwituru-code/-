-- 생년월일, 성별 추가
alter table public.profiles
  add column if not exists birth_date date,
  add column if not exists sex text;
