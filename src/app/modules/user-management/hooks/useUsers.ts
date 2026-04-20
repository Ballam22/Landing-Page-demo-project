import {useMutation, useQuery, useQueryClient} from 'react-query'
import {User} from '../_models'
import {fetchUsers, insertUser, removeUser, updateUser} from '../_requests'

export const USERS_QUERY_KEY = ['users'] as const

export function useUserList() {
  return useQuery(USERS_QUERY_KEY, fetchUsers, {staleTime: 0})
}

export function useAddUser() {
  const queryClient = useQueryClient()
  return useMutation(
    ({payload, avatarFile}: {payload: Omit<User, 'id'>; avatarFile?: File}) =>
      insertUser(payload, avatarFile),
    {
      onSuccess: () => queryClient.invalidateQueries(USERS_QUERY_KEY),
    }
  )
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation(
    ({
      id,
      payload,
      avatarFile,
    }: {
      id: string
      payload: Partial<Omit<User, 'id'>>
      avatarFile?: File
    }) => updateUser(id, payload, avatarFile),
    {
      onSuccess: () => queryClient.invalidateQueries(USERS_QUERY_KEY),
    }
  )
}

export function useRemoveUser() {
  const queryClient = useQueryClient()
  return useMutation((id: string) => removeUser(id), {
    onSuccess: () => queryClient.invalidateQueries(USERS_QUERY_KEY),
  })
}
