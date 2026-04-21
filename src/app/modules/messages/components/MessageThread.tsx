import {FC, useEffect, useRef} from 'react'
import {useIntl} from 'react-intl'
import {useThread, useSendMessage} from '../controller/useMessageController'
import {User} from '../../user-management/model/User'
import {MessageBubble} from './MessageBubble'
import {MessageInput} from './MessageInput'

type Props = {
  currentUserId: string
  otherUser: User
  allUsers: User[]
}

const MessageThread: FC<Props> = ({currentUserId, otherUser, allUsers}) => {
  const intl = useIntl()
  const {data: messages = [], isLoading, error} = useThread(currentUserId, otherUser.id)
  const sendMessage = useSendMessage()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior: 'smooth'})
  }, [messages.length])

  const handleSend = async (body: string) => {
    await sendMessage.mutateAsync({
      senderId: currentUserId,
      recipientId: otherUser.id,
      body,
    })
  }

  return (
    <div className='d-flex flex-column h-100'>
      <div className='px-5 py-3 border-bottom border-gray-200'>
        <div className='fw-bolder text-gray-900'>{otherUser.fullName}</div>
        <div className='text-muted fs-7'>{otherUser.email}</div>
      </div>

      <div className='flex-grow-1 overflow-y-auto px-5 py-4'>
        {isLoading && (
          <div className='d-flex align-items-center justify-content-center h-100 text-muted'>
            <span className='spinner-border spinner-border-sm me-2' />
            {intl.formatMessage({id: 'MESSAGES.LOADING'})}
          </div>
        )}

        {!!error && !isLoading && (
          <div className='alert alert-danger py-3'>
            {intl.formatMessage({id: 'MESSAGES.LOAD_ERROR'})}
          </div>
        )}

        {!isLoading && !error && messages.length === 0 && (
          <div className='d-flex align-items-center justify-content-center h-100 text-muted'>
            {intl.formatMessage({id: 'MESSAGES.EMPTY_THREAD'})}
          </div>
        )}

        {messages.map((message) => {
          const isMine = message.senderId === currentUserId
          const senderUser = isMine
            ? undefined
            : allUsers.find((u) => u.id === message.senderId)
          return (
            <MessageBubble
              key={message.id}
              message={message}
              isMine={isMine}
              senderUser={senderUser}
            />
          )
        })}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={handleSend} disabled={isLoading} />
    </div>
  )
}

export {MessageThread}
