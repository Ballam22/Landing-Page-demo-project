export {ConsentBanner} from './components/ConsentBanner'
export {
  recordConsent,
  withdrawConsent,
  hasUserConsented,
  getUserConsents,
  hasConsentLocally,
  markConsentBannerAsSeen,
  isConsentBannerDismissed,
  type ConsentType,
  type UserConsent,
} from './service/consentService'
