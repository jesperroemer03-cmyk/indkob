-- ============================================================================
-- Indkøbsliste — schema (kør i Supabase SQL Editor, hele filen på én gang)
--
-- Model: login-løs deling via kode/link. Under motorhjelmen bruger appen
-- Supabase Anonymous Auth, så hver enhed får en rigtig auth.uid(). RLS sikrer
-- at man kun kan se/ændre varer i husstande, man er medlem af. Selve "koden"
-- er adgangsnøglen — alle med koden bliver medlem og deler listen.
--
-- VIGTIGT (engangs): Slå Anonymous sign-ins TIL i dashboardet:
--   Authentication → Sign In / Providers → Anonymous → Enable
-- ============================================================================

create extension if not exists pgcrypto;

-- ── tabeller ────────────────────────────────────────────────────────────────
create table if not exists households (
  id         uuid primary key default gen_random_uuid(),
  code       text unique not null,
  name       text not null default 'Vores indkøb',
  created_at timestamptz not null default now()
);

create table if not exists household_members (
  household_id uuid not null references households(id) on delete cascade,
  user_id      uuid not null,
  display_name text not null,
  joined_at    timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table if not exists items (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name         text not null,
  cat          text not null,
  qty          int  not null default 1 check (qty between 1 and 99),
  bought       boolean not null default false,
  added_by     text,
  created_at   timestamptz not null default now(),
  bought_at    timestamptz
);

create index if not exists items_household_idx on items (household_id, created_at desc);
create index if not exists members_user_idx     on household_members (user_id);

-- ── medlemskabs-tjek (SECURITY DEFINER → bryder RLS-rekursion) ───────────────
create or replace function is_member(h uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from household_members m
    where m.household_id = h and m.user_id = auth.uid()
  );
$$;

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table households        enable row level security;
alter table household_members enable row level security;
alter table items             enable row level security;

drop policy if exists households_select on households;
create policy households_select on households
  for select using (is_member(id));

drop policy if exists members_select on household_members;
create policy members_select on household_members
  for select using (is_member(household_id));

drop policy if exists items_all on items;
create policy items_all on items
  for all
  using (is_member(household_id))
  with check (is_member(household_id));
-- (ingen direkte INSERT på households/members — det sker via RPC'erne nedenfor)

-- ── kode-generator (undgår tvetydige tegn: 0/O, 1/I) ─────────────────────────
create or replace function gen_code()
returns text language sql volatile as $$
  select string_agg(
    substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', (floor(random()*32)::int)+1, 1), '')
  from generate_series(1, 6);
$$;

-- ── opret husstand: laver listen + gør kalderen til medlem ───────────────────
create or replace function create_household(p_name text, p_display_name text)
returns table (id uuid, code text, name text)
language plpgsql security definer
set search_path = public
as $$
declare v_id uuid; v_code text;
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;
  loop
    v_code := gen_code();
    exit when not exists (select 1 from households h where h.code = v_code);
  end loop;
  insert into households (code, name)
    values (v_code, coalesce(nullif(p_name, ''), 'Vores indkøb'))
    returning households.id into v_id;
  insert into household_members (household_id, user_id, display_name)
    values (v_id, auth.uid(), coalesce(nullif(p_display_name, ''), 'Mig'));
  return query
    select v_id, v_code, coalesce(nullif(p_name, ''), 'Vores indkøb');
end;
$$;

-- ── deltag via kode: tilføjer kalderen som medlem (idempotent) ───────────────
create or replace function join_household(p_code text, p_display_name text)
returns table (id uuid, code text, name text)
language plpgsql security definer
set search_path = public
as $$
declare v_id uuid; v_name text; v_code text;
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select h.id, h.name, h.code into v_id, v_name, v_code
    from households h
    where upper(h.code) = upper(trim(p_code));
  if v_id is null then raise exception 'INVALID_CODE'; end if;
  insert into household_members (household_id, user_id, display_name)
    values (v_id, auth.uid(), coalesce(nullif(p_display_name, ''), 'Mig'))
    on conflict (household_id, user_id)
    do update set display_name = excluded.display_name;
  return query select v_id, v_code, v_name;
end;
$$;

grant execute on function create_household(text, text) to anon, authenticated;
grant execute on function join_household(text, text)   to anon, authenticated;

-- ── realtime: send ændringer på items til abonnenter ─────────────────────────
alter publication supabase_realtime add table items;
