-- Add new columns
alter table profiles
add column if not exists display_name text,
add column if not exists email text;

-- Migrate data
-- We use the existing username if present, otherwise fallback to email prefix
update profiles
set
  email = auth.users.email,
  display_name = coalesce(profiles.username, split_part(auth.users.email, '@', 1))
from auth.users
where profiles.id = auth.users.id;

-- Drop old columns
alter table profiles
drop column if exists username,
drop column if exists full_name,
drop column if exists website;

-- Update trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, avatar_url, email, display_name)
  values (
    new.id,
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$ language plpgsql security definer;
