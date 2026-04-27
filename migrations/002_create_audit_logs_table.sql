-- Migration: Create audit_logs table for GDPR compliance
-- Status: GDPR Article 32 - Security of processing
-- Created: 2026-04-21

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR NOT NULL,
  -- Actions: 'LOGIN', 'LOGOUT', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED',
  --         'CONSENT_GRANTED', 'CONSENT_WITHDRAWN', 'DATA_EXPORTED', 'PASSWORD_CHANGED'
  resource_type VARCHAR,
  -- Types: 'user', 'consent', 'message', 'file', 'session'
  resource_id UUID,
  status VARCHAR NOT NULL DEFAULT 'success',
  -- Status: 'success', 'failure', 'pending'
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for fast lookups and GDPR compliance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON public.audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_status ON public.audit_logs(status);

-- Add comment for documentation
COMMENT ON TABLE public.audit_logs IS 'GDPR Article 32 - Comprehensive audit logging for all sensitive operations. Tracks who accessed what data, when, and why. Required for breach notification and user rights requests.';

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own audit logs
CREATE POLICY "Users see own audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Service role can insert audit logs
CREATE POLICY "Service role manages audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Admins can see all audit logs (for compliance monitoring)
CREATE POLICY "Admins see all audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'Admin'
    )
  );

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID DEFAULT NULL,
  p_action VARCHAR,
  p_resource_type VARCHAR DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_status VARCHAR DEFAULT 'success',
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    status,
    details,
    ip_address,
    user_agent
  )
  VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_status, p_details, p_ip_address, p_user_agent)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user audit trail (for GDPR Article 15 - Right to Access)
CREATE OR REPLACE FUNCTION get_user_audit_trail(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  action VARCHAR,
  resource_type VARCHAR,
  resource_id UUID,
  status VARCHAR,
  details JSONB,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.action,
    al.resource_type,
    al.resource_id,
    al.status,
    al.details,
    al.created_at
  FROM public.audit_logs al
  WHERE al.user_id = p_user_id
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create function to purge old audit logs (GDPR Article 5(1)(e) - Retention)
CREATE OR REPLACE FUNCTION purge_old_audit_logs(
  p_retention_days INTEGER DEFAULT 2555  -- 7 years for GDPR compliance
)
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < (now() - INTERVAL '1 day' * p_retention_days);

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;
