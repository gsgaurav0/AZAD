-- ============================================================
-- MEWAK LUXURY ELECTRONICS & AUDIO
-- MIGRATION: Create public.users view and sync with public.profiles
-- This ensures the "users" table is visible directly in the Supabase Table Editor
-- ============================================================

-- 1. Create or replace public.users view
create or replace view public.users as
select
  p.id,
  p.name,
  p.email,
  p.phone,
  p.alternate_phone,
  p.date_of_birth,
  p.gender,
  p.member_tier,
  p.role,
  p.avatar_url,
  p.headline,
  p.company,
  p.industry,
  p.bio,
  p.gst_number,
  p.preferred_delivery_time,
  p.is_email_verified,
  p.is_phone_verified,
  p.created_at,
  p.updated_at
from public.profiles p;

-- 2. Enable permissions so the view is accessible in Table Editor and API
grant select on public.users to anon, authenticated, service_role;

-- 3. Instead of trigger on public.users to allow updates via Table Editor if desired
create or replace function public.sync_users_view()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (TG_OP = 'UPDATE') then
    update public.profiles set
      name = new.name,
      email = new.email,
      phone = new.phone,
      alternate_phone = new.alternate_phone,
      date_of_birth = new.date_of_birth,
      gender = new.gender,
      member_tier = new.member_tier,
      role = new.role,
      avatar_url = new.avatar_url,
      headline = new.headline,
      company = new.company,
      industry = new.industry,
      bio = new.bio,
      gst_number = new.gst_number,
      preferred_delivery_time = new.preferred_delivery_time,
      is_email_verified = new.is_email_verified,
      is_phone_verified = new.is_phone_verified,
      updated_at = now()
    where id = old.id;
    return new;
  elsif (TG_OP = 'DELETE') then
    delete from public.profiles where id = old.id;
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists on_users_view_dml on public.users;
create trigger on_users_view_dml
  instead of update or delete on public.users
  for each row execute function public.sync_users_view();

comment on view public.users is 'Live synchronized view of all registered patrons and users with full account details.';
