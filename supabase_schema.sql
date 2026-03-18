-- =============================================
-- ServiHub Database Schema
-- Run this entire file in Supabase SQL Editor
-- =============================================

-- 1. PROFILES (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  role text not null check (role in ('customer', 'worker', 'admin')) default 'customer',
  avatar_url text,
  phone text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. SERVICES
create table if not exists public.services (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price integer not null default 0,
  duration_hours numeric default 2,
  icon text,
  created_at timestamptz default now()
);

-- Seed services
insert into public.services (name, price, duration_hours) values
  ('Laundry', 30000, 2),
  ('House Cleaning', 30000, 4),
  ('Car Washing', 15000, 1),
  ('Slashing', 25000, 3)
on conflict do nothing;

-- 3. WORKERS
create table if not exists public.workers (
  id uuid references public.profiles(id) on delete cascade primary key,
  title text default 'Service Professional',
  bio text,
  skills text[] default '{}',
  rating numeric default 5.0,
  review_count integer default 0,
  years_exp integer default 0,
  hourly_rate integer default 45,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- 4. BOOKINGS
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.profiles(id) on delete cascade not null,
  worker_id uuid references public.workers(id) on delete set null,
  service_name text not null,
  service_id uuid references public.services(id),
  scheduled_at timestamptz not null,
  status text not null check (status in ('pending', 'in_progress', 'completed', 'cancelled')) default 'pending',
  price integer default 0,
  location text,
  notes text,
  created_at timestamptz default now()
);

-- 5. REVIEWS
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings(id) on delete cascade,
  worker_id uuid references public.workers(id) on delete cascade,
  reviewer_name text,
  rating integer check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.workers enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

-- PROFILES policies
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update all profiles"
  on public.profiles for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Allow insert on signup"
  on public.profiles for insert
  with check (true);

-- SERVICES policies (public read)
create policy "Anyone can read services"
  on public.services for select
  using (true);

create policy "Admins can manage services"
  on public.services for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- WORKERS policies
create policy "Anyone can read workers"
  on public.workers for select
  using (true);

create policy "Admins can manage workers"
  on public.workers for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Workers can update own record"
  on public.workers for update
  using (auth.uid() = id);

-- BOOKINGS policies
create policy "Customers can read own bookings"
  on public.bookings for select
  using (auth.uid() = customer_id);

create policy "Customers can create bookings"
  on public.bookings for insert
  with check (auth.uid() = customer_id);

create policy "Workers can read assigned bookings"
  on public.bookings for select
  using (auth.uid() = worker_id);

create policy "Workers can update assigned bookings"
  on public.bookings for update
  using (auth.uid() = worker_id);

create policy "Admins can read all bookings"
  on public.bookings for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update all bookings"
  on public.bookings for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- REVIEWS policies
create policy "Anyone can read reviews"
  on public.reviews for select
  using (true);

create policy "Customers can create reviews"
  on public.reviews for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'customer')
  );

-- =============================================
-- CREATE YOUR ADMIN ACCOUNT
-- =============================================
-- After running this schema:
-- 1. Go to Supabase > Authentication > Users
-- 2. Click "Invite User" and enter your admin email
-- 3. Then run this UPDATE replacing the email:
--
-- update public.profiles
-- set role = 'admin'
-- where email = 'your-admin@email.com';
