-- ========================================================
-- کدهای ساخت جداول و راه‌اندازی دیتابیس سینما لاگ در Supabase
-- کاملاً ایمن و قابل اجرای مجدد بدون ارور (Idempotent)
-- ========================================================

-- ۱. ساخت جدول مشخصات کاربران (Profiles)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  name text,
  email text,
  avatar text default '🎬',
  bio text default 'دفترچه خاطرات سینمایی من',
  created_at timestamptz default now()
);

-- فعال‌سازی امنیت سطح سطر (RLS) برای پروفایل‌ها
alter table public.profiles enable row level security;

drop policy if exists "پروفایل‌ها برای همه قابل مشاهده است" on public.profiles;
create policy "پروفایل‌ها برای همه قابل مشاهده است" on public.profiles
  for select using (true);

drop policy if exists "هر کاربر می‌تواند پروفایل خود را ویرایش کند" on public.profiles;
create policy "هر کاربر می‌تواند پروفایل خود را ویرایش کند" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "هر کاربر می‌تواند پروفایل خود را ثبت کند" on public.profiles;
create policy "هر کاربر می‌تواند پروفایل خود را ثبت کند" on public.profiles
  for insert with check (auth.uid() = id);


-- ۲. ساخت جدول فیلم‌ها و سریال‌ها (Movies)
create table if not exists public.movies (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  release_year integer,
  watch_year integer,
  media_type text default 'movie',
  synopsis text,
  genres text[],
  rating numeric,
  poster text,
  review text,
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- فعال‌سازی امنیت سطح سطر (RLS) برای فیلم‌ها
alter table public.movies enable row level security;

drop policy if exists "هر کاربر فقط فیلم‌های خودش را ببیند" on public.movies;
create policy "هر کاربر فقط فیلم‌های خودش را ببیند" on public.movies
  for select using (auth.uid() = user_id);

drop policy if exists "هر کاربر می‌تواند برای خودش فیلم ثبت کند" on public.movies;
create policy "هر کاربر می‌تواند برای خودش فیلم ثبت کند" on public.movies
  for insert with check (auth.uid() = user_id);

drop policy if exists "هر کاربر می‌تواند فیلم‌های خودش را ویرایش کند" on public.movies;
create policy "هر کاربر می‌تواند فیلم‌های خودش را ویرایش کند" on public.movies
  for update using (auth.uid() = user_id);

drop policy if exists "هر کاربر می‌تواند فیلم‌های خودش را حذف کند" on public.movies;
create policy "هر کاربر می‌تواند فیلم‌های خودش را حذف کند" on public.movies
  for delete using (auth.uid() = user_id);


-- ۳. تابع و تریگر ثبت خودکار مشخصات کاربر هنگام ورود با گوگل
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, name, email, avatar, bio)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '🎬'),
    'دفترچه خاطرات سینمایی من'
  )
  on conflict (id) do update set
    name = coalesce(excluded.name, public.profiles.name),
    avatar = coalesce(excluded.avatar, public.profiles.avatar);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ۴. فعال‌سازی همگام‌سازی لحظه‌ای (Realtime Sync) بین گوشی و کامپیوتر
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'movies'
  ) then
    alter publication supabase_realtime add table public.movies;
  end if;
end $$;
