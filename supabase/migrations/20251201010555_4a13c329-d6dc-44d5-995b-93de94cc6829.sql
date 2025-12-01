-- Create enum types
create type public.forklift_status as enum ('disponivel', 'alugada', 'manutencao');
create type public.rental_status as enum ('ativo', 'finalizado', 'atrasado');
create type public.maintenance_status as enum ('agendada', 'em_andamento', 'concluida');
create type public.maintenance_tipo as enum ('preventiva', 'corretiva');

-- Create forklifts table
create table public.forklifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  placa text not null,
  marca text not null,
  modelo text not null,
  capacidade text not null,
  ano_fabricacao integer not null,
  horas_uso integer not null default 0,
  status forklift_status not null default 'disponivel',
  ultima_manutencao timestamp with time zone,
  proxima_manutencao timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create clients table
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  nome text not null,
  cnpj text not null,
  contato text not null,
  telefone text not null,
  email text not null,
  endereco text not null,
  alugueis_ativos integer not null default 0,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create rentals table
create table public.rentals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  forklift_id uuid references public.forklifts(id) on delete cascade not null,
  cliente text not null,
  data_inicio date not null,
  data_fim date not null,
  valor_diaria decimal(10,2) not null,
  status rental_status not null default 'ativo',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create maintenances table
create table public.maintenances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  forklift_id uuid references public.forklifts(id) on delete cascade not null,
  tipo maintenance_tipo not null,
  descricao text not null,
  data_agendada date not null,
  data_conclusao date,
  status maintenance_status not null default 'agendada',
  custo decimal(10,2),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable Row Level Security
alter table public.forklifts enable row level security;
alter table public.clients enable row level security;
alter table public.rentals enable row level security;
alter table public.maintenances enable row level security;

-- Create RLS policies for forklifts
create policy "Users can view their own forklifts"
  on public.forklifts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own forklifts"
  on public.forklifts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own forklifts"
  on public.forklifts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own forklifts"
  on public.forklifts for delete
  using (auth.uid() = user_id);

-- Create RLS policies for clients
create policy "Users can view their own clients"
  on public.clients for select
  using (auth.uid() = user_id);

create policy "Users can insert their own clients"
  on public.clients for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own clients"
  on public.clients for update
  using (auth.uid() = user_id);

create policy "Users can delete their own clients"
  on public.clients for delete
  using (auth.uid() = user_id);

-- Create RLS policies for rentals
create policy "Users can view their own rentals"
  on public.rentals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own rentals"
  on public.rentals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own rentals"
  on public.rentals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own rentals"
  on public.rentals for delete
  using (auth.uid() = user_id);

-- Create RLS policies for maintenances
create policy "Users can view their own maintenances"
  on public.maintenances for select
  using (auth.uid() = user_id);

create policy "Users can insert their own maintenances"
  on public.maintenances for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own maintenances"
  on public.maintenances for update
  using (auth.uid() = user_id);

create policy "Users can delete their own maintenances"
  on public.maintenances for delete
  using (auth.uid() = user_id);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Create triggers for updated_at
create trigger handle_forklifts_updated_at
  before update on public.forklifts
  for each row execute function public.handle_updated_at();

create trigger handle_clients_updated_at
  before update on public.clients
  for each row execute function public.handle_updated_at();

create trigger handle_rentals_updated_at
  before update on public.rentals
  for each row execute function public.handle_updated_at();

create trigger handle_maintenances_updated_at
  before update on public.maintenances
  for each row execute function public.handle_updated_at();