-- Supabase / Postgres: LangChain SupabaseVectorStore + match_documents
-- Extensions (Dashboard → Database → Extensions): enable pgvector, pg_trgm (hstore optional).
-- Embedding dim: 1024 = intfloat/multilingual-e5-large. За OpenAI text-embedding-3-small ползвай 1536 и същата стойност в match_documents.

-- Таблица (LangChain очаква колони id, content, metadata, embedding)
create table if not exists public.documents (
    id uuid primary key default gen_random_uuid(),
    content text not null,
    metadata jsonb default '{}'::jsonb,
    embedding vector(1024),
    created_at timestamptz default timezone('utc'::text, now())
);

-- HNSW за cosine (препоръчително за production scale)
create index if not exists documents_embedding_hnsw_idx
    on public.documents
    using hnsw (embedding vector_cosine_ops);

-- GIN за metadata (jsonb_ops — поддържа @> в match_documents; jsonb_path_ops не поддържа @>)
create index if not exists documents_metadata_gin_idx
    on public.documents
    using gin (metadata);

-- Keyword / substring помощ (изисква pg_trgm)
create index if not exists documents_content_trgm_idx
    on public.documents
    using gin (content gin_trgm_ops);

-- LangChain подава към RPC именовани параметри: query_embedding + filter; limit задава клиентът (PostgREST).
create or replace function public.match_documents(
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
    from public.documents d
    where d.embedding is not null
      and (
          filter = '{}'::jsonb
          or filter is null
          or d.metadata @> filter
      )
    order by d.embedding <=> query_embedding;
$$;

comment on table public.documents is 'Academy RAG chunks for LangChain SupabaseVectorStore (ai-agri-academy / RAG_VECTOR_BACKEND=supabase)';
comment on function public.match_documents is 'LangChain SupabaseVectorStore RPC; filter = metadata @> filter когато filter не е празен';

-- Backend LangChain ползва service_role. За Edge/клиентски RPC добави anon/authenticated осъзнато (RLS!).
grant execute on function public.match_documents(vector, jsonb) to service_role;
