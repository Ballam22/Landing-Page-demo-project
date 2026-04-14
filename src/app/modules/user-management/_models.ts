export type Role = 'Admin' | 'Manager' | 'User'
export type Status = 'Active' | 'Inactive'

export type User = {
  id: string
  fullName: string
  email: string
  role: Role
  status: Status
  avatarUrl?: string
}

export type UserFormValues = {
  fullName: string
  email: string
  role: Role
  status: Status
  avatarFile: File | null
  avatarUrl?: string
}
