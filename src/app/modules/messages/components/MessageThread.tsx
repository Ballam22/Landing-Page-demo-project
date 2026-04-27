import {FC, useEffect, useRef, useState} from 'react'
import {useIntl} from 'react-intl'
import {useThread, useSendMessage, useDeleteMessage} from '../controller/useMessageController'
import {User} from '../../user-management/model/User'
import {Message} from '../model/Message'
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
  const deleteMessage = useDeleteMessage()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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

  const handleDelete = async (message: Message) => {
    if (!window.confirm('Delete this message from the inbox?')) {
      return
    }

    try {
      setDeletingMessageId(message.id)
      setDeleteError(null)
      await deleteMessage.mutateAsync({
        userId: currentUserId,
        otherUserId: otherUser.id,
        messageId: message.id,
      })
    } catch (deleteFailure) {
      setDeleteError(
        deleteFailure instanceof Error && deleteFailure.message
          ? deleteFailure.message
          : 'Could not delete this message.'
      )
    } finally {
      setDeletingMessageId(null)
    }
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

        {deleteError && <div className='alert alert-danger py-3'>{deleteError}</div>}

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
              isDeleting={deletingMessageId === message.id}
              onDelete={handleDelete}
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
