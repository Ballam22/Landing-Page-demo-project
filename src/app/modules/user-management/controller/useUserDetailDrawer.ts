import {useState, useEffect} from 'react'
import {User} from '../model/User'

export function useUserDetailDrawer() {
  const [selectedDetailUser, setSelectedDetailUser] = useState<User | null>(null)
  const isOpen = selectedDetailUser !== null

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !document.body.classList.contains('modal-open')) {
        setSelectedDetailUser(null)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen])

  return {
    selectedDetailUser,
    isOpen,
    openDrawer: (user: User) => setSelectedDetailUser(user),
    closeDrawer: () => setSelectedDetailUser(null),
  }
}
