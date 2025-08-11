-- Create stores table
create table if not exists public.info_loja (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  phone text,
  maps_url text,
  opening_time time not null default '09:00',
  closing_time time not null default '18:00',
  slot_interval_minutes int not null default 60,
  instructions text
);

-- Enable RLS for info_loja (public read)
alter table public.info_loja enable row level security;
create policy "Public can read stores" on public.info_loja
for select using (true);

-- Add store relation to existing robust appointments
alter table public.agendamentos_robustos
  add column if not exists loja_id uuid;

-- Add FK to stores
alter table public.agendamentos_robustos
  add constraint agendamentos_robustos_loja_fk
  foreign key (loja_id) references public.info_loja(id) on delete set null;

-- Unique booking per store/date/time/professional (null-safe for PROFISSIONAL)
create unique index if not exists agendamentos_robustos_unique_slot
on public.agendamentos_robustos (loja_id, "DATA", "HORA", (coalesce("PROFISSIONAL", '')));

-- Helpful indexes
create index if not exists agendamentos_robustos_loja_data_idx
on public.agendamentos_robustos (loja_id, "DATA");
