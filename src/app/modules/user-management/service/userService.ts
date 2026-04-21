import {Role, User} from '../model/User'
import * as userRepository from '../repository/userRepository'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

async function validateAndUploadAvatar(userId: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error('INVALID_FILE_TYPE')
  if (file.size > MAX_SIZE) throw new Error('FILE_TOO_LARGE')
  return userRepository.uploadAvatar(userId, file)
}

export async function getAllUsers(): Promise<User[]> {
  return userRepository.getAll()
}

export async function createUser(
  payload: Omit<User, 'id'>,
  avatarFile?: File
): Promise<User> {
  const id = crypto.randomUUID()
  let avatarUrl = payload.avatarUrl ?? undefined

  if (avatarFile) {
    avatarUrl = await validateAndUploadAvatar(id, avatarFile)
  }

  return userRepository.create({...payload, id, avatarUrl})
}

export async function updateUser(
  id: string,
  payload: Partial<Omit<User, 'id'>>,
  avatarFile?: File
): Promise<User> {
  let resolvedPayload = payload

  if (avatarFile) {
    const avatarUrl = await validateAndUploadAvatar(id, avatarFile)
    resolvedPayload = {...payload, avatarUrl}
  }

  return userRepository.update(id, resolvedPayload)
}

export async function deleteUser(id: string): Promise<void> {
  return userRepository.del(id)
}

export async function resolveCurrentUserId(email: string): Promise<string | null> {
  const user = await userRepository.getByEmail(email)
  return user?.id ?? null
}

export async function getUserRoleByEmail(email: string): Promise<Role | null> {
  const user = await userRepository.getByEmail(email)
  return user?.role ?? null
}
