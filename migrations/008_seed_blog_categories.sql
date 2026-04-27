-- Migration: Seed default blog categories
-- Keeps existing blog references safe by deactivating old categories instead of deleting them.

update public.categories
set is_active = false
where slug not in ('digital-currencies', 'tech', 'science');

insert into public.categories (name, slug, description, sort_order, is_active)
values
  (
    'Digital Currencies',
    'digital-currencies',
    'Posts about cryptocurrency, blockchain, digital assets, and market trends.',
    10,
    true
  ),
  (
    'Tech',
    'tech',
    'Posts about software, hardware, startups, AI, and technology news.',
    20,
    true
  ),
  (
    'Science',
    'science',
    'Posts about research, discoveries, space, health science, and innovation.',
    30,
    true
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;
