-- Adaptive learning: профил и състояние по теми (Academy Tutor).
-- user_id е text за съвместимост с demo идентификатори; при нужда добави FK към auth.users(id).

create table if not exists public.user_learning_profiles (
    user_id text primary key,
    overall_level int not null default 1 check (overall_level between 1 and 5),
    cultures jsonb not null default '[]'::jsonb,
    region text,
    last_activity timestamptz,
    created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.user_knowledge_state (
    id uuid primary key default gen_random_uuid(),
    user_id text not null references public.user_learning_profiles (user_id) on delete cascade,
    topic text not null,
    mastery_level double precision not null default 0.0 check (mastery_level >= 0.0 and mastery_level <= 1.0),
    last_assessed timestamptz,
    attempts int not null default 0,
    correct_answers int not null default 0,
    created_at timestamptz not null default timezone('utc'::text, now()),
    unique (user_id, topic)
);

create index if not exists user_knowledge_state_user_topic_idx
    on public.user_knowledge_state (user_id, topic);

comment on table public.user_learning_profiles is 'Academy adaptive learning: общ профил на ученика';
comment on table public.user_knowledge_state is 'Mastery по тема за адаптивна трудност и препоръки';

alter table public.user_learning_profiles enable row level security;
alter table public.user_knowledge_state enable row level security;

-- Backend с service_role bypass-ва RLS. Клиент с JWT: само собствен ред (user_id = sub на токена).
create policy "user_learning_profiles_own"
    on public.user_learning_profiles
    for all
    to authenticated
    using (user_id = (select auth.uid()::text))
    with check (user_id = (select auth.uid()::text));

create policy "user_knowledge_state_own"
    on public.user_knowledge_state
    for all
    to authenticated
    using (user_id = (select auth.uid()::text))
    with check (user_id = (select auth.uid()::text));
