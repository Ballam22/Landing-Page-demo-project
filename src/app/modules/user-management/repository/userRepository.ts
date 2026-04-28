import {supabase} from '../../../lib/supabaseClient'
import {EMPTY_SOCIAL_LINKS, PresenceStatus, Role, SocialLinks, Status, User} from '../model/User'

const BUCKET = 'avatars'

type DbRow = {
  id: string
  full_name: string
  email: string
  role: Role
  status: Status
  presence_status?: PresenceStatus | null
  avatar_url: string | null
  linkedin_username: string | null
  linkedin_url: string | null
  instagram_username: string | null
  instagram_url: string | null
  x_username: string | null
  x_url: string | null
  created_at: string
}

function rowToSocialLinks(row: DbRow): SocialLinks {
  return {
    linkedin: {
      username: row.linkedin_username ?? EMPTY_SOCIAL_LINKS.linkedin.username,
      url: row.linkedin_url ?? EMPTY_SOCIAL_LINKS.linkedin.url,
    },
    instagram: {
      username: row.instagram_username ?? EMPTY_SOCIAL_LINKS.instagram.username,
      url: row.instagram_url ?? EMPTY_SOCIAL_LINKS.instagram.url,
    },
    x: {
      username: row.x_username ?? EMPTY_SOCIAL_LINKS.x.username,
      url: row.x_url ?? EMPTY_SOCIAL_LINKS.x.url,
    },
  }
}

function rowToUser(row: DbRow): User {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    status: row.status,
    presenceStatus: row.presence_status ?? 'Available',
    avatarUrl: row.avatar_url ?? undefined,
    socialLinks: rowToSocialLinks(row),
  }
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}.${ext}`
  const {error} = await supabase.storage.from(BUCKET).upload(path, file, {upsert: true})
  if (error) throw new Error(error.message)
  const {data} = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function getAll(): Promise<User[]> {
  const {data, error} = await supabase
    .from('users')
    .select('*')
    .order('created_at', {ascending: false})
  if (error) throw new Error(error.message)
  return (data as DbRow[]).map(rowToUser)
}

export async function getById(id: string): Promise<User> {
  const {data, error} = await supabase.from('users').select('*').eq('id', id).single()
  if (error) throw new Error(error.message)
  return rowToUser(data as DbRow)
}

export async function getByEmail(email: string): Promise<User | null> {
  const {data, error} = await supabase.from('users').select('*').eq('email', email).single()
  if (error) return null
  return rowToUser(data as DbRow)
}

export async function create(user: User): Promise<User> {
  const {data, error} = await supabase
    .from('users')
    .insert({
      id: user.id,
      full_name: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      presence_status: user.presenceStatus,
      avatar_url: user.avatarUrl ?? null,
      linkedin_username: user.socialLinks.linkedin.username || null,
      linkedin_url: user.socialLinks.linkedin.url || null,
      instagram_username: user.socialLinks.instagram.username || null,
      instagram_url: user.socialLinks.instagram.url || null,
      x_username: user.socialLinks.x.username || null,
      x_url: user.socialLinks.x.url || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return rowToUser(data as DbRow)
}

export async function update(
  id: string,
  payload: Partial<Omit<User, 'id'>>
): Promise<User> {
  const patch: Partial<Record<string, unknown>> = {}
  if (payload.fullName !== undefined) patch.full_name = payload.fullName
  if (payload.email !== undefined) patch.email = payload.email
  if (payload.role !== undefined) patch.role = payload.role
  if (payload.status !== undefined) patch.status = payload.status
  if (payload.presenceStatus !== undefined) patch.presence_status = payload.presenceStatus
  if (payload.avatarUrl !== undefined) patch.avatar_url = payload.avatarUrl
  if (payload.socialLinks !== undefined) {
    patch.linkedin_username = payload.socialLinks.linkedin.username || null
    patch.linkedin_url = payload.socialLinks.linkedin.url || null
    patch.instagram_username = payload.socialLinks.instagram.username || null
    patch.instagram_url = payload.socialLinks.instagram.url || null
    patch.x_username = payload.socialLinks.x.username || null
    patch.x_url = payload.socialLinks.x.url || null
  }

  const {data, error} = await supabase
    .from('users')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return rowToUser(data as DbRow)
}

export async function del(id: string): Promise<void> {
  const {error} = await supabase.from('users').delete().eq('id', id)
  if (error) throw new Error(error.message)
  // Best-effort: remove storage files for known extensions
  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    await supabase.storage.from(BUCKET).remove([`${id}.${ext}`])
  }
}
