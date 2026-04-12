import {useEffect} from 'react'
import {Navigate, Route, Routes, useNavigate} from 'react-router-dom'
import {useAuth} from './core/Auth'

export function Logout() {
  const {logout} = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    logout()
    navigate('/auth/login', {replace: true})
  }, [logout, navigate])

  return (
    <Routes>
      <Route path='*' element={<Navigate to='/auth/login' replace />} />
    </Routes>
  )
}
