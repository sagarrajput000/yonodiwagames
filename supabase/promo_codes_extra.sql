-- ===========================================================================
-- YonoDiwaGames — promo code voucher upgrade
-- Run this once in Supabase → SQL Editor → New query → Run.
-- Adds the offer-type / site / download fields used by the redesigned
-- promo cards (Promocode, Deposit Voucher, Free Game Voucher).
-- ===========================================================================

alter table public.promo_codes
    add column if not exists promo_type   text not null default 'code',
    add column if not exists site_name    text,
    add column if not exists download_url text;

-- Keep offer types to the three supported values.
alter table public.promo_codes
    drop constraint if exists promo_codes_promo_type_check;

alter table public.promo_codes
    add constraint promo_codes_promo_type_check
    check (promo_type in ('code', 'deposit', 'freegame'));

create index if not exists promo_codes_type_idx
    on public.promo_codes (promo_type, is_active, sort_order);
