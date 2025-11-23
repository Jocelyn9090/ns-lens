-- Update the memories bucket to be public
update storage.buckets
set public = true
where id = 'memories';

-- Ensure the policy allows public access (just in case)
drop policy if exists "Memory images are publicly accessible." on storage.objects;
create policy "Memory images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'memories' );
