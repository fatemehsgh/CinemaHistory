-- ========================================================
-- کدهای ساخت جداول دیتابیس سینما لاگ در Supabase
-- این کدها را کپی کرده و در بخش SQL Editor در داشبورد Supabase اجرا (Run) کنید.
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

create policy "پروفایل‌ها برای همه قابل مشاهده است" on public.profiles
  for select using (true);

create policy "هر کاربر می‌تواند پروفایل خود را ویرایش کند" on public.profiles
  for update using (auth.uid() = id);

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

create policy "هر کاربر فقط فیلم‌های خودش را ببیند" on public.movies
  for select using (auth.uid() = user_id);

create policy "هر کاربر می‌تواند برای خودش فیلم ثبت کند" on public.movies
  for insert with check (auth.uid() = user_id);

create policy "هر کاربر می‌تواند فیلم‌های خودش را ویرایش کند" on public.movies
  for update using (auth.uid() = user_id);

create policy "هر کاربر می‌تواند فیلم‌های خودش را حذف کند" on public.movies
  for delete using (auth.uid() = user_id);


-- ۳. فعال‌سازی همگام‌سازی لحظه‌ای (Realtime Sync) بین گوشی و کامپیوتر
alter publication supabase_realtime add table public.movies;
