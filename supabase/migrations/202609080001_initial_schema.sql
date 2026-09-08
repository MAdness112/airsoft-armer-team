-- Airsoft Armer Team — initial production schema
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.roles (
  id uuid primary key default gen_random_uuid(), name text not null unique,
  slug text not null unique, description text, display_order integer not null default 0
);
create table public.members (
  id uuid primary key default gen_random_uuid(), role_id uuid references public.roles(id) on delete set null,
  first_name text not null, last_name text not null default '', callsign text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'), status text not null default 'active' check(status in ('active','reserve','veteran')),
  operator_id text unique, short_bio text, bio text, profile_image_url text not null, hero_image_url text,
  profile_object_position text not null default '50% 50%', hero_object_position text not null default '50% 50%', member_since date,
  primary_replica text, secondary_replica text, gear text, specialty text, play_style text, motto text,
  instagram text, featured boolean not null default false, display_order integer not null default 0,
  is_published boolean not null default true, is_demo boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.badges (id uuid primary key default gen_random_uuid(),name text not null unique,slug text not null unique,description text);
create table public.member_badges (member_id uuid references public.members(id) on delete cascade,badge_id uuid references public.badges(id) on delete cascade,primary key(member_id,badge_id));
create table public.operations (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique check(slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  date date not null, location text not null, latitude numeric(9,6), longitude numeric(9,6), cover_url text not null,
  description text not null, event_type text, organizer text, external_url text, result text,
  is_published boolean not null default true, is_demo boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.operation_members (operation_id uuid references public.operations(id) on delete cascade,member_id uuid references public.members(id) on delete cascade,primary key(operation_id,member_id));
create table public.tags (id uuid primary key default gen_random_uuid(),name text not null unique,slug text not null unique);
create table public.operation_tags (operation_id uuid references public.operations(id) on delete cascade,tag_id uuid references public.tags(id) on delete cascade,primary key(operation_id,tag_id));
create table public.albums (
  id uuid primary key default gen_random_uuid(), operation_id uuid references public.operations(id) on delete set null,
  title text not null, slug text not null unique check(slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),date date not null,location text not null,
  description text not null default '',cover_url text not null,photographer text,download_enabled boolean not null default false,
  is_published boolean not null default true,is_demo boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table public.album_members (album_id uuid references public.albums(id) on delete cascade,member_id uuid references public.members(id) on delete cascade,primary key(album_id,member_id));
create table public.album_tags (album_id uuid references public.albums(id) on delete cascade,tag_id uuid references public.tags(id) on delete cascade,primary key(album_id,tag_id));
create table public.photos (
  id uuid primary key default gen_random_uuid(),album_id uuid not null references public.albums(id) on delete cascade,
  storage_path text not null unique,url text not null,thumbnail_url text,blur_data_url text,alt text not null default '',
  width integer check(width is null or width>0),height integer check(height is null or height>0),sort_order integer not null default 0,
  is_published boolean not null default true,created_at timestamptz not null default now()
);
create table public.photo_members (photo_id uuid references public.photos(id) on delete cascade,member_id uuid references public.members(id) on delete cascade,primary key(photo_id,member_id));
create table public.timeline_events (id uuid primary key default gen_random_uuid(),year integer not null,title text not null,description text,display_order integer not null default 0,is_published boolean not null default true,is_demo boolean not null default false);
create table public.site_settings (key text primary key,value jsonb not null default '{}'::jsonb,updated_at timestamptz not null default now());
create table public.social_links (id uuid primary key default gen_random_uuid(),platform text not null,url text not null,display_order integer not null default 0,is_enabled boolean not null default true);
create table public.contact_messages (id uuid primary key default gen_random_uuid(),name text not null,email text not null,subject text not null,message text not null,status text not null default 'new',created_at timestamptz not null default now());
create table public.recruitment_applications (id uuid primary key default gen_random_uuid(),name text not null,email text not null,location text,experience text,message text not null,status text not null default 'new',created_at timestamptz not null default now());

create index members_status_idx on public.members(status) where is_published;
create index members_order_idx on public.members(display_order);
create index operations_date_idx on public.operations(date desc) where is_published;
create index albums_date_idx on public.albums(date desc) where is_published;
create index photos_album_order_idx on public.photos(album_id,sort_order) where is_published;
create index photo_members_member_idx on public.photo_members(member_id);
create index operation_members_member_idx on public.operation_members(member_id);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and is_admin=true)
$$;
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now();return new;end $$;
create trigger members_touch before update on public.members for each row execute function public.touch_updated_at();
create trigger operations_touch before update on public.operations for each row execute function public.touch_updated_at();
create trigger albums_touch before update on public.albums for each row execute function public.touch_updated_at();
create trigger settings_touch before update on public.site_settings for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;alter table public.roles enable row level security;alter table public.members enable row level security;alter table public.badges enable row level security;alter table public.member_badges enable row level security;alter table public.operations enable row level security;alter table public.operation_members enable row level security;alter table public.tags enable row level security;alter table public.operation_tags enable row level security;alter table public.albums enable row level security;alter table public.album_members enable row level security;alter table public.album_tags enable row level security;alter table public.photos enable row level security;alter table public.photo_members enable row level security;alter table public.timeline_events enable row level security;alter table public.site_settings enable row level security;alter table public.social_links enable row level security;alter table public.contact_messages enable row level security;alter table public.recruitment_applications enable row level security;

create policy "public roles" on public.roles for select using(true);create policy "public members" on public.members for select using(is_published);create policy "public badges" on public.badges for select using(true);create policy "public member badges" on public.member_badges for select using(true);create policy "public operations" on public.operations for select using(is_published);create policy "public operation members" on public.operation_members for select using(true);create policy "public tags" on public.tags for select using(true);create policy "public operation tags" on public.operation_tags for select using(true);create policy "public albums" on public.albums for select using(is_published);create policy "public album members" on public.album_members for select using(true);create policy "public album tags" on public.album_tags for select using(true);create policy "public photos" on public.photos for select using(is_published);create policy "public photo members" on public.photo_members for select using(true);create policy "public timeline" on public.timeline_events for select using(is_published);create policy "public settings" on public.site_settings for select using(true);create policy "public socials" on public.social_links for select using(is_enabled);
create policy "own profile" on public.profiles for select to authenticated using(id=auth.uid());
create policy "public contact insert" on public.contact_messages for insert to anon,authenticated with check(char_length(name) between 2 and 100 and char_length(message) between 5 and 5000);
create policy "public recruitment insert" on public.recruitment_applications for insert to anon,authenticated with check(char_length(name) between 2 and 100 and char_length(message) between 5 and 5000);

do $$ declare t text; begin foreach t in array array['profiles','roles','members','badges','member_badges','operations','operation_members','tags','operation_tags','albums','album_members','album_tags','photos','photo_members','timeline_events','site_settings','social_links','contact_messages','recruitment_applications'] loop execute format('create policy "admin all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',t); end loop; end $$;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('album-photos','album-photos',true,15728640,array['image/jpeg','image/png','image/webp','image/avif']),('site-media','site-media',true,15728640,array['image/jpeg','image/png','image/webp','image/avif','image/svg+xml']) on conflict(id) do nothing;
create policy "public media read" on storage.objects for select using(bucket_id in('album-photos','site-media'));
create policy "admin media insert" on storage.objects for insert to authenticated with check(bucket_id in('album-photos','site-media') and public.is_admin());
create policy "admin media update" on storage.objects for update to authenticated using(bucket_id in('album-photos','site-media') and public.is_admin()) with check(bucket_id in('album-photos','site-media') and public.is_admin());
create policy "admin media delete" on storage.objects for delete to authenticated using(bucket_id in('album-photos','site-media') and public.is_admin());
