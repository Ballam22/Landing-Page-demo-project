import {FC, ReactNode, useEffect, useState} from 'react'
import {Navigate} from 'react-router-dom'
import {useAuth} from '../../../auth'
import {Role} from '../../model/User'
import {getUserRoleByEmail} from '../../service/userService'

type Props = {
  allowedRoles: Role[]
  children: ReactNode
}

type Status = 'loading' | 'allowed' | 'denied'

const RoleGuard: FC<Props> = ({allowedRoles, children}) => {
  const {currentUser} = useAuth()
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let cancelled = false
    const email = currentUser?.email
    if (!email) {
      setStatus('denied')
      return
    }
    getUserRoleByEmail(email).then((role) => {
      if (cancelled) return
      setStatus(role && allowedRoles.includes(role) ? 'allowed' : 'denied')
    })
    return () => {
      cancelled = true
    }
  }, [currentUser?.email, allowedRoles])

  if (status === 'loading') {
    return (
      <div className='d-flex justify-content-center align-items-center min-h-300px'>
        <span className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Checking access...</span>
        </span>
      </div>
    )
  }

  if (status === 'denied') {
    return <Navigate to='/dashboard' replace />
  }

  return <>{children}</>
}

export {RoleGuard}
