-- CRUD подобрения за user_knowledge_state: updated_at, индекси, trigger.
-- Схемата остава с user_id text + FK към user_learning_profiles (виж 005).

alter table public.user_knowledge_state
    add column if not exists updated_at timestamptz not null default timezone('utc'::text, now());

update public.user_knowledge_state
set updated_at = coalesce(last_assessed, created_at, timezone('utc'::text, now()))
where updated_at is null;

create or replace function public.set_updated_at_user_knowledge_state()
returns trigger
language plpgsql
as $$
begin
    new.updated_at := timezone('utc'::text, now());
    return new;
end;
$$;

drop trigger if exists user_knowledge_state_set_updated_at on public.user_knowledge_state;

create trigger user_knowledge_state_set_updated_at
    before update on public.user_knowledge_state
    for each row
    execute procedure public.set_updated_at_user_knowledge_state();

create index if not exists idx_user_knowledge_user
    on public.user_knowledge_state (user_id);

create index if not exists idx_user_knowledge_topic
    on public.user_knowledge_state (topic);

create index if not exists idx_user_knowledge_mastery
    on public.user_knowledge_state (mastery_level);

comment on column public.user_knowledge_state.updated_at is 'Автоматично обновяване при UPDATE';
