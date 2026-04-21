import {createContext, FC, ReactNode, useEffect, useState} from 'react'
import {useAuth} from '../auth'
import {User} from './model/User'
import {resolveCurrentUserId} from './service/userService'
import {useUserController} from './controller/useUserController'

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
    resolveCurrentUserId(email).then(setCurrentUserId)
  }, [currentUser?.email])

  const {addUser, updateUser, deleteUser} = useUserController()

  return (
    <UserManagementContext.Provider value={{currentUserId, addUser, updateUser, deleteUser}}>
      {children}
    </UserManagementContext.Provider>
  )
}

export {UserManagementContext, UserManagementProvider}
