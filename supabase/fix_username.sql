-- Update existing profiles to have a username derived from their email
update profiles
set username = split_part(users.email, '@', 1)
from auth.users
where profiles.id = users.id and profiles.username is null;

-- Update the trigger function to automatically set username for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, username)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$ language plpgsql security definer;
