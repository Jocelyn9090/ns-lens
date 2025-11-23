-- Add new columns for multiple media support
ALTER TABLE memories 
ADD COLUMN IF NOT EXISTS media_urls text[],
ADD COLUMN IF NOT EXISTS media_types text[];

-- Migrate existing data
UPDATE memories 
SET 
  media_urls = ARRAY[image_url],
  media_types = ARRAY['image']
WHERE image_url IS NOT NULL AND media_urls IS NULL;

-- Make sure storage bucket allows video types
-- (This part is usually done via Supabase UI, but good to note)
-- We'll assume the bucket 'memories' exists and policies are set.
