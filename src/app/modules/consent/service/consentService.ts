import {supabase} from '../../../lib/supabaseClient'

export type ConsentType = 'data_processing' | 'analytics' | 'marketing'

export interface UserConsent {
  id: string
  userId: string
  consentType: ConsentType
  granted: boolean
  givenAt: string
  withdrawnAt: string | null
  ipAddress?: string
  userAgent?: string
}

/**
 * Check if user has given consent for a specific type
 * GDPR Article 4(11) - Verify explicit consent before processing
 */
export async function hasUserConsented(
  userId: string,
  consentType: ConsentType = 'data_processing'
): Promise<boolean> {
  try {
    const {data, error} = await supabase.rpc('has_user_consented', {
      p_user_id: userId,
      p_consent_type: consentType,
    })

    if (error) {
      console.error('Error checking consent:', error)
      return false
    }

    return data === true
  } catch (err) {
    console.error('Consent check failed:', err)
    return false
  }
}

/**
 * Record user consent
 * GDPR Article 4(11) - Log explicit consent with timestamp and IP
 */
export async function recordConsent(
  userId: string,
  consentType: ConsentType = 'data_processing',
  granted: boolean = true
): Promise<string | null> {
  try {
    // Get client IP from user's browser (best-effort)
    const ipAddress = await getClientIP()
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''

    const {data, error} = await supabase.rpc('record_consent', {
      p_user_id: userId,
      p_consent_type: consentType,
      p_granted: granted,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
    })

    if (error) {
      console.error('Error recording consent:', error)
      return null
    }

    // Store locally to reduce API calls
    localStorage.setItem(`consent-${consentType}`, JSON.stringify({
      granted,
      timestamp: new Date().toISOString(),
    }))

    return data
  } catch (err) {
    console.error('Consent recording failed:', err)
    return null
  }
}

/**
 * Withdraw user consent
 * GDPR Article 4(11) - User can withdraw consent at any time
 */
export async function withdrawConsent(
  userId: string,
  consentType: ConsentType = 'data_processing'
): Promise<boolean> {
  try {
    const {error} = await supabase.rpc('withdraw_consent', {
      p_user_id: userId,
      p_consent_type: consentType,
    })

    if (error) {
      console.error('Error withdrawing consent:', error)
      return false
    }

    // Clear local storage
    localStorage.removeItem(`consent-${consentType}`)
    return true
  } catch (err) {
    console.error('Consent withdrawal failed:', err)
    return false
  }
}

/**
 * Get all consents for a user
 * Returns the full audit trail
 */
export async function getUserConsents(userId: string): Promise<UserConsent[]> {
  try {
    const {data, error} = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', {ascending: false})

    if (error) {
      console.error('Error fetching consents:', error)
      return []
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      consentType: row.consent_type,
      granted: row.granted,
      givenAt: row.given_at,
      withdrawnAt: row.withdrawn_at,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
    }))
  } catch (err) {
    console.error('Consent fetch failed:', err)
    return []
  }
}

/**
 * Get client IP address (best-effort from cloudflare headers or fallback)
 * Used for audit trail - not for tracking, only for logging where consent was given
 */
async function getClientIP(): Promise<string | null> {
  try {
    // Try to get IP from environment or request headers
    // For browser-based apps, this is best-effort only
    const response = await fetch('https://api.ipify.org?format=json').catch(() => null)
    if (response?.ok) {
      const {ip} = await response.json()
      return ip
    }
  } catch {
    // Silently fail - IP is not critical
  }
  return null
}

/**
 * Check if user has given consent (from cache or API)
 * Uses localStorage cache to minimize API calls
 */
export function hasConsentLocally(consentType: ConsentType = 'data_processing'): boolean {
  try {
    const cached = localStorage.getItem(`consent-${consentType}`)
    if (!cached) return false

    const {granted} = JSON.parse(cached)
    return granted === true
  } catch {
    return false
  }
}

/**
 * Mark consent as seen (don't show banner again)
 * Local-only flag - doesn't create database record
 */
export function markConsentBannerAsSeen(consentType: ConsentType = 'data_processing'): void {
  localStorage.setItem(`consent-banner-dismissed-${consentType}`, 'true')
}

/**
 * Check if consent banner was already dismissed
 */
export function isConsentBannerDismissed(consentType: ConsentType = 'data_processing'): boolean {
  return localStorage.getItem(`consent-banner-dismissed-${consentType}`) === 'true'
}
