create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subtitle text not null,
  description text not null,
  category text not null,
  base_price numeric(10, 2) not null,
  lead_time text not null,
  images jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  story text,
  default_selections jsonb not null default '{}'::jsonb,
  custom_options jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure existing databases created before this schema still auto-generate IDs.
alter table public.products
  alter column id set default gen_random_uuid();

alter table public.products
  alter column id set not null;

alter table public.products
  add column if not exists custom_options jsonb not null default '[]'::jsonb;

alter table public.products
  drop constraint if exists products_category_check;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  hero_image text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  brand_name text not null default 'Atelier Nord',
  color_bg text not null default '#fbfaf8',
  color_ink text not null default '#2b231d',
  color_muted text not null default '#6f655c',
  color_neutral_100 text not null default '#f2ede7',
  color_neutral_200 text not null default '#e8e1d8',
  color_neutral_300 text not null default '#d7cabc',
  color_wood text not null default '#b88a5b',
  color_wood_dark text not null default '#7f5534',
  layout_mode text not null default 'balanced' check (layout_mode in ('compact', 'balanced', 'spacious')),
  container_width text not null default 'standard' check (container_width in ('narrow', 'standard', 'wide')),
  section_spacing text not null default 'balanced' check (section_spacing in ('tight', 'balanced', 'airy')),
  hero_layout text not null default 'split' check (hero_layout in ('split', 'centered', 'image-first')),
  updated_at timestamptz not null default now()
);

alter table public.site_settings
  add column if not exists container_width text not null default 'standard';

alter table public.site_settings
  add column if not exists section_spacing text not null default 'balanced';

alter table public.site_settings
  add column if not exists hero_layout text not null default 'split';

alter table public.site_settings
  drop constraint if exists site_settings_container_width_check;

alter table public.site_settings
  add constraint site_settings_container_width_check
  check (container_width in ('narrow', 'standard', 'wide'));

alter table public.site_settings
  drop constraint if exists site_settings_section_spacing_check;

alter table public.site_settings
  add constraint site_settings_section_spacing_check
  check (section_spacing in ('tight', 'balanced', 'airy'));

alter table public.site_settings
  drop constraint if exists site_settings_hero_layout_check;

alter table public.site_settings
  add constraint site_settings_hero_layout_check
  check (hero_layout in ('split', 'centered', 'image-first'));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
on public.products
for select
to anon, authenticated
using (true);

drop policy if exists "Owners can insert products" on public.products;
create policy "Owners can insert products"
on public.products
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Owners can update products" on public.products;
create policy "Owners can update products"
on public.products
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Owners can delete products" on public.products;
create policy "Owners can delete products"
on public.products
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Owners can read own membership" on public.admin_users;
create policy "Owners can read own membership"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
on public.categories
for select
to anon, authenticated
using (true);

drop policy if exists "Owners can insert categories" on public.categories;
create policy "Owners can insert categories"
on public.categories
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Owners can update categories" on public.categories;
create policy "Owners can update categories"
on public.categories
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Owners can delete categories" on public.categories;
create policy "Owners can delete categories"
on public.categories
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Owners can insert site settings" on public.site_settings;
create policy "Owners can insert site settings"
on public.site_settings
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Owners can update site settings" on public.site_settings;
create policy "Owners can update site settings"
on public.site_settings
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select on public.admin_users to authenticated;
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;

insert into public.categories (slug, name, description, hero_image)
values
  ('tables', 'Tables', 'Statement dining and work tables crafted from solid hardwoods.', 'https://images.unsplash.com/photo-1595515106864-0779d49f9502?auto=format&fit=crop&w=1400&q=80'),
  ('chairs', 'Chairs', 'Comfort-driven seating with bespoke fabrics and sculpted joinery.', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80'),
  ('cabinets', 'Cabinets', 'Architectural storage systems tailored to your interior palette.', 'https://images.unsplash.com/photo-1616628182509-6f4f7f92716f?auto=format&fit=crop&w=1400&q=80'),
  ('shelving', 'Shelving', 'Modular shelving with premium finishes for quiet, elevated spaces.', 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1400&q=80')
on conflict (slug) do nothing;

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

-- After creating your owner account in Supabase Auth,
-- add that user id here (replace the UUID):
-- insert into public.admin_users (user_id)
-- values ('00000000-0000-0000-0000-000000000000')
-- on conflict (user_id) do nothing;
