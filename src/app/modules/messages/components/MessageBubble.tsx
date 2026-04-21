import {FC} from 'react'
import clsx from 'clsx'
import {useIntl} from 'react-intl'
import {Message} from '../model/Message'
import {User} from '../../user-management/model/User'
import {getInitials} from '../../../hooks/useCurrentProfile'

type Props = {
  message: Message
  isMine: boolean
  senderUser: User | undefined
}

const MessageBubble: FC<Props> = ({message, isMine, senderUser}) => {
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
        <div
          className={clsx('fs-8 text-muted mt-1', {
            'text-end': isMine,
            'text-start': !isMine,
          })}
        >
          {timestamp}
        </div>
      </div>
    </div>
  )
}

export {MessageBubble}
