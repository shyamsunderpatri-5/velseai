-- Create table for tracking AI headshot generations
create table if not exists public.headshot_generations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    resume_id uuid references public.resumes(id) on delete set null,
    prediction_id text unique not null,
    status text not null,
    style_name text not null,
    source_url text not null,
    result_url text,
    error text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.headshot_generations enable row level security;

-- Create policies
create policy "Users can view their own generations"
    on public.headshot_generations for select
    using (auth.uid() = user_id);

create policy "Users can insert their own generations"
    on public.headshot_generations for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own generations"
    on public.headshot_generations for update
    using (auth.uid() = user_id);

-- Create storage bucket for headshots
-- Note: Buckets often need to be created via the Supabase Dashboard, 
-- but we define the policy here for completeness.
insert into storage.buckets (id, name, public)
values ('headshots', 'headshots', true)
on conflict (id) do nothing;

create policy "Headshot public access"
    on storage.objects for select
    using (bucket_id = 'headshots');

create policy "User headshot upload"
    on storage.objects for insert
    with check (bucket_id = 'headshots' and auth.uid() = (storage.foldername(name))[1]::uuid);
