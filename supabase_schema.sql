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
