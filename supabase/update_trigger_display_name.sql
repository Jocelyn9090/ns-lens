-- Update trigger to use display_name from metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, avatar_url, email, display_name)
  values (
    new.id,
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;
