-- Run this in your Supabase SQL Editor
create table leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  first_name text,
  last_name text,
  email text,
  phone text,
  city text,
  is_commercial boolean,
  estimated_damage numeric,
  injury_severity numeric,
  estimate_range text
);

-- Set up RLS (Row Level Security)
alter table leads enable row level security;

-- Allow anyone to insert (since it's a lead form)
create policy "Allow public insert" on leads for insert with check (true);

-- Allow authenticated users to view leads
create policy "Allow authenticated select" on leads for select using (auth.role() = 'authenticated');

-- USER MANAGEMENT --

-- Create a table for user profiles with roles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text default 'editor' check (role in ('admin', 'editor'))
);

-- Enable RLS on profiles
alter table profiles enable row level security;

-- Admin can view all profiles
create policy "Admins can view all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Admin can update profiles
create policy "Admins can update profiles" on profiles for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Create a trigger to create a profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'admin'); -- Defaulting first users to admin for now, or you can change to 'editor'
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
