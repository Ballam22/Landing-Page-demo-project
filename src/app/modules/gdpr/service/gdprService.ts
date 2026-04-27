import {supabase} from '../../../lib/supabaseClient'

export interface DeletionRequest {
  userId: string
  reason?: string
  confirmed: boolean
}

/**
 * GDPR Article 17 - Right to Erasure (Right to be Forgotten)
 * Securely deletes a user account and all associated personal data
 */
export async function deleteUserAccount(
  userId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Log the deletion request (before purging for audit trail)
    await logAuditEvent(userId, 'USER_DELETION_REQUESTED', 'user', userId, 'pending', {
      reason: reason || 'User initiated deletion',
      timestamp: new Date().toISOString(),
    })

    // 2. Get user details for audit logging
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      throw new Error('User not found')
    }

    // 3. Delete all related data in correct order (to avoid foreign key violations)

    // Delete messages (both sent and received)
    await Promise.all([
      supabase.from('messages').delete().eq('sender_id', userId),
      supabase.from('messages').delete().eq('recipient_id', userId),
    ])

    // Delete user consents
    await supabase.from('user_consents').delete().eq('user_id', userId)

    // Delete user avatar from storage (if exists)
    if (user.avatar_url) {
      // Extract filename from URL
      const avatarPath = user.avatar_url.split('/').pop()
      if (avatarPath) {
        await supabase.storage.from('avatars').remove([avatarPath])
      }
    }

    // Delete the user record (this will cascade to audit logs due to ON DELETE SET NULL)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteError) {
      throw deleteError
    }

    // 4. Log successful deletion
    await logAuditEvent(null, 'USER_DELETION_COMPLETED', 'user', userId, 'success', {
      deletedUser: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        deletedAt: new Date().toISOString(),
      },
      reason: reason || 'User initiated deletion',
    })

    return {
      success: true,
      message: 'Account successfully deleted. All personal data has been permanently removed.',
    }

  } catch (error) {
    // Log the failure
    await logAuditEvent(userId, 'USER_DELETION_FAILED', 'user', userId, 'failure', {
      error: error instanceof Error ? error.message : 'Unknown error',
      reason: reason || 'User initiated deletion',
    })

    console.error('Account deletion failed:', error)
    return {
      success: false,
      message: 'Account deletion failed. Please contact support.',
    }
  }
}

/**
 * GDPR Article 15 - Right to Access
 * Export all user data in machine-readable format
 */
export async function exportUserData(userId: string): Promise<string> {
  try {
    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      throw new Error('User not found')
    }

    // Get user consents
    const { data: consents } = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Get user messages
    const { data: sentMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('sender_id', userId)
      .order('created_at', { ascending: false })

    const { data: receivedMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })

    // Get audit logs
    const { data: auditLogs } = await supabase.rpc('get_user_audit_trail', {
      p_user_id: userId,
      p_limit: 1000,
    })

    // Compile export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportReason: 'GDPR Article 15 - Right to Access',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatar_url,
        linkedinUsername: user.linkedin_username,
        linkedinUrl: user.linkedin_url,
        instagramUsername: user.instagram_username,
        instagramUrl: user.instagram_url,
        xUsername: user.x_username,
        xUrl: user.x_url,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      consents: consents || [],
      messages: {
        sent: sentMessages || [],
        received: receivedMessages || [],
      },
      auditLogs: auditLogs || [],
    }

    // Log the export
    await logAuditEvent(userId, 'DATA_EXPORTED', 'user', userId, 'success', {
      exportFormat: 'JSON',
      recordCount: {
        consents: (consents || []).length,
        sentMessages: (sentMessages || []).length,
        receivedMessages: (receivedMessages || []).length,
        auditLogs: (auditLogs || []).length,
      },
    })

    return JSON.stringify(exportData, null, 2)

  } catch (error) {
    await logAuditEvent(userId, 'DATA_EXPORT_FAILED', 'user', userId, 'failure', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    throw error
  }
}

/**
 * GDPR Article 16 - Right to Rectification
 * Update user personal data
 */
export async function updateUserData(
  userId: string,
  updates: Partial<{
    fullName: string
    email: string
    avatarUrl: string
    linkedinUsername: string
    linkedinUrl: string
    instagramUsername: string
    instagramUrl: string
    xUsername: string
    xUrl: string
  }>
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) throw error

    // Log the update
    await logAuditEvent(userId, 'USER_DATA_UPDATED', 'user', userId, 'success', {
      updatedFields: Object.keys(updates),
    })

    return {
      success: true,
      message: 'Personal data updated successfully.',
    }

  } catch (error) {
    await logAuditEvent(userId, 'USER_DATA_UPDATE_FAILED', 'user', userId, 'failure', {
      error: error instanceof Error ? error.message : 'Unknown error',
      attemptedUpdates: Object.keys(updates),
    })

    return {
      success: false,
      message: 'Failed to update personal data.',
    }
  }
}

/**
 * GDPR Article 7(3) - Right to Withdraw Consent
 * Withdraw consent for specific data processing
 */
export async function withdrawUserConsent(
  userId: string,
  consentType: string = 'data_processing'
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.rpc('withdraw_consent', {
      p_user_id: userId,
      p_consent_type: consentType,
    })

    if (error) throw error

    // Log the withdrawal
    await logAuditEvent(userId, 'CONSENT_WITHDRAWN', 'consent', null, 'success', {
      consentType,
    })

    return {
      success: true,
      message: `Consent withdrawn for ${consentType}.`,
    }

  } catch (error) {
    await logAuditEvent(userId, 'CONSENT_WITHDRAWAL_FAILED', 'consent', null, 'failure', {
      consentType,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return {
      success: false,
      message: 'Failed to withdraw consent.',
    }
  }
}

// Helper function to log audit events
async function logAuditEvent(
  userId: string | null,
  action: string,
  resourceType: string | null,
  resourceId: string | null,
  status: string,
  details: any = null
): Promise<void> {
  try {
    const ipAddress = await getClientIP()
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''

    await supabase.rpc('log_audit_event', {
      p_user_id: userId,
      p_action: action,
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_status: status,
      p_details: details,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
    })
  } catch (error) {
    console.error('Failed to log audit event:', error)
  }
}

// Helper function to get client IP (best-effort)
async function getClientIP(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json').catch(() => null)
    if (response?.ok) {
      const { ip } = await response.json()
      return ip
    }
  } catch {
    // Silently fail - IP is not critical
  }
  return null
}
