import {createContext, FC, ReactNode, useState} from 'react'
import {MOCK_USERS} from './_mockData'
import {User} from './_models'

type UserManagementContextType = {
  users: User[]
  addUser: (data: Omit<User, 'id'>) => void
  updateUser: (id: string, data: Partial<Omit<User, 'id'>>) => void
  deleteUser: (id: string) => void
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined)

type Props = {
  children: ReactNode
}

const UserManagementProvider: FC<Props> = ({children}) => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS)

  const addUser = (data: Omit<User, 'id'>) => {
    const newUser: User = {
      ...data,
      id: crypto.randomUUID(),
    }
    setUsers((prev) => [...prev, newUser])
  }

  const updateUser = (id: string, data: Partial<Omit<User, 'id'>>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? {...u, ...data} : u)))
  }

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <UserManagementContext.Provider value={{users, addUser, updateUser, deleteUser}}>
      {children}
    </UserManagementContext.Provider>
  )
}

export {UserManagementContext, UserManagementProvider}
