-- Overrides del editor en línea (sustituyen mock en cliente para todos los visitantes)
create table if not exists public.cms_inline_overrides (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create index if not exists cms_inline_overrides_updated_at_idx
  on public.cms_inline_overrides (updated_at desc);

alter table public.cms_inline_overrides enable row level security;

create policy "cms_inline_overrides_read"
  on public.cms_inline_overrides for select
  using (true);

create policy "cms_inline_overrides_editor"
  on public.cms_inline_overrides for all
  using (public.is_editor())
  with check (public.is_editor());
