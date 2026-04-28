-- Migration: 012 Add User Presence Status
-- Adds presence_status column to users table for tracking online/offline/busy status
-- Date: 2026-04-28

-- ============================================================================
-- PART 1: Add presence_status column if it doesn't exist
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'presence_status'
  ) THEN
    ALTER TABLE public.users ADD COLUMN presence_status TEXT NOT NULL DEFAULT 'Available';
  END IF;
END $$;

-- ============================================================================
-- PART 2: Add check constraint for presence_status
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public' AND table_name = 'users' AND constraint_name = 'users_presence_status_check'
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_presence_status_check;
  END IF;
  
  ALTER TABLE public.users ADD CONSTRAINT users_presence_status_check CHECK (presence_status IN ('Available', 'Idle', 'Busy', 'Away', 'Offline'));
END $$;

-- ============================================================================
-- PART 3: Create index for presence queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_presence_status ON public.users(presence_status);

-- ============================================================================
-- PART 4: Create function to update presence status
-- ============================================================================

DROP FUNCTION IF EXISTS public.update_user_presence(p_user_id UUID, p_status TEXT);

CREATE OR REPLACE FUNCTION public.update_user_presence(p_user_id UUID, p_status TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_status NOT IN ('Available', 'Idle', 'Busy', 'Away', 'Offline') THEN
    RAISE EXCEPTION 'Invalid presence status. Valid values: Available, Idle, Busy, Away, Offline';
  END IF;

  UPDATE public.users SET presence_status = p_status WHERE id = p_user_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;