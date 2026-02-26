-- KhetiWala Supabase Database Schema

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE (Extends Supabase Auth)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  phone text,
  role text check (role in ('Farmer', 'Buyer', 'FPO', 'Admin')) default 'Farmer',
  location_district text,
  location_state text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security (RLS)
alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy "Public profiles are viewable by everyone" 
  on profiles for select using (true);

create policy "Users can insert their own profile" 
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile" 
  on profiles for update using (auth.uid() = id);

-- Function to handle new user signups via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'Farmer');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create a profile entry when a new user signs up
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. CROPS CATALOG
-- -----------------------------------------------------------------------------
create table public.crops (
  id bigserial primary key,
  name_en text not null,
  name_hi text,
  name_mr text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert initial crop data
insert into public.crops (name_en, name_hi, name_mr, category) values
  ('Wheat', 'गेहूं', 'गहू', 'Cereal'),
  ('Tomato', 'टमाटर', 'टोमॅटो', 'Vegetable'),
  ('Soybean', 'सोयाबीन', 'सोयाबीन', 'Oilseed'),
  ('Chana', 'चना', 'हरभरा', 'Pulse'),
  ('Onion', 'प्याज', 'कांदा', 'Vegetable'),
  ('Rice', 'चावल', 'तांदूळ', 'Cereal'),
  ('Cotton', 'कपास', 'कापूस', 'Cash Crop');

-- RLS
alter table public.crops enable row level security;
create policy "Crops are viewable by everyone" on crops for select using (true);
create policy "Only admins can insert crops" on crops for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'Admin')
);


-- -----------------------------------------------------------------------------
-- 3. LISTINGS (Marketplace)
-- -----------------------------------------------------------------------------
create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  farmer_id uuid references public.profiles(id) not null,
  crop_id bigint references public.crops(id) not null,
  quantity_kg numeric not null,
  price_per_quintal numeric not null,
  harvest_date date not null,
  spoilage_risk text check (spoilage_risk in ('Low', 'Medium', 'High')),
  status text check (status in ('Active', 'Pending_Sale', 'Sold', 'Cancelled')) default 'Active',
  location_district text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.listings enable row level security;
create policy "Listings are viewable by everyone" on listings for select using (true);
create policy "Farmers can insert their own listings" on listings for insert with check (auth.uid() = farmer_id);
create policy "Farmers can update their own listings" on listings for update using (auth.uid() = farmer_id);
create policy "Farmers can delete their own listings" on listings for delete using (auth.uid() = farmer_id);


-- -----------------------------------------------------------------------------
-- 4. MANDIS (Markets)
-- -----------------------------------------------------------------------------
create table public.mandis (
  id bigserial primary key,
  name text not null,
  district text not null,
  state text not null,
  lat double precision,
  lng double precision,
  transport_rate_per_km numeric
);

-- Insert initial Mandi data
insert into public.mandis (name, district, state, lat, lng, transport_rate_per_km) values
  ('Nagpur Mandi', 'Nagpur', 'Maharashtra', 21.1458, 79.0882, 2.5),
  ('Wardha Mandi', 'Wardha', 'Maharashtra', 20.7453, 78.6022, 3.0),
  ('Amravati Mandi', 'Amravati', 'Maharashtra', 20.9333, 77.75, 3.5),
  ('Pune Mandi', 'Pune', 'Maharashtra', 18.5204, 73.8567, 6.0),
  ('Mumbai APMC', 'Mumbai', 'Maharashtra', 19.0760, 72.8777, 8.5);

-- RLS
alter table public.mandis enable row level security;
create policy "Mandis are viewable by everyone" on mandis for select using (true);


-- -----------------------------------------------------------------------------
-- 5. MANDI PRICES (Daily Pricing History)
-- -----------------------------------------------------------------------------
create table public.mandi_prices (
  id uuid default uuid_generate_v4() primary key,
  mandi_id bigint references public.mandis(id) not null,
  crop_id bigint references public.crops(id) not null,
  price_per_quintal numeric not null,
  date date not null,
  unique (mandi_id, crop_id, date) -- Prevents duplicate prices for same day
);

-- RLS
alter table public.mandi_prices enable row level security;
create policy "Mandi prices are viewable by everyone" on mandi_prices for select using (true);


-- -----------------------------------------------------------------------------
-- Create convenient views for the application
-- -----------------------------------------------------------------------------

-- View to join listings with crops and farmer info
create or replace view public.vw_active_listings as
  select 
    l.id,
    p.full_name as farmer_name,
    c.name_en as crop_name,
    l.quantity_kg,
    l.price_per_quintal,
    l.harvest_date,
    l.spoilage_risk,
    l.location_district,
    l.created_at
  from public.listings l
  join public.profiles p on l.farmer_id = p.id
  join public.crops c on l.crop_id = c.id
  where l.status = 'Active'
  order by l.created_at desc;

-- Setup Storage Buckets (Optional for profile pics / crop photos)
insert into storage.buckets (id, name, public) 
values ('crop_images', 'crop_images', true)
on conflict do nothing;
