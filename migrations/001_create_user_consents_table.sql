-- Migration: Create user_consents table for GDPR consent tracking
-- Status: GDPR Article 4(11) - Proof of explicit consent
-- Created: 2026-04-21

-- Create user_consents table
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  consent_type VARCHAR NOT NULL DEFAULT 'data_processing',
  -- Types: 'data_processing', 'analytics', 'marketing'
  granted BOOLEAN NOT NULL,
  given_at TIMESTAMP NOT NULL DEFAULT now(),
  withdrawn_at TIMESTAMP,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for fast lookups
CREATE INDEX idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX idx_user_consents_consent_type ON public.user_consents(consent_type);
CREATE INDEX idx_user_consents_created_at ON public.user_consents(created_at DESC);
CREATE INDEX idx_user_consents_granted ON public.user_consents(granted);

-- Add comment for documentation
COMMENT ON TABLE public.user_consents IS 'GDPR Article 4(11) - Records user consent to data processing. Tracks consent grants/withdrawals with timestamps and IP for audit purposes.';

-- Enable RLS
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own consents
CREATE POLICY "Users see own consents"
  ON public.user_consents
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Service role (backend) can insert consent records
CREATE POLICY "Service role manages consents"
  ON public.user_consents
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Users can withdraw consent
CREATE POLICY "Users withdraw own consent"
  ON public.user_consents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to check if user has given consent
CREATE OR REPLACE FUNCTION has_user_consented(
  p_user_id UUID,
  p_consent_type VARCHAR DEFAULT 'data_processing'
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_consents
    WHERE user_id = p_user_id
      AND consent_type = p_consent_type
      AND granted = true
      AND withdrawn_at IS NULL
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to record consent
CREATE OR REPLACE FUNCTION record_consent(
  p_user_id UUID,
  p_consent_type VARCHAR,
  p_granted BOOLEAN,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_consent_id UUID;
BEGIN
  INSERT INTO public.user_consents (
    user_id,
    consent_type,
    granted,
    ip_address,
    user_agent
  )
  VALUES (p_user_id, p_consent_type, p_granted, p_ip_address, p_user_agent)
  RETURNING id INTO v_consent_id;

  RETURN v_consent_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to withdraw consent
CREATE OR REPLACE FUNCTION withdraw_consent(
  p_user_id UUID,
  p_consent_type VARCHAR DEFAULT 'data_processing'
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_consents
  SET withdrawn_at = now()
  WHERE user_id = p_user_id
    AND consent_type = p_consent_type
    AND withdrawn_at IS NULL;
END;
$$ LANGUAGE plpgsql;
