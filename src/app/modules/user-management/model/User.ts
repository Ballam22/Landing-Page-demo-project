export type Role = 'Admin' | 'Manager' | 'User'
export type Status = 'Active' | 'Inactive'
export type PresenceStatus = 'Available' | 'Idle' | 'Busy'

export type SocialPlatform = 'linkedin' | 'instagram' | 'x'

export type SocialLink = {
  username: string
  url: string
}

export type SocialLinks = Record<SocialPlatform, SocialLink>

export const EMPTY_SOCIAL_LINKS: SocialLinks = {
  linkedin: {username: '', url: ''},
  instagram: {username: '', url: ''},
  x: {username: '', url: ''},
}

export type User = {
  id: string
  fullName: string
  email: string
  role: Role
  status: Status
  presenceStatus: PresenceStatus
  avatarUrl?: string
  socialLinks: SocialLinks
}

export type UserFormValues = {
  fullName: string
  email: string
  role: Role
  status: Status
  presenceStatus: PresenceStatus
  avatarFile: File | null
  avatarUrl?: string
  socialLinks: SocialLinks
}
