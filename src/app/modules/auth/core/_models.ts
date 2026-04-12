export interface AuthModel {
  api_token: string
  refreshToken?: string
}

export interface UserAddressModel {
  addressLine: string
  city: string
  state: string
  postCode: string
}

export interface UserCommunicationModel {
  email: boolean
  sms: boolean
  phone: boolean
}

export interface UserEmailSettingsModel {
  emailNotification?: boolean
  sendCopyToPersonalEmail?: boolean
  activityRelatesEmail?: {
    youHaveNewNotifications?: boolean
    youAreSentADirectMessage?: boolean
    someoneAddsYouAsAsAConnection?: boolean
    uponNewOrder?: boolean
    newMembershipApproval?: boolean
    memberRegistration?: boolean
  }
  updatesFromKeenthemes?: {
    newsAboutKeenthemesProductsAndFeatureUpdates?: boolean
    tipsOnGettingMoreOutOfKeen?: boolean
    thingsYouMissedSindeYouLastLoggedIntoKeen?: boolean
    newsAboutStartOnPartnerProductsAndOtherServices?: boolean
    tipsOnStartBusinessProducts?: boolean
  }
}

export interface UserSocialNetworksModel {
  linkedIn: string
  facebook: string
  twitter: string
  instagram: string
}

export interface UserModel {
  id: number
  username: string
  password: string | undefined
  email: string
  first_name: string
  last_name: string
  fullname?: string
  occupation?: string
  companyName?: string
  phone?: string
  roles?: Array<number>
  pic?: string
  language?: 'en' | 'de' | 'es' | 'fr' | 'ja' | 'zh' | 'ru'
  timeZone?: string
  website?: 'https://keenthemes.com'
  emailSettings?: UserEmailSettingsModel
  auth?: AuthModel
  communication?: UserCommunicationModel
  address?: UserAddressModel
  socialNetworks?: UserSocialNetworksModel
  emailVerified?: boolean
}

export type MockUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  passwordHash: string
  emailVerified: boolean
  createdAt: number
  lastLoginAt: number | null
}

export type LockoutRecord = {
  count: number
  resetAt: number
}

export type ResetToken = {
  email: string
  expiresAt: number
  used: boolean
}

export type ResetRateLimit = {
  count: number
  windowStart: number
}

export type MockAuthError = {
  type: 'lockout' | 'rate_limit' | 'invalid_token' | 'duplicate_email' | 'invalid_credentials'
  message: string
  resetAt?: number
}

export function isMockAuthError(error: unknown): error is MockAuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    typeof (error as MockAuthError).type === 'string'
  )
}
