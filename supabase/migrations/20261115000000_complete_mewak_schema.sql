-- ==============================================================================
-- MEWAK LUXURY COMMERCE - COMPLETE SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. CORE TABLES
-- ==============================================================================

-- 2.1 Categories
create table if not exists public.categories (
  id text primary key,
  name text not null,
  description text,
  image text,
  created_at timestamptz default now()
);

-- Seed core categories
insert into public.categories (id, name, description, image)
values
  ('headphones', 'Headphones & Audio', 'Studio planar open-backs, true wireless ANC earbuds & spatial gaming headsets', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80'),
  ('phones', 'Smartphones', 'Snapdragon 8 Gen 3 flagships, dual-screen foldables & periscope cameras', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80'),
  ('smartwatches', 'Smartwatches', 'Aerospace Grade 5 titanium, sapphire glass & precision biometric sensors', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80'),
  ('accessories', 'Accessories & Power', '140W GaN desktop power hubs, magnetic wireless chargers & cables', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80')
on conflict (id) do nothing;

-- 2.2 Products
create table if not exists public.products (
  id text primary key,
  slug text unique not null,
  name text not null,
  subtitle text,
  category text not null references public.categories(id) on update cascade,
  subcategory text,
  price numeric(12, 2) not null check (price >= 0),
  original_price numeric(12, 2) not null check (original_price >= 0),
  discount_percent integer default 0 check (discount_percent >= 0 and discount_percent <= 100),
  is_new boolean default false,
  is_trending boolean default false,
  is_featured boolean default false,
  occasion text default 'Everyday',
  rating numeric(3, 2) default 5.0 check (rating >= 0 and rating <= 5),
  review_count integer default 0 check (review_count >= 0),
  colors jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  fabric text,
  fit text,
  care jsonb default '[]'::jsonb,
  description text,
  details jsonb default '[]'::jsonb,
  returns text,
  in_stock boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for lightning-fast product queries and catalog filters
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_price on public.products(price);
create index if not exists idx_products_is_featured on public.products(is_featured) where is_featured = true;
create index if not exists idx_products_is_trending on public.products(is_trending) where is_trending = true;
create index if not exists idx_products_is_new on public.products(is_new) where is_new = true;

-- 2.3 User Profiles (tied to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  alternate_phone text,
  date_of_birth text,
  gender text default 'Prefer not to say',
  member_tier text default 'Gold Patron Member',
  avatar_url text,
  headline text,
  company text,
  industry text,
  bio text,
  gst_number text,
  preferred_delivery_time text default 'Anytime',
  is_email_verified boolean default false,
  is_phone_verified boolean default false,
  role text not null default 'customer' check (role in ('customer', 'admin', 'superadmin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_phone on public.profiles(phone);
create index if not exists idx_profiles_role on public.profiles(role);

-- 2.4 Customer Delivery Addresses
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  phone text not null,
  street text not null,
  locality text,
  city text not null,
  state text not null,
  pincode text not null,
  type text default 'Home' check (type in ('Home', 'Work', 'Other')),
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_addresses_user_id on public.addresses(user_id);

-- 2.5 Shopping Cart Items (Server-Persisted Cart)
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  selected_color text not null,
  selected_size text not null,
  quantity integer not null check (quantity > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, product_id, selected_color, selected_size)
);

create index if not exists idx_cart_items_user_id on public.cart_items(user_id);

-- 2.6 Wishlist Items (Server-Persisted Wishlist)
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

create index if not exists idx_wishlist_items_user_id on public.wishlist_items(user_id);

-- 2.7 Database Managed Coupons
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'flat')),
  discount_value numeric(10, 2) not null check (discount_value > 0),
  min_order_value numeric(10, 2) default 0,
  max_discount numeric(10, 2),
  usage_limit integer,
  usage_count integer default 0,
  is_active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_coupons_code on public.coupons(code);

-- 2.8 Orders Table (Full E-Commerce Order History)
create table if not exists public.orders (
  id text primary key, -- e.g. MWK-849201
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  address jsonb not null,
  items jsonb not null,
  subtotal numeric(12, 2) not null,
  discount numeric(12, 2) default 0,
  shipping numeric(12, 2) default 0,
  tax numeric(12, 2) default 0,
  total numeric(12, 2) not null,
  coupon_code text,
  payment_method text not null,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  payment_id text,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  status text not null default 'Placed' check (status in (
    'Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery',
    'Delivered', 'Cancelled', 'Return Requested', 'Return Approved',
    'Return Rejected', 'Refunded'
  )),
  tracking_number text,
  courier_partner text default 'BlueDart Express Air',
  estimated_delivery text,
  current_location text default 'Mewak Central Fulfillment Hub, New Delhi',
  status_history jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

-- 2.9 Coupon Redemptions
create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  order_id text references public.orders(id) on delete set null,
  discount_amount numeric(10, 2) not null,
  created_at timestamptz default now()
);

-- 2.10 Product Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  user_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text not null,
  comment text not null,
  verified boolean default false,
  helpful_count integer default 0,
  images jsonb default '[]'::jsonb,
  status text default 'approved' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

create index if not exists idx_reviews_product_id on public.reviews(product_id);
create index if not exists idx_reviews_status on public.reviews(status);

-- 2.11 Returns & Exchanges
create table if not exists public.returns (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  type text not null default 'return' check (type in ('return', 'exchange')),
  reason text not null,
  details text,
  images jsonb default '[]'::jsonb,
  status text not null default 'pending' check (status in (
    'pending', 'approved', 'rejected', 'pickup_scheduled', 'inspected', 'completed', 'refunded'
  )),
  admin_notes text,
  pickup_date text,
  refund_amount numeric(12, 2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_returns_order_id on public.returns(order_id);
create index if not exists idx_returns_user_id on public.returns(user_id);

-- 2.12 Contact & Support Inquiries
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'general' check (type in ('support', 'warranty', 'repair', 'consultation', 'newsletter', 'general')),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  device_model text,
  serial_number text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  admin_notes text,
  reply_sent text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_inquiries_status on public.inquiries(status);
create index if not exists idx_inquiries_type on public.inquiries(type);

-- 2.13 Newsletter Subscribers
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 2.14 Storefront CMS Settings
create table if not exists public.cms_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- ==============================================================================
-- 3. HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- 3.1 Admin Checker Function
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role in ('admin', 'superadmin')
  ) or (
    (select auth.jwt() ->> 'role') = 'service_role'
  );
$$;

-- 3.2 Automatically handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_name text;
  user_phone text;
begin
  user_name := coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Valued Patron');
  user_phone := coalesce(new.raw_user_meta_data->>'phone', new.phone, '');

  insert into public.profiles (
    id,
    name,
    email,
    phone,
    role,
    is_email_verified
  )
  values (
    new.id,
    user_name,
    new.email,
    user_phone,
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    coalesce(new.email_confirmed_at is not null, false)
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(public.profiles.name, excluded.name),
    is_email_verified = (new.email_confirmed_at is not null);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_new_user();

-- 3.3 Dynamic Review Rating Calculation Trigger
create or replace function public.recalculate_product_ratings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id text;
  new_count integer;
  new_avg numeric(3, 2);
begin
  if (TG_OP = 'DELETE') then
    target_id := OLD.product_id;
  else
    target_id := NEW.product_id;
  end if;

  select count(*), coalesce(round(avg(rating)::numeric, 1), 5.0)
  into new_count, new_avg
  from public.reviews
  where product_id = target_id and status = 'approved';

  update public.products
  set rating = new_avg, review_count = new_count
  where id = target_id;

  return null;
end;
$$;

drop trigger if exists on_review_change on public.reviews;
create trigger on_review_change
  after insert or update or delete on public.reviews
  for each row execute function public.recalculate_product_ratings();

-- 3.4 Transactional Order Placement RPC
create or replace function public.place_order_atomic(
  p_order_id text,
  p_user_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_address jsonb,
  p_items jsonb,
  p_subtotal numeric,
  p_discount numeric,
  p_shipping numeric,
  p_tax numeric,
  p_total numeric,
  p_coupon_code text,
  p_payment_method text,
  p_payment_status text,
  p_tracking_number text,
  p_status_history jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
  coupon_rec record;
begin
  -- 1. Validate and consume coupon if provided
  if p_coupon_code is not null and p_coupon_code != '' then
    select * into coupon_rec from public.coupons where code = p_coupon_code for update;
    if not found or not coupon_rec.is_active then
      raise exception 'Coupon % is no longer valid', p_coupon_code;
    end if;

    if coupon_rec.expires_at is not null and coupon_rec.expires_at < now() then
      raise exception 'Coupon % has expired', p_coupon_code;
    end if;

    if coupon_rec.usage_limit is not null and coupon_rec.usage_count >= coupon_rec.usage_limit then
      raise exception 'Coupon % usage limit reached', p_coupon_code;
    end if;

    -- Increment usage
    update public.coupons set usage_count = usage_count + 1 where id = coupon_rec.id;

    -- Record redemption
    insert into public.coupon_redemptions (coupon_id, user_id, order_id, discount_amount)
    values (coupon_rec.id, p_user_id, p_order_id, p_discount);
  end if;

  -- 2. Insert order
  insert into public.orders (
    id,
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    address,
    items,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    coupon_code,
    payment_method,
    payment_status,
    status,
    tracking_number,
    status_history
  )
  values (
    p_order_id,
    p_user_id,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_address,
    p_items,
    p_subtotal,
    p_discount,
    p_shipping,
    p_tax,
    p_total,
    p_coupon_code,
    p_payment_method,
    p_payment_status,
    'Placed',
    p_tracking_number,
    p_status_history
  );

  -- 3. Clear user's server-side cart if authenticated
  if p_user_id is not null then
    delete from public.cart_items where user_id = p_user_id;
  end if;

  return jsonb_build_object('success', true, 'order_id', p_order_id);
end;
$$;

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.returns enable row level security;
alter table public.inquiries enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.cms_settings enable row level security;

-- 4.1 Categories: public read, admin write
create policy "Categories public read" on public.categories for select using (true);
create policy "Categories admin write" on public.categories for all using (public.is_admin());

-- 4.2 Products: public read, admin write
create policy "Products public read" on public.products for select using (true);
create policy "Products admin write" on public.products for all using (public.is_admin());

-- 4.3 Profiles: customer private read/write, admin manage
create policy "Profiles user read" on public.profiles for select
  using ((select auth.uid()) = id or public.is_admin());

create policy "Profiles user update" on public.profiles for update
  using ((select auth.uid()) = id or public.is_admin())
  with check ((select auth.uid()) = id or public.is_admin());

-- 4.4 Addresses: customer private CRUD
create policy "Addresses user read" on public.addresses for select
  using ((select auth.uid()) = user_id or public.is_admin());

create policy "Addresses user insert" on public.addresses for insert
  with check ((select auth.uid()) = user_id or public.is_admin());

create policy "Addresses user update" on public.addresses for update
  using ((select auth.uid()) = user_id or public.is_admin())
  with check ((select auth.uid()) = user_id or public.is_admin());

create policy "Addresses user delete" on public.addresses for delete
  using ((select auth.uid()) = user_id or public.is_admin());

-- 4.5 Cart Items: customer private CRUD
create policy "Cart user read" on public.cart_items for select
  using ((select auth.uid()) = user_id);

create policy "Cart user insert" on public.cart_items for insert
  with check ((select auth.uid()) = user_id);

create policy "Cart user update" on public.cart_items for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Cart user delete" on public.cart_items for delete
  using ((select auth.uid()) = user_id);

-- 4.6 Wishlist Items: customer private CRUD
create policy "Wishlist user read" on public.wishlist_items for select
  using ((select auth.uid()) = user_id);

create policy "Wishlist user insert" on public.wishlist_items for insert
  with check ((select auth.uid()) = user_id);

create policy "Wishlist user delete" on public.wishlist_items for delete
  using ((select auth.uid()) = user_id);

-- 4.7 Coupons: public read active, admin write
create policy "Coupons public read" on public.coupons for select
  using (is_active = true or public.is_admin());

create policy "Coupons admin write" on public.coupons for all
  using (public.is_admin());

-- 4.8 Coupon Redemptions
create policy "Coupon redemptions read" on public.coupon_redemptions for select
  using ((select auth.uid()) = user_id or public.is_admin());

create policy "Coupon redemptions admin write" on public.coupon_redemptions for all
  using (public.is_admin());

-- 4.9 Orders: customer reads own orders, admin manage
create policy "Orders user read" on public.orders for select
  using ((select auth.uid()) = user_id or public.is_admin());

create policy "Orders insert" on public.orders for insert
  with check (true); -- Placed via verified server API or authenticated checkout

create policy "Orders admin update" on public.orders for update
  using (public.is_admin());

-- 4.10 Reviews: approved public read, verified user write, admin manage
create policy "Reviews read" on public.reviews for select
  using (status = 'approved' or (select auth.uid()) = user_id or public.is_admin());

create policy "Reviews insert" on public.reviews for insert
  with check ((select auth.uid()) is not null);

create policy "Reviews update" on public.reviews for update
  using ((select auth.uid()) = user_id or public.is_admin());

create policy "Reviews delete" on public.reviews for delete
  using ((select auth.uid()) = user_id or public.is_admin());

-- 4.11 Returns: customer private CRUD, admin manage
create policy "Returns user read" on public.returns for select
  using ((select auth.uid()) = user_id or public.is_admin());

create policy "Returns user insert" on public.returns for insert
  with check ((select auth.uid()) = user_id or public.is_admin());

create policy "Returns admin update" on public.returns for update
  using (public.is_admin());

-- 4.12 Inquiries: public can submit, admin manage
create policy "Inquiries insert" on public.inquiries for insert
  with check (true);

create policy "Inquiries admin manage" on public.inquiries for all
  using (public.is_admin());

-- 4.13 Newsletter: public can subscribe, admin manage
create policy "Newsletter insert" on public.newsletter_subscribers for insert
  with check (true);

create policy "Newsletter admin manage" on public.newsletter_subscribers for all
  using (public.is_admin());

-- 4.14 CMS Settings: public read, admin write
create policy "CMS Settings public read" on public.cms_settings for select
  using (true);

create policy "CMS Settings admin write" on public.cms_settings for all
  using (public.is_admin());

-- ==============================================================================
-- 5. STORAGE BUCKETS & STORAGE POLICIES
-- ==============================================================================

-- Create buckets for uploads if they do not exist
insert into storage.buckets (id, name, public)
values
  ('products', 'products', true),
  ('avatars', 'avatars', true),
  ('reviews', 'reviews', true),
  ('returns', 'returns', false)
on conflict (id) do nothing;

-- Public Storage Access Policies
create policy "Public view products" on storage.objects for select using (bucket_id = 'products');
create policy "Public view avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "Public view reviews" on storage.objects for select using (bucket_id = 'reviews');

-- Authenticated Upload Policies
create policy "Admin upload products" on storage.objects for insert
  with check (bucket_id = 'products' and (public.is_admin() or (select auth.role()) = 'authenticated'));

create policy "User upload avatar" on storage.objects for insert
  with check (bucket_id = 'avatars' and (select auth.uid()) is not null);

create policy "User upload review images" on storage.objects for insert
  with check (bucket_id = 'reviews' and (select auth.uid()) is not null);

create policy "User upload return evidence" on storage.objects for insert
  with check (bucket_id = 'returns' and (select auth.uid()) is not null);

create policy "User view return evidence" on storage.objects for select
  using (bucket_id = 'returns' and ((select auth.uid()) is not null or public.is_admin()));

-- ==============================================================================
-- 6. PUBLIC USERS VIEW (for Supabase Table Editor convenience)
-- ==============================================================================
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

grant select on public.users to anon, authenticated, service_role;
