import {FC} from 'react'
import clsx from 'clsx'
import {useIntl} from 'react-intl'
import {ConversationSummary} from '../model/Message'
import {User} from '../../user-management/model/User'
import {getInitials} from '../../../hooks/useCurrentProfile'

type Props = {
  summary: ConversationSummary
  user: User
  isSelected: boolean
  onClick: () => void
}

const ConversationItem: FC<Props> = ({summary, user, isSelected, onClick}) => {
  const intl = useIntl()

  const preview = summary.lastMessage
    ? summary.lastMessage.body.length > 40
      ? summary.lastMessage.body.slice(0, 40) + '…'
      : summary.lastMessage.body
    : ''

  const timestamp = summary.lastMessage
    ? new Intl.DateTimeFormat(intl.locale, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(summary.lastMessage.createdAt))
    : ''

  return (
    <button
      type='button'
      className={clsx(
        'btn btn-flush d-flex align-items-center gap-3 w-100 text-start px-4 py-3 border-bottom border-gray-200',
        {'bg-light-primary': isSelected}
      )}
      onClick={onClick}
    >
      <div className='symbol symbol-45px flex-shrink-0'>
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.fullName} className='symbol-label rounded-circle' />
        ) : (
          <span className='symbol-label bg-light-primary text-primary fw-bold fs-6'>
            {getInitials(user.fullName)}
          </span>
        )}
      </div>

      <div className='flex-grow-1 overflow-hidden'>
        <div className='d-flex align-items-center justify-content-between mb-1'>
          <span className='fw-bolder text-gray-900 fs-6'>{user.fullName}</span>
          <span className='text-muted fs-8 flex-shrink-0 ms-2'>{timestamp}</span>
        </div>
        <div className='d-flex align-items-center justify-content-between'>
          <span className='text-muted fs-7 text-truncate'>{preview}</span>
          {summary.unreadCount > 0 && (
            <span className='badge badge-danger rounded-pill ms-2 flex-shrink-0'>
              {summary.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

export {ConversationItem}
