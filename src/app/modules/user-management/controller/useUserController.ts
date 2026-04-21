import {useMutation, useQuery, useQueryClient} from 'react-query'
import {User} from '../model/User'
import {getAllUsers, createUser, updateUser, deleteUser} from '../service/userService'

export const USERS_QUERY_KEY = ['users'] as const

export type UseUserControllerResult = {
  users: User[]
  isLoading: boolean
  error: Error | null
  addUser: (payload: Omit<User, 'id'>, avatarFile?: File) => Promise<User>
  updateUser: (id: string, payload: Partial<Omit<User, 'id'>>, avatarFile?: File) => Promise<User>
  deleteUser: (id: string) => Promise<void>
}

export function useUserController(): UseUserControllerResult {
  const queryClient = useQueryClient()

  const {data: users = [], isLoading, error} = useQuery(USERS_QUERY_KEY, getAllUsers, {
    staleTime: 0,
  })

  const addMutation = useMutation(
    ({payload, avatarFile}: {payload: Omit<User, 'id'>; avatarFile?: File}) =>
      createUser(payload, avatarFile),
    {onSuccess: () => queryClient.invalidateQueries(USERS_QUERY_KEY)}
  )

  const updateMutation = useMutation(
    ({
      id,
      payload,
      avatarFile,
    }: {
      id: string
      payload: Partial<Omit<User, 'id'>>
      avatarFile?: File
    }) => updateUser(id, payload, avatarFile),
    {onSuccess: () => queryClient.invalidateQueries(USERS_QUERY_KEY)}
  )

  const deleteMutation = useMutation((id: string) => deleteUser(id), {
    onSuccess: () => queryClient.invalidateQueries(USERS_QUERY_KEY),
  })

  return {
    users,
    isLoading,
    error: (error as Error | null) ?? null,
    addUser: (payload, avatarFile) => addMutation.mutateAsync({payload, avatarFile}),
    updateUser: (id, payload, avatarFile) =>
      updateMutation.mutateAsync({id, payload, avatarFile}),
    deleteUser: (id) => deleteMutation.mutateAsync(id),
  }
}
