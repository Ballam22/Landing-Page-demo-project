import {useQuery} from 'react-query'
import {supabase} from '../lib/supabaseClient'
import {EMPTY_SOCIAL_LINKS, Role, SocialLinks, Status} from '../modules/user-management/model/User'

export type CurrentProfile = {
  id: string
  fullName: string
  email: string
  role: Role
  status: Status
  avatarUrl: string | null
  createdAt: string
  socialLinks: SocialLinks
}

const CURRENT_PROFILE_QUERY_KEY = 'current-user-profile'

export async function fetchCurrentProfile(email: string): Promise<CurrentProfile | null> {
  const {data, error} = await supabase
    .from('users')
    .select(
      'id, full_name, email, role, status, avatar_url, created_at, linkedin_username, linkedin_url, instagram_username, instagram_url, x_username, x_url'
    )
    .eq('email', email)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }

    throw new Error(error.message)
  }

  if (!data) {
    return null
  }

  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    role: data.role,
    status: data.status,
    avatarUrl: data.avatar_url ?? null,
    createdAt: data.created_at,
    socialLinks: {
      linkedin: {
        username: data.linkedin_username ?? EMPTY_SOCIAL_LINKS.linkedin.username,
        url: data.linkedin_url ?? EMPTY_SOCIAL_LINKS.linkedin.url,
      },
      instagram: {
        username: data.instagram_username ?? EMPTY_SOCIAL_LINKS.instagram.username,
        url: data.instagram_url ?? EMPTY_SOCIAL_LINKS.instagram.url,
      },
      x: {
        username: data.x_username ?? EMPTY_SOCIAL_LINKS.x.username,
        url: data.x_url ?? EMPTY_SOCIAL_LINKS.x.url,
      },
    },
  }
}

export function getInitials(value: string): string {
  return value
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function useCurrentProfile(email?: string) {
  return useQuery(
    [CURRENT_PROFILE_QUERY_KEY, email],
    () => fetchCurrentProfile(email ?? ''),
    {
      enabled: !!email,
      staleTime: 60_000,
    }
  )
}
