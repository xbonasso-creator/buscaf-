-- ══════════════════════════════════════════════════════════
-- BUSCAFÉ — Schema completo
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ══════════════════════════════════════════════════════════

-- ── 1. PROFILES ────────────────────────────────────────────
-- Extiende auth.users con datos extra del usuario
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  avatar_url  text,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Usuarios ven su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuarios editan su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── 2. CAFES ───────────────────────────────────────────────
-- Admin carga desde el dashboard de Supabase
create table if not exists public.cafes (
  id              text primary key,
  name            text not null,
  description     text,
  rating          numeric(3,1) default 0,
  open            boolean default false,
  image           text,
  direccion       text,
  distancia       text,
  zona            text,
  horarios        jsonb default '[]',
  servicios       jsonb default '[]',
  fotos           jsonb default '[]',
  lat             numeric(9,6),
  lng             numeric(9,6),
  tiene_cuponera  boolean default false,
  cuponera_max    int default 10,
  menu            jsonb default '[]',
  promociones     jsonb default '[]',
  eventos         jsonb default '[]',
  created_at      timestamptz default now()
);

alter table public.cafes enable row level security;

-- Todos pueden leer cafés
create policy "Cafés públicos para todos"
  on public.cafes for select
  to anon, authenticated
  using (true);


-- ── 3. FAVORITES ───────────────────────────────────────────
create table if not exists public.favorites (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  cafe_id    text references public.cafes(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, cafe_id)
);

alter table public.favorites enable row level security;

create policy "Usuarios gestionan sus favoritos"
  on public.favorites for all
  using (auth.uid() = user_id);


-- ── 4. CUPONERAS ───────────────────────────────────────────
create table if not exists public.cuponeras (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  cafe_id    text references public.cafes(id) on delete cascade not null,
  sellos     int default 0,
  max_sellos int default 10,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, cafe_id)
);

alter table public.cuponeras enable row level security;

create policy "Usuarios gestionan sus cuponeras"
  on public.cuponeras for all
  using (auth.uid() = user_id);


-- ── 5. RESEÑAS ─────────────────────────────────────────────
create table if not exists public.resenas (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  cafe_id    text references public.cafes(id) on delete cascade not null,
  rating     int check (rating between 1 and 5) not null,
  text       text,
  author_name text,
  created_at timestamptz default now()
);

alter table public.resenas enable row level security;

create policy "Reseñas públicas para leer"
  on public.resenas for select
  to anon, authenticated
  using (true);

create policy "Usuarios crean sus reseñas"
  on public.resenas for insert
  with check (auth.uid() = user_id);

create policy "Usuarios editan sus reseñas"
  on public.resenas for update
  using (auth.uid() = user_id);

create policy "Usuarios borran sus reseñas"
  on public.resenas for delete
  using (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════
-- Listo. Después podés cargar los cafés desde:
--   Supabase Dashboard → Table Editor → cafes → Insert row
-- ══════════════════════════════════════════════════════════
