-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role text check (role in ('admin', 'operator', 'viewer')) default 'viewer',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- INCIDENTS TABLE
create table public.incidents (
  id uuid default uuid_generate_v4() primary key,
  source text not null, -- 'SGO', 'GPON', 'MASSIVE'
  external_id text not null, -- Ticket ID or unique event ID
  status text not null,
  severity text,
  region text,
  city text,
  description text,
  opened_at timestamptz,
  payload jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Prevent duplicates per source
  constraint incidents_source_external_id_key unique (source, external_id)
);

-- INCIDENT HISTORY TABLE (Audit)
create table public.incident_history (
  id uuid default uuid_generate_v4() primary key,
  incident_id uuid references public.incidents(id) on delete cascade,
  old_status text,
  new_status text,
  changed_at timestamptz default now()
);

-- INDEXES
create index idx_incidents_status on public.incidents(status);
create index idx_incidents_opened_at on public.incidents(opened_at);
create index idx_incidents_region on public.incidents(region);

-- ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.incidents enable row level security;
alter table public.incident_history enable row level security;

-- POLICIES: PROFILES
create policy "Public profiles are viewable by everyone" 
on public.profiles for select using ( true );

create policy "Users can update own profile" 
on public.profiles for update using ( auth.uid() = id );

-- POLICIES: INCIDENTS
-- Allow read access to all authenticated users
create policy "Authenticated users can view incidents"
on public.incidents for select
to authenticated
using ( true );

-- DENY write access to authenticated users (Implicit by not creating an allow policy)
-- Service Role (used by n8n) bypasses RLS automatically, so no policy needed for writing if using service role key.
-- If using a specific user for ingestion, we would need a policy. Assuming Service Role for now.

-- TRIGGERS

-- 1. Handle New User (Profile Creation)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'viewer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Update Timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_incidents_updated
  before update on public.incidents
  for each row execute procedure public.handle_updated_at();

-- REALTIME CONFIGURATION
-- Enable realtime for incidents table
alter publication supabase_realtime add table public.incidents;
