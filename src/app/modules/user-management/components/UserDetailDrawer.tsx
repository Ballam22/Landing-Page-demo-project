import {CSSProperties, FC} from 'react'
import {useIntl} from 'react-intl'
import {User} from '../model/User'
import {RoleBadge} from './RoleBadge'
import {KTIcon} from '../../../../_metronic/helpers'

type Props = {
  user: User | null
  isOpen: boolean
  onClose: () => void
}

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

const drawerStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  right: 0,
  height: '100vh',
  width: 'min(400px, 100vw)',
  zIndex: 110,
  overflowY: 'auto',
}

const UserDetailDrawer: FC<Props> = ({user, isOpen, onClose}) => {
  const intl = useIntl()

  const panelStyle: CSSProperties = {
    ...drawerStyle,
    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.3s ease',
  }

  const socialPlatforms = [
    {key: 'linkedin' as const, label: intl.formatMessage({id: 'USER_DETAIL.SOCIAL_LINKEDIN'})},
    {key: 'instagram' as const, label: intl.formatMessage({id: 'USER_DETAIL.SOCIAL_INSTAGRAM'})},
    {key: 'x' as const, label: intl.formatMessage({id: 'USER_DETAIL.SOCIAL_X'})},
  ]

  const hasAnySocial =
    user != null &&
    socialPlatforms.some((p) => user.socialLinks[p.key]?.url)

  return (
    <>
      {isOpen && (
        <div
          className='drawer-overlay'
          onClick={onClose}
          style={{position: 'fixed', inset: 0, zIndex: 109, background: 'rgba(0,0,0,0.4)'}}
        />
      )}
      <div className='bg-body shadow' style={panelStyle}>
        {/* Header */}
        <div className='d-flex align-items-center justify-content-between px-6 py-4 border-bottom'>
          <h5 className='mb-0 fw-bold'>
            {intl.formatMessage({id: 'USER_DETAIL.TITLE'})}
          </h5>
          <button
            type='button'
            className='btn btn-sm btn-icon btn-light-secondary'
            onClick={onClose}
            aria-label={intl.formatMessage({id: 'USER_DETAIL.CLOSE'})}
          >
            <KTIcon iconName='cross' className='fs-2' />
          </button>
        </div>

        {/* Body */}
        {user && (
          <div className='px-6 py-6'>
            {/* Avatar */}
            <div className='d-flex flex-column align-items-center mb-6'>
              <div
                className='symbol symbol-60px mb-4'
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f1f1f2',
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                  />
                ) : (
                  <span>{getInitials(user.fullName)}</span>
                )}
              </div>

              <div className='fs-3 fw-bold text-center mb-1'>{user.fullName}</div>
              <div className='text-muted text-center mb-3'>{user.email}</div>

              <div className='d-flex gap-2 align-items-center'>
                <RoleBadge role={user.role} />
                <span
                  className={`badge ${user.status === 'Active' ? 'badge-light-success' : 'badge-light-secondary'}`}
                >
                  {user.status}
                </span>
              </div>
            </div>

            <div className='separator separator-dashed mb-6' />

            {/* Social links */}
            <div>
              {hasAnySocial ? (
                socialPlatforms
                  .filter((p) => user.socialLinks[p.key]?.url)
                  .map((p) => (
                    <div key={p.key} className='d-flex align-items-center justify-content-between mb-3'>
                      <span className='text-muted fs-6'>{p.label}</span>
                      <a
                        href={user.socialLinks[p.key].url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='fw-semibold'
                      >
                        {user.socialLinks[p.key].username || user.socialLinks[p.key].url}
                      </a>
                    </div>
                  ))
              ) : (
                <div className='text-muted text-center fs-6'>
                  {intl.formatMessage({id: 'USER_DETAIL.NO_SOCIAL_ACCOUNTS'})}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export {UserDetailDrawer}
