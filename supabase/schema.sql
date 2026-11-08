-- DermaScan stores submitted reports and completed visual analyses only.
-- Draft text stays in the browser. Photos are stored in a private bucket.

create table if not exists public.photo_analyses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  animal text not null check (animal in ('Dog', 'Cat', 'Bird', 'Other / unsure')),
  image_kind text not null check (image_kind in ('animal_skin', 'other_animal', 'not_animal', 'unclear')),
  image_quality text not null check (image_quality in ('clear', 'limited', 'not_assessable')),
  visible_observations jsonb not null default '[]'::jsonb check (jsonb_typeof(visible_observations) = 'array'),
  summary text not null check (char_length(summary) <= 2000),
  model text not null check (char_length(model) <= 120),
  photo_path text not null unique
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  report_code text not null unique check (char_length(report_code) <= 64),
  created_at timestamptz not null default now(),
  animal text not null check (animal in ('Dog', 'Cat', 'Bird', 'Other / unsure')),
  location text not null check (char_length(location) between 1 and 500),
  landmark text not null default '' check (char_length(landmark) <= 300),
  observations text not null default '' check (char_length(observations) <= 1200),
  photo_name text check (photo_name is null or char_length(photo_name) <= 255),
  photo_path text,
  analysis_id uuid references public.photo_analyses(id) on delete set null,
  status text not null default 'prepared' check (status = 'prepared')
);

create index if not exists photo_analyses_created_at_idx on public.photo_analyses (created_at desc);
create index if not exists reports_created_at_idx on public.reports (created_at desc);

alter table public.photo_analyses enable row level security;
alter table public.reports enable row level security;
revoke all on public.photo_analyses, public.reports from anon, authenticated;
grant select, insert, update, delete on public.photo_analyses, public.reports to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dermascan-private', 'dermascan-private', false, 2097152, array['image/jpeg'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
