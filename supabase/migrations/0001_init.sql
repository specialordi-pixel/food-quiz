-- 오늘의 음식 실루엣 퀴즈 스키마 (Vercel Postgres)

create table if not exists puzzle_sets (
  id uuid primary key default gen_random_uuid(),
  play_date date not null unique,
  created_at timestamptz not null default now()
);

create table if not exists puzzle_items (
  id uuid primary key default gen_random_uuid(),
  puzzle_set_id uuid not null references puzzle_sets(id) on delete cascade,
  order_index smallint not null check (order_index between 1 and 3),
  image_url text not null,
  answer text not null,
  accepted_answers text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (puzzle_set_id, order_index)
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  puzzle_set_id uuid not null references puzzle_sets(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 20),
  total_time_ms integer not null check (total_time_ms > 0),
  created_at timestamptz not null default now()
);

create index if not exists scores_puzzle_set_time_idx
  on scores (puzzle_set_id, total_time_ms asc);
