-- Supabase registrations schema for JoGEDA Investment Conference
-- This is a reference for configuring your Supabase project.
-- Apply via Supabase SQL editor or migrations in your Supabase project.

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),

  -- Core identity
  conference_code text not null,
  first_name text not null,
  last_name text not null,
  preferred_name text,
  title text,
  organisation text,
  email text not null,
  phone text,

  -- Profile / extended data
  bio text,
  investment_focus text,
  linkedin_website text,

  -- Consents
  photo_consent boolean not null default false,
  code_of_conduct boolean not null default false,
  photography_consent boolean not null default false,

  -- XS linkage
  xs_user_id text,

  -- Check-in state (Option A)
  checked_in boolean not null default false,
  checked_in_at timestamptz,

  created_at timestamptz not null default now()
);

create index if not exists registrations_conference_code_idx
  on public.registrations (conference_code);

create index if not exists registrations_email_idx
  on public.registrations (lower(email));

create index if not exists registrations_xs_user_id_idx
  on public.registrations (xs_user_id);

