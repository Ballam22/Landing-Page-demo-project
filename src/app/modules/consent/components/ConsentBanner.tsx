import {FC, useEffect, useState} from 'react'
import {useIntl} from 'react-intl'
import {useAuth} from '../../auth'
import {
  recordConsent,
  markConsentBannerAsSeen,
  isConsentBannerDismissed,
  ConsentType,
} from '../service/consentService'
import './ConsentBanner.scss'

interface ConsentBannerProps {
  consentType?: ConsentType
  onConsented?: () => void
}

/**
 * GDPR Article 4(11) - Consent Banner
 * Displays consent banner to users before processing personal data
 * Records explicit consent with timestamp and IP address
 */
export const ConsentBanner: FC<ConsentBannerProps> = ({
  consentType = 'data_processing',
  onConsented,
}) => {
  const intl = useIntl()
  const {currentUser} = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Only show if:
    // 1. User is authenticated
    // 2. Banner hasn't been dismissed
    // 3. Not in production (or user hasn't consented yet)
    if (currentUser && !isConsentBannerDismissed(consentType)) {
      setIsVisible(true)
    }
  }, [currentUser, consentType])

  const handleAgree = async () => {
    if (!currentUser) return

    setIsLoading(true)
    try {
      // Record consent in Supabase (GDPR Article 4(11))
      await recordConsent(currentUser.id, consentType, true)

      // Mark banner as seen
      markConsentBannerAsSeen(consentType)

      // Close banner
      setIsVisible(false)

      // Trigger callback
      onConsented?.()
    } catch (error) {
      console.error('Failed to record consent:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    // Dismissing is NOT the same as consenting
    // User can dismiss without consenting (though not recommended)
    markConsentBannerAsSeen(consentType)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className='consent-banner' role='dialog' aria-label='Consent banner'>
      <div className='consent-banner-content'>
        <div className='consent-banner-icon'>
          <i className='ki-duotone ki-security-check fs-3'>
            <span className='path1'></span>
            <span className='path2'></span>
          </i>
        </div>

        <div className='consent-banner-text'>
          <h5 className='mb-2'>
            {intl.formatMessage({id: 'CONSENT.TITLE'})}
          </h5>

          <p className='text-gray-600 fs-7 mb-0'>
            {intl.formatMessage({id: 'CONSENT.DESCRIPTION'})}
          </p>

          <div className='consent-banner-links mt-2'>
            <a
              href='/privacy'
              className='text-primary text-decoration-none fs-8'
              target='_blank'
              rel='noopener noreferrer'
            >
              {intl.formatMessage({id: 'CONSENT.PRIVACY_POLICY'})}
            </a>
            <span className='mx-2'>•</span>
            <a
              href='/data-rights'
              className='text-primary text-decoration-none fs-8'
              target='_blank'
              rel='noopener noreferrer'
            >
              {intl.formatMessage({id: 'CONSENT.DATA_RIGHTS'})}
            </a>
          </div>
        </div>

        <div className='consent-banner-actions'>
          <button
            type='button'
            className='btn btn-sm btn-light me-2'
            onClick={handleDismiss}
            disabled={isLoading}
            aria-label='Dismiss consent banner'
          >
            {intl.formatMessage({id: 'CONSENT.DISMISS'})}
          </button>
          <button
            type='button'
            className='btn btn-sm btn-primary'
            onClick={handleAgree}
            disabled={isLoading}
            aria-label='Accept consent'
          >
            {isLoading ? (
              <>
                <span className='spinner-border spinner-border-sm me-2'></span>
                {intl.formatMessage({id: 'CONSENT.ACCEPTING'})}
              </>
            ) : (
              intl.formatMessage({id: 'CONSENT.ACCEPT'})
            )}
          </button>
        </div>
      </div>

      {/* Accessibility: Announce to screen readers */}
      <div className='sr-only' role='status' aria-live='polite'>
        {intl.formatMessage({id: 'CONSENT.ANNOUNCEMENT'})}
      </div>
    </div>
  )
}
