-- create_tables_supabase.sql
-- Script para criar tabelas `events` e `decisions` com RLS e policies
-- Cole e execute no Supabase SQL Editor

-- OPTIONAL: habilitar gen_random_uuid() se desejar UUIDs automáticos
-- create extension if not exists "pgcrypto";

-- =====================
-- Tabela: events
-- =====================
create table if not exists public.events (
  id text primary key,
  user_id uuid references auth.users(id),
  date date not null,
  text text,
  color text,
  created_at timestamptz default now()
);

alter table if exists public.events enable row level security;

-- Política: permitir apenas ao dono ler
create policy "users_manage_own_events_select" on public.events
  for select using (auth.uid() = user_id);

-- Política: permitir atualização apenas ao dono e checar user_id
create policy "users_manage_own_events_update" on public.events
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Política: permitir delete apenas ao dono
create policy "users_manage_own_events_delete" on public.events
  for delete using (auth.uid() = user_id);

-- Política de insert: exige que o user_id inserido seja igual ao auth.uid()
create policy "users_manage_own_events_insert" on public.events
  for insert with check (auth.uid() = user_id);

-- Índices úteis
create index if not exists events_user_id_idx on public.events (user_id);
create index if not exists events_date_idx on public.events (date);

-- =====================
-- Tabela: decisions
-- =====================
create table if not exists public.decisions (
  id text primary key,
  user_id uuid references auth.users(id),
  problem text not null,
  positive_points jsonb,
  negative_points jsonb,
  reflection text,
  overall_sentiment text,
  created_at timestamptz default now()
);

alter table if exists public.decisions enable row level security;

create policy "users_manage_own_decisions_select" on public.decisions
  for select using (auth.uid() = user_id);

create policy "users_manage_own_decisions_update" on public.decisions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users_manage_own_decisions_delete" on public.decisions
  for delete using (auth.uid() = user_id);

create policy "users_manage_own_decisions_insert" on public.decisions
  for insert with check (auth.uid() = user_id);

-- Índices
create index if not exists decisions_user_id_idx on public.decisions (user_id);
create index if not exists decisions_created_at_idx on public.decisions (created_at);

-- =====================
-- Observações e dicas
-- =====================
-- 1) Este script usa `id text` porque o app atualmente gera ids textuais.
--    Se preferir UUIDs automáticos, habilite a extensão pgcrypto e altere
--    a coluna `id` para `uuid primary key default gen_random_uuid()`.
--    Exemplo:
--      create extension if not exists "pgcrypto";
--      create table ... (
--        id uuid primary key default gen_random_uuid(),
--        ...
--      );
--
-- 2) RLS: As policies exigem que o cliente envie `user_id` igual ao `auth.uid()`.
--    O código em `src/services/supabaseService.ts` já adiciona `user_id: user.id`.
--
-- 3) Para aplicar: cole todo o conteúdo deste arquivo no Supabase SQL Editor
--    (Project -> SQL -> New query) e clique em "Run".
--
-- 4) Logs: se uma inserção for negada, verifique "Logs -> Database" no painel
--    Supabase para mensagens de RLS/permissão.
--
-- Fim do arquivo

-- =====================
-- Tabela: tasks
-- =====================
create table if not exists public.tasks (
  id text primary key,
  user_id uuid references auth.users(id),
  text text,
  completed boolean default false,
  created_at timestamptz default now(),
  completed_at timestamptz,
  due_date date
);

alter table if exists public.tasks enable row level security;

create policy "users_manage_own_tasks_select" on public.tasks
  for select using (auth.uid() = user_id);

create policy "users_manage_own_tasks_update" on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users_manage_own_tasks_delete" on public.tasks
  for delete using (auth.uid() = user_id);

create policy "users_manage_own_tasks_insert" on public.tasks
  for insert with check (auth.uid() = user_id);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_created_at_idx on public.tasks (created_at);


-- =====================
-- Tabela: diary_entries
-- =====================
create table if not exists public.diary_entries (
  id text primary key,
  user_id uuid references auth.users(id),
  text text,
  emotion text,
  created_at timestamptz default now()
);

alter table if exists public.diary_entries enable row level security;

create policy "users_manage_own_diary_select" on public.diary_entries
  for select using (auth.uid() = user_id);

create policy "users_manage_own_diary_update" on public.diary_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users_manage_own_diary_delete" on public.diary_entries
  for delete using (auth.uid() = user_id);

create policy "users_manage_own_diary_insert" on public.diary_entries
  for insert with check (auth.uid() = user_id);

create index if not exists diary_user_id_idx on public.diary_entries (user_id);
create index if not exists diary_created_at_idx on public.diary_entries (created_at);

-- =====================
-- Deletar em cascata  
-- =====================
   
-- DECISIONS
alter table public.decisions
  drop constraint decisions_user_id_fkey,
  add constraint decisions_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete cascade;

-- DIARY ENTRIES
alter table public.diary_entries
  drop constraint diary_entries_user_id_fkey,
  add constraint diary_entries_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete cascade;

-- EVENTS
alter table public.events
  drop constraint events_user_id_fkey,
  add constraint events_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete cascade;

-- TASKS
alter table public.tasks
  drop constraint tasks_user_id_fkey,
  add constraint tasks_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete cascade;