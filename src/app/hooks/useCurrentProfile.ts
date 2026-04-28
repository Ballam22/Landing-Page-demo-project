import {useQuery} from 'react-query'
import {supabase} from '../lib/supabaseClient'
import {
  EMPTY_SOCIAL_LINKS,
  PresenceStatus,
  Role,
  SocialLinks,
  Status,
} from '../modules/user-management/model/User'

export type CurrentProfile = {
  id: string
  fullName: string
  email: string
  role: Role
  status: Status
  presenceStatus: PresenceStatus
  avatarUrl: string | null
  createdAt: string
  socialLinks: SocialLinks
}

type CurrentProfileRow = {
  id: string
  full_name: string
  email: string
  role: Role
  status: Status
  presence_status?: PresenceStatus | null
  avatar_url: string | null
  created_at: string
  linkedin_username: string | null
  linkedin_url: string | null
  instagram_username: string | null
  instagram_url: string | null
  x_username: string | null
  x_url: string | null
}

const CURRENT_PROFILE_QUERY_KEY = 'current-user-profile'

function isMissingPresenceColumn(error: {code?: string; message?: string} | null): boolean {
  if (!error) return false
  return (
    error.code === 'PGRST204' ||
    error.code === '42703' ||
    /presence_status|schema cache|column/i.test(error.message ?? '')
  )
}

export async function fetchCurrentProfile(email: string): Promise<CurrentProfile | null> {
  const baseColumns =
    'id, full_name, email, role, status, avatar_url, created_at, linkedin_username, linkedin_url, instagram_username, instagram_url, x_username, x_url'
  const withPresenceColumns = `${baseColumns}, presence_status`

  const profileQuery = await supabase
    .from('users')
    .select(withPresenceColumns)
    .eq('email', email)
    .single()
  let data = profileQuery.data as CurrentProfileRow | null
  let error = profileQuery.error

  if (isMissingPresenceColumn(error)) {
    const fallback = await supabase.from('users').select(baseColumns).eq('email', email).single()
    data = fallback.data as CurrentProfileRow | null
    error = fallback.error
  }

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
    presenceStatus: data.presence_status ?? 'Available',
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
