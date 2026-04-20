import {supabase} from '../../lib/supabaseClient'
import {EMPTY_SOCIAL_LINKS, Role, SocialLinks, Status, User} from './_models'

const BUCKET = 'avatars'
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

type DbRow = {
  id: string
  full_name: string
  email: string
  role: Role
  status: Status
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
    avatarUrl: row.avatar_url ?? undefined,
    socialLinks: rowToSocialLinks(row),
  }
}

export async function fetchUsers(): Promise<User[]> {
  const {data, error} = await supabase
    .from('users')
    .select('*')
    .order('created_at', {ascending: false})
  if (error) throw new Error(error.message)
  return (data as DbRow[]).map(rowToUser)
}

export async function fetchUserById(id: string): Promise<User> {
  const {data, error} = await supabase.from('users').select('*').eq('id', id).single()
  if (error) throw new Error(error.message)
  return rowToUser(data as DbRow)
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('INVALID_FILE_TYPE')
  }
  if (file.size > MAX_SIZE) {
    throw new Error('FILE_TOO_LARGE')
  }
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}.${ext}`
  const {error} = await supabase.storage.from(BUCKET).upload(path, file, {upsert: true})
  if (error) throw new Error(error.message)
  const {data} = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function insertUser(
  payload: Omit<User, 'id'>,
  avatarFile?: File
): Promise<User> {
  const id = crypto.randomUUID()
  let avatarUrl = payload.avatarUrl ?? null

  if (avatarFile) {
    avatarUrl = await uploadAvatar(id, avatarFile)
  }

  const {data, error} = await supabase
    .from('users')
    .insert({
      id,
      full_name: payload.fullName,
      email: payload.email,
      role: payload.role,
      status: payload.status,
      avatar_url: avatarUrl,
      linkedin_username: payload.socialLinks.linkedin.username || null,
      linkedin_url: payload.socialLinks.linkedin.url || null,
      instagram_username: payload.socialLinks.instagram.username || null,
      instagram_url: payload.socialLinks.instagram.url || null,
      x_username: payload.socialLinks.x.username || null,
      x_url: payload.socialLinks.x.url || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return rowToUser(data as DbRow)
}

export async function updateUser(
  id: string,
  payload: Partial<Omit<User, 'id'>>,
  avatarFile?: File
): Promise<User> {
  let avatarUrl = payload.avatarUrl ?? undefined

  if (avatarFile) {
    avatarUrl = await uploadAvatar(id, avatarFile)
  }

  const update: Partial<Record<string, unknown>> = {}
  if (payload.fullName !== undefined) update.full_name = payload.fullName
  if (payload.email !== undefined) update.email = payload.email
  if (payload.role !== undefined) update.role = payload.role
  if (payload.status !== undefined) update.status = payload.status
  if (avatarUrl !== undefined) update.avatar_url = avatarUrl
  if (payload.socialLinks !== undefined) {
    update.linkedin_username = payload.socialLinks.linkedin.username || null
    update.linkedin_url = payload.socialLinks.linkedin.url || null
    update.instagram_username = payload.socialLinks.instagram.username || null
    update.instagram_url = payload.socialLinks.instagram.url || null
    update.x_username = payload.socialLinks.x.username || null
    update.x_url = payload.socialLinks.x.url || null
  }

  const {data, error} = await supabase
    .from('users')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return rowToUser(data as DbRow)
}

export async function removeUser(id: string): Promise<void> {
  const {error} = await supabase.from('users').delete().eq('id', id)
  if (error) throw new Error(error.message)
  // Best-effort: remove storage files for known extensions
  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    await supabase.storage.from(BUCKET).remove([`${id}.${ext}`])
  }
}
