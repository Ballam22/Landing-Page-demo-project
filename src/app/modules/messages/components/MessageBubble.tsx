import {FC} from 'react'
import clsx from 'clsx'
import {useIntl} from 'react-intl'
import {KTIcon} from '../../../../_metronic/helpers'
import {Message} from '../model/Message'
import {User} from '../../user-management/model/User'
import {getInitials} from '../../../hooks/useCurrentProfile'

type Props = {
  message: Message
  isMine: boolean
  senderUser: User | undefined
  isDeleting?: boolean
  onDelete?: (message: Message) => void
}

const MessageBubble: FC<Props> = ({message, isMine, senderUser, isDeleting = false, onDelete}) => {
  const intl = useIntl()

  const timestamp = new Intl.DateTimeFormat(intl.locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(message.createdAt))

  return (
    <div
      className={clsx('d-flex align-items-end gap-2 mb-3', {
        'justify-content-end': isMine,
        'justify-content-start': !isMine,
      })}
    >
      {!isMine && (
        <div className='symbol symbol-30px flex-shrink-0'>
          {senderUser?.avatarUrl ? (
            <img
              src={senderUser.avatarUrl}
              alt={senderUser.fullName}
              className='symbol-label rounded-circle'
            />
          ) : (
            <span className='symbol-label bg-light-primary text-primary fw-bold fs-8'>
              {senderUser ? getInitials(senderUser.fullName) : '?'}
            </span>
          )}
        </div>
      )}

      <div style={{maxWidth: '65%'}}>
        <div
          className={clsx('rounded px-4 py-3', {
            'bg-light-primary text-gray-900': isMine,
            'bg-light text-gray-800': !isMine,
          })}
        >
          <div className='fs-6' style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
            {message.body}
          </div>
        </div>
        <div className='d-flex align-items-center gap-2 mt-1'>
          {isMine && <div className='flex-grow-1' />}
          <div
            className={clsx('fs-8 text-muted', {
              'text-end': isMine,
              'text-start': !isMine,
            })}
          >
            {timestamp}
          </div>
          {onDelete && (
            <button
              type='button'
              className='btn btn-icon btn-sm btn-light-danger w-25px h-25px'
              title='Delete message'
              disabled={isDeleting}
              onClick={() => onDelete(message)}
            >
              {isDeleting ? (
                <span className='spinner-border spinner-border-sm' />
              ) : (
                <KTIcon iconName='trash' className='fs-7' />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export {MessageBubble}
