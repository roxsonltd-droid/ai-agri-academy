-- Опционална таблица ``academy_documents`` + RPC ``match_academy_documents``
-- (същата семантика като ``public.documents`` / ``match_documents``).
-- Ползвай с VECTOR_STORE_TABLE=academy_documents и VECTOR_STORE_MATCH_FN=match_academy_documents (или auto в config).
-- Extensions: pgvector, pg_trgm. Embedding dim 1024 = multilingual-e5-large.

create table if not exists public.academy_documents (
    id uuid primary key default gen_random_uuid(),
    content text not null,
    metadata jsonb not null default '{}'::jsonb,
    embedding vector(1024),
    created_at timestamptz default timezone('utc'::text, now())
);

create index if not exists academy_documents_embedding_hnsw_idx
    on public.academy_documents
    using hnsw (embedding vector_cosine_ops);

create index if not exists academy_documents_metadata_gin_idx
    on public.academy_documents
    using gin (metadata);

create index if not exists academy_documents_content_trgm_idx
    on public.academy_documents
    using gin (content gin_trgm_ops);

create or replace function public.match_academy_documents(
    query_embedding vector(1024),
    filter jsonb default '{}'::jsonb
)
returns table (
    id uuid,
    content text,
    metadata jsonb,
    similarity float
)
language sql
stable
parallel safe
as $$
    select
        d.id,
        d.content,
        d.metadata,
        (1 - (d.embedding <=> query_embedding))::float as similarity
    from public.academy_documents d
    where d.embedding is not null
      and (
          filter = '{}'::jsonb
          or filter is null
          or d.metadata @> filter
      )
    order by d.embedding <=> query_embedding;
$$;

comment on table public.academy_documents is 'Academy RAG с богат metadata; LangChain SupabaseVectorStore + match_academy_documents';
comment on function public.match_academy_documents is 'LangChain RPC; filter = metadata @> filter (json containment)';

grant execute on function public.match_academy_documents(vector, jsonb) to service_role;
