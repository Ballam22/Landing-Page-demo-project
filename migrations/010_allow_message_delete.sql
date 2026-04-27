-- Allow inbox users to hide messages they sent or received without removing the other user's copy.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'messages'
  ) THEN
    ALTER TABLE public.messages
      ADD COLUMN IF NOT EXISTS deleted_by_sender_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS deleted_by_recipient_at TIMESTAMPTZ;

    CREATE INDEX IF NOT EXISTS idx_messages_sender_visible
      ON public.messages(sender_id, deleted_by_sender_at);

    CREATE INDEX IF NOT EXISTS idx_messages_recipient_visible
      ON public.messages(recipient_id, deleted_by_recipient_at);

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'messages'
        AND policyname = 'Users can hide their own messages'
    ) THEN
      CREATE POLICY "Users can hide their own messages"
        ON public.messages
        FOR UPDATE
        USING (auth.uid() = sender_id OR auth.uid() = recipient_id)
        WITH CHECK (auth.uid() = sender_id OR auth.uid() = recipient_id);
    END IF;
  END IF;
END $$;
