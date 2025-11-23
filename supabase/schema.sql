-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- This triggers a profile creation when a user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a table for memories (feed items)
create table memories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  text text not null,
  category text not null, -- 'Learn', 'Burn', 'Earn', 'Fun' etc.
  location text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for memories
alter table memories enable row level security;

create policy "Memories are viewable by everyone."
  on memories for select
  using ( true );

create policy "Authenticated users can create memories."
  on memories for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own memories."
  on memories for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own memories."
  on memories for delete
  using ( auth.uid() = user_id );

-- Create a table for likes
create table likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  memory_id uuid references memories(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, memory_id)
);

-- Set up RLS for likes
alter table likes enable row level security;

create policy "Likes are viewable by everyone."
  on likes for select
  using ( true );

create policy "Authenticated users can insert likes."
  on likes for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own likes."
  on likes for delete
  using ( auth.uid() = user_id );

-- Set up Storage for memory images
insert into storage.buckets (id, name)
values ('memories', 'memories');

create policy "Memory images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'memories' );

create policy "Authenticated users can upload memory images."
  on storage.objects for insert
  with check ( bucket_id = 'memories' and auth.role() = 'authenticated' );
