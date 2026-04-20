import {createContext, FC, ReactNode, useEffect, useState} from 'react'
import {supabase} from '../../lib/supabaseClient'
import {useAuth} from '../auth'
import {User} from './_models'
import {useAddUser, useRemoveUser, useUpdateUser} from './hooks/useUsers'

type UserManagementContextType = {
  currentUserId: string | null
  addUser: (payload: Omit<User, 'id'>, avatarFile?: File) => Promise<User>
  updateUser: (id: string, payload: Partial<Omit<User, 'id'>>, avatarFile?: File) => Promise<User>
  deleteUser: (id: string) => Promise<void>
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined)

type Props = {children: ReactNode}

const UserManagementProvider: FC<Props> = ({children}) => {
  const {currentUser} = useAuth()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const email = currentUser?.email
    if (!email) return
    supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
      .then(({data}) => {
        setCurrentUserId(data?.id ?? null)
      })
  }, [currentUser?.email])

  const addMutation = useAddUser()
  const updateMutation = useUpdateUser()
  const removeMutation = useRemoveUser()

  const addUser = (payload: Omit<User, 'id'>, avatarFile?: File) =>
    addMutation.mutateAsync({payload, avatarFile})

  const updateUser = (
    id: string,
    payload: Partial<Omit<User, 'id'>>,
    avatarFile?: File
  ) => updateMutation.mutateAsync({id, payload, avatarFile})

  const deleteUser = (id: string) => removeMutation.mutateAsync(id)

  return (
    <UserManagementContext.Provider value={{currentUserId, addUser, updateUser, deleteUser}}>
      {children}
    </UserManagementContext.Provider>
  )
}

export {UserManagementContext, UserManagementProvider}
