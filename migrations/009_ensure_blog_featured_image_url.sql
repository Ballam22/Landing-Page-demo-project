-- Migration: Ensure blog featured image column exists
-- Needed for existing databases created before featured images were added.

alter table public.blogs
add column if not exists featured_image_url text;
