-- Create storage bucket for chat media (images, videos, audio, files)

-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS is already enabled on storage.objects by Supabase

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload to own folder in chat-media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view all chat media (since it's public)
CREATE POLICY "Anyone can view chat media"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-media');

-- Policy: Users can delete their own media
CREATE POLICY "Users can delete own media in chat-media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
