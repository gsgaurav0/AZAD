-- ==============================================================================
-- 20261115000002_seed_categories.sql
-- Seed standard category hierarchy to satisfy foreign key constraints on public.products
-- ==============================================================================

insert into public.categories (id, name, description, image)
values
  (
    'headphones',
    'Headphones & Audio',
    'Studio planar open-backs, true wireless ANC earbuds & spatial gaming headsets',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'phones',
    'Smartphones',
    'Snapdragon 8 Gen 3 flagships, dual-screen foldables & periscope cameras',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80'
  ),
  (
    'smartwatches',
    'Smartwatches',
    'Aerospace Grade 5 titanium, sapphire glass & precision biometric sensors',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80'
  ),
  (
    'accessories',
    'Accessories & Power',
    '140W GaN desktop power hubs, magnetic wireless chargers & cables',
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80'
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image;

-- Function to dynamically add unknown categories on the fly
create or replace function public.auto_create_category()
returns trigger as $$
begin
  if new.category is not null then
    insert into public.categories (id, name, description)
    values (
      new.category,
      initcap(replace(new.category, '-', ' ')),
      concat('Catalog category for ', new.category)
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create category before insert on products if missing
drop trigger if exists trg_auto_create_category on public.products;
create trigger trg_auto_create_category
before insert or update of category on public.products
for each row
execute function public.auto_create_category();
