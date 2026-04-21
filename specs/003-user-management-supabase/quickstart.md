# Quickstart: User Management — Supabase Migration

## Prerequisites

- Supabase project running with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set in `.env`
- Dev server: `npm run dev`

---

## Step 1: Create the database table

Run this SQL in the Supabase SQL editor (Dashboard → SQL Editor → New query):

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   text         NOT NULL,
  email       text         UNIQUE NOT NULL,
  role        text         NOT NULL DEFAULT 'User'
                CHECK (role IN ('Admin', 'Manager', 'User')),
  status      text         NOT NULL DEFAULT 'Active'
                CHECK (status IN ('Active', 'Inactive')),
  avatar_url  text,
  linkedin_username text,
  linkedin_url      text,
  instagram_username text,
  instagram_url      text,
  x_username         text,
  x_url              text,
  created_at  timestamptz  NOT NULL DEFAULT now()
);
```

If the table already exists, run this migration instead:

```sql
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS linkedin_username text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS instagram_username text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS x_username text,
  ADD COLUMN IF NOT EXISTS x_url text;
```

## Step 2: Create the avatars Storage bucket

In Supabase Dashboard → Storage → New bucket:
- Name: `avatars`
- Public: ✅ enabled

## Step 2b: Create the direct messages table

Run this SQL in the Supabase SQL editor to enable the in-app message drawer:

```sql
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(trim(body)) > 0),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages (recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages (created_at DESC);
```

## Step 3: Seed at least one Admin user

```sql
INSERT INTO public.users (full_name, email, role, status)
VALUES ('Admin User', 'admin@example.com', 'Admin', 'Active');
```

> The `id` of this row must match your Supabase auth user's UID if the role guard is
> active. Update the id after creating your auth user:
>
> ```sql
> UPDATE public.users SET id = '<your-auth-uid>' WHERE email = 'admin@example.com';
> ```

## Step 4: Verify the module loads

1. Log in to the app
2. Navigate to `/user-management`
3. The table should display the seeded user

## Step 5: Add a user with an avatar

1. Click **Add User**
2. Fill in Full Name, Email, select a Role and Status
3. Upload a JPG/PNG/WebP image under 5 MB
4. Click **Save**
5. The new row appears with the avatar thumbnail

## Step 6: Edit and delete

- Click the pencil icon → modal opens pre-filled → change a field → Save → row updates
- Click the trash icon → confirmation dialog → Confirm → row removed

---

## Validation checklist

- [ ] Table loads data from Supabase (not mock array)
- [ ] Add user persists to `public.users`
- [ ] Edit user updates the existing row
- [ ] Delete user removes the row permanently
- [ ] Avatar uploads appear in `avatars` bucket and display in the table
- [ ] Non-Admin/Manager users are redirected from `/user-management`
- [ ] Delete button is disabled for the logged-in user's own row
- [ ] Form validation prevents empty required fields
- [ ] Duplicate email is rejected with an error message
- [ ] Oversized/wrong-format image is rejected before upload
