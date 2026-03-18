-- Run this in Supabase SQL Editor
-- Fixes the trigger so it respects the role passed during signup

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
  on conflict (id) do update
    set role = coalesce(new.raw_user_meta_data->>'role', 'customer');
  return new;
end;
$$ language plpgsql security definer;
