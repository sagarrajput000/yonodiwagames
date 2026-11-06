-- ===========================================================================
-- YonoDiwaGames — promo codes table
-- Run this once in Supabase → SQL Editor → New query → Run.
-- ===========================================================================

create table if not exists public.promo_codes (
    id          uuid primary key default gen_random_uuid(),
    code        text not null,
    game_id     uuid references public.games (id) on delete set null,
    game_name   text,
    note        text,
    link        text,
    expires_at  timestamptz,
    is_active   boolean not null default true,
    sort_order  integer not null default 0,
    created_at  timestamptz not null default now()
);

create index if not exists promo_codes_active_idx
    on public.promo_codes (is_active, sort_order);

alter table public.promo_codes enable row level security;

-- Anyone can read codes (the public page needs this).
drop policy if exists "Promo codes are publicly readable" on public.promo_codes;
create policy "Promo codes are publicly readable"
    on public.promo_codes
    for select
    using (true);

-- Only signed-in admins can add, change or delete codes.
drop policy if exists "Admins can insert promo codes" on public.promo_codes;
create policy "Admins can insert promo codes"
    on public.promo_codes
    for insert
    to authenticated
    with check (true);

drop policy if exists "Admins can update promo codes" on public.promo_codes;
create policy "Admins can update promo codes"
    on public.promo_codes
    for update
    to authenticated
    using (true)
    with check (true);

drop policy if exists "Admins can delete promo codes" on public.promo_codes;
create policy "Admins can delete promo codes"
    on public.promo_codes
    for delete
    to authenticated
    using (true);
