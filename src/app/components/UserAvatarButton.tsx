import {FC} from 'react'
import {useAuth} from '../modules/auth'
import {getInitials, useCurrentProfile} from '../hooks/useCurrentProfile'

const UserAvatarButton: FC = () => {
  const {currentUser} = useAuth()

  const email = currentUser?.email ?? ''
  const {data: profile} = useCurrentProfile(email)

  const initials = profile?.fullName
    ? getInitials(profile.fullName)
    : (currentUser?.first_name?.[0] ?? currentUser?.email?.[0] ?? '?').toUpperCase()

  const avatarUrl = profile?.avatarUrl

  return (
    <div className='symbol symbol-35px cursor-pointer'>
      {avatarUrl ? (
        <img
          src={`${avatarUrl}?t=${Date.now()}`}
          alt={profile?.fullName ?? 'avatar'}
          className='rounded-circle'
          style={{width: 35, height: 35, objectFit: 'cover'}}
        />
      ) : (
        <div
          className='symbol-label fs-6 fw-semibold bg-light-primary text-primary rounded-circle'
          style={{width: 35, height: 35}}
        >
          {initials}
        </div>
      )}
    </div>
  )
}

export {UserAvatarButton}
