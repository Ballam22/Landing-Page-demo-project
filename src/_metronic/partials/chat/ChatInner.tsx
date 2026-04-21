import {FC, FormEvent, useEffect, useMemo, useState} from 'react'
import clsx from 'clsx'
import {useIntl} from 'react-intl'
import {KTIcon} from '../../helpers'
import {useAuth} from '../../../app/modules/auth'
import {useCurrentProfile} from '../../../app/hooks/useCurrentProfile'
import {ConversationSummary} from '../../../app/modules/messages/model/Message'
import {
  useConversations,
  useMarkAsRead,
  useThread,
  useSendMessage,
} from '../../../app/modules/messages/controller/useMessageController'
import {useUserController} from '../../../app/modules/user-management/controller/useUserController'

type Props = {
  isDrawer?: boolean
}

const ChatInner: FC<Props> = ({isDrawer = false}) => {
  const intl = useIntl()
  const {currentUser} = useAuth()
  const {data: profile, isLoading: isProfileLoading} = useCurrentProfile(currentUser?.email)
  const {users, isLoading: isUsersLoading} = useUserController()
  const {
    data: conversationsData,
    isLoading: isMessagesLoading,
    error: messagesError,
  } = useConversations(profile?.id)

  const [selectedUserId, setSelectedUserId] = useState('')
  const [draft, setDraft] = useState('')
  const [sendSuccess, setSendSuccess] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)

  const availableUsers = useMemo(
    () => users.filter((user) => user.id !== profile?.id && user.status === 'Active'),
    [profile?.id, users]
  )

  const conversationSummaries = useMemo(() => {
    const allMessages = conversationsData?.allMessages ?? []
    const summaries: ConversationSummary[] = []

    for (const user of availableUsers) {
      const threadMessages = allMessages.filter(
        (message) =>
          (message.senderId === profile?.id && message.recipientId === user.id) ||
          (message.senderId === user.id && message.recipientId === profile?.id)
      )

      const lastMessage = threadMessages[threadMessages.length - 1] ?? null
      const unreadCount = threadMessages.filter(
        (message) =>
          message.senderId === user.id && message.recipientId === profile?.id && !message.readAt
      ).length

      if (lastMessage || unreadCount > 0) {
        summaries.push({
          userId: user.id,
          lastMessage,
          unreadCount,
        })
      }
    }

    summaries.sort((left, right) => {
      const leftTime = left.lastMessage ? new Date(left.lastMessage.createdAt).getTime() : 0
      const rightTime = right.lastMessage ? new Date(right.lastMessage.createdAt).getTime() : 0
      return rightTime - leftTime
    })

    return summaries
  }, [conversationsData, availableUsers, profile?.id])

  useEffect(() => {
    if (!availableUsers.length) {
      setSelectedUserId('')
      return
    }

    if (availableUsers.some((user) => user.id === selectedUserId)) {
      return
    }

    const nextSelectedUserId = conversationSummaries[0]?.userId ?? availableUsers[0]?.id ?? ''
    if (nextSelectedUserId) {
      setSelectedUserId(nextSelectedUserId)
    }
  }, [availableUsers, conversationSummaries, selectedUserId])

  useEffect(() => {
    setSendSuccess(null)
    setSendError(null)
  }, [selectedUserId])

  const selectedUser = availableUsers.find((user) => user.id === selectedUserId) ?? null
  const {
    data: conversation = [],
    isLoading: isConversationLoading,
    error: conversationError,
  } = useThread(profile?.id, selectedUserId || undefined)
  const sendMessageMutation = useSendMessage()
  const markConversationAsReadMutation = useMarkAsRead()
  const unreadIncomingCount = useMemo(
    () =>
      conversation.filter(
        (message) => message.senderId === selectedUserId && message.recipientId === profile?.id && !message.readAt
      ).length,
    [conversation, profile?.id, selectedUserId]
  )

  useEffect(() => {
    if (!profile?.id || !selectedUserId || unreadIncomingCount === 0 || markConversationAsReadMutation.isLoading) {
      return
    }

    markConversationAsReadMutation.mutate({
      userId: profile.id,
      otherUserId: selectedUserId,
    })
  }, [
    markConversationAsReadMutation,
    markConversationAsReadMutation.isLoading,
    profile?.id,
    selectedUserId,
    unreadIncomingCount,
  ])

  const isLoading = isProfileLoading || isUsersLoading || isMessagesLoading
  const isSending = sendMessageMutation.isLoading
  const hasLoadError = Boolean(messagesError || conversationError)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const messageBody = draft.trim()
    if (!profile?.id || !selectedUserId || !messageBody || isSending) {
      return
    }

    try {
      await sendMessageMutation.mutateAsync({
        senderId: profile.id,
        recipientId: selectedUserId,
        body: messageBody,
      })
      setDraft('')
      setSendError(null)
      setSendSuccess(intl.formatMessage({id: 'MESSAGES.SEND_SUCCESS'}))
    } catch (error) {
      setSendSuccess(null)
      setSendError(
        error instanceof Error && error.message
          ? error.message
          : intl.formatMessage({id: 'MESSAGES.SEND_ERROR'})
      )
    }
  }

  const formatTimestamp = (value: string) =>
    new Intl.DateTimeFormat(intl.locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))

  return (
    <div
      className='card-body'
      id={isDrawer ? 'kt_drawer_chat_messenger_body' : 'kt_chat_messenger_body'}
    >
      <div
        className={clsx('scroll-y me-n5 pe-5', {
          'h-300px h-lg-auto': !isDrawer,
          'min-h-300px': isDrawer,
        })}
        data-kt-element='messages'
        data-kt-scroll='true'
        data-kt-scroll-activate='{default: false, lg: true}'
        data-kt-scroll-max-height='auto'
        data-kt-scroll-dependencies={
          isDrawer
            ? '#kt_drawer_chat_messenger_header, #kt_drawer_chat_messenger_footer'
            : '#kt_header, #kt_app_header, #kt_app_toolbar, #kt_toolbar, #kt_footer, #kt_app_footer, #kt_chat_messenger_header, #kt_chat_messenger_footer'
        }
        data-kt-scroll-wrappers={
          isDrawer
            ? '#kt_drawer_chat_messenger_body'
            : '#kt_content, #kt_app_content, #kt_chat_messenger_body'
        }
        data-kt-scroll-offset={isDrawer ? '0px' : '5px'}
      >
        <div className='w-100'>
          <div className='mb-7'>
            <label className='form-label fw-semibold text-gray-700'>
              {intl.formatMessage({id: 'MESSAGES.SELECT_USER'})}
            </label>
            <select
              className='form-select form-select-solid'
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              disabled={isLoading || !availableUsers.length}
            >
              {!availableUsers.length && (
                <option value=''>{intl.formatMessage({id: 'MESSAGES.NO_RECIPIENTS'})}</option>
              )}
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName}
                </option>
              ))}
            </select>
          </div>

          {!!conversationSummaries.length && (
            <div className='mb-7'>
              <div className='fw-bold text-gray-700 mb-3'>
                {intl.formatMessage({id: 'MESSAGES.RECENT_CONVERSATIONS'})}
              </div>
              <div className='d-flex flex-column gap-3'>
                {conversationSummaries.map((summary) => {
                  const user = availableUsers.find((item) => item.id === summary.userId)
                  if (!user || !summary.lastMessage) {
                    return null
                  }

                  return (
                    <button
                      key={summary.userId}
                      type='button'
                      className={clsx(
                        'btn btn-active-light-primary text-start border border-gray-200 rounded p-4',
                        {
                          'bg-light-primary border-primary': selectedUserId === summary.userId,
                        }
                      )}
                      onClick={() => setSelectedUserId(summary.userId)}
                    >
                      <div className='d-flex align-items-center justify-content-between mb-1'>
                        <span className='fw-bolder text-gray-900'>{user.fullName}</span>
                        {summary.unreadCount > 0 && (
                          <span className='badge badge-light-danger'>{summary.unreadCount}</span>
                        )}
                      </div>
                      <div className='text-muted fs-7 text-truncate'>{summary.lastMessage.body}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {isLoading && (
            <div className='text-center text-muted py-10'>
              {intl.formatMessage({id: 'MESSAGES.LOADING'})}
            </div>
          )}

          {!isLoading && hasLoadError && (
            <div className='alert alert-danger py-3'>
              {intl.formatMessage({id: 'MESSAGES.LOAD_ERROR'})}
            </div>
          )}

          {!isLoading && !hasLoadError && !availableUsers.length && (
            <div className='text-center py-10'>
              <div className='symbol symbol-65px mx-auto mb-5'>
                <span className='symbol-label bg-light-info text-info'>
                  <KTIcon iconName='message-text-2' className='fs-1' />
                </span>
              </div>
              <div className='fw-bolder text-gray-900 fs-4 mb-2'>
                {intl.formatMessage({id: 'MESSAGES.NO_RECIPIENTS_TITLE'})}
              </div>
              <div className='text-muted fs-6'>
                {intl.formatMessage({id: 'MESSAGES.NO_RECIPIENTS_DESCRIPTION'})}
              </div>
            </div>
          )}

          {!isLoading && !hasLoadError && !!availableUsers.length && selectedUser && (
            <div>
              <div className='card card-flush border border-gray-200 mb-5'>
                <div className='card-header min-h-50px px-5'>
                  <div className='card-title flex-column align-items-start'>
                    <span className='fw-bolder text-gray-900'>{selectedUser.fullName}</span>
                    <span className='text-muted fs-7'>{selectedUser.email}</span>
                  </div>
                </div>

                <div className='card-body px-5 py-4 d-flex flex-column gap-4'>
                  {isConversationLoading && (
                    <div className='text-center text-muted py-8'>
                      {intl.formatMessage({id: 'MESSAGES.LOADING'})}
                    </div>
                  )}

                  {!conversation.length && !isConversationLoading && (
                    <div className='text-center text-muted py-8'>
                      {intl.formatMessage({id: 'MESSAGES.EMPTY_CONVERSATION'})}
                    </div>
                  )}

                  {conversation.map((message) => {
                    const isOwnMessage = message.senderId === profile?.id

                    return (
                      <div
                        key={message.id}
                        className={clsx('d-flex', {
                          'justify-content-end': isOwnMessage,
                          'justify-content-start': !isOwnMessage,
                        })}
                      >
                        <div
                          className={clsx('rounded px-4 py-3 mw-350px', {
                            'bg-light-primary text-gray-900': isOwnMessage,
                            'bg-light-info text-gray-800': !isOwnMessage,
                          })}
                        >
                          <div className='fs-6'>{message.body}</div>
                          <div className='fs-8 text-muted mt-2'>{formatTimestamp(message.createdAt)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {sendMessageMutation.isError && (
                <div className='alert alert-danger py-3'>{sendError ?? intl.formatMessage({id: 'MESSAGES.SEND_ERROR'})}</div>
              )}
            </div>
          )}
        </div>
      </div>

      <form
        className='card-footer pt-4'
        id={isDrawer ? 'kt_drawer_chat_messenger_footer' : 'kt_chat_messenger_footer'}
        onSubmit={handleSubmit}
      >
        <textarea
          className='form-control form-control-flush mb-3'
          rows={3}
          data-kt-element='input'
          placeholder={intl.formatMessage({id: 'MESSAGES.INPUT_PLACEHOLDER'})}
          disabled={!selectedUserId || isLoading || isSending}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            if (sendSuccess) {
              setSendSuccess(null)
            }
            if (sendError) {
              setSendError(null)
            }
          }}
        ></textarea>

        {sendSuccess && <div className='alert alert-success py-3 mb-3'>{sendSuccess}</div>}
        {!sendMessageMutation.isError && sendError && (
          <div className='alert alert-danger py-3 mb-3'>{sendError}</div>
        )}

        <div className='d-flex justify-content-end'>
          <button
            className='btn btn-primary'
            type='submit'
            data-kt-element='send'
            disabled={!selectedUserId || !draft.trim() || isLoading || isSending}
          >
            {isSending
              ? intl.formatMessage({id: 'MESSAGES.SENDING'})
              : intl.formatMessage({id: 'MESSAGES.SEND'})}
          </button>
        </div>
      </form>
    </div>
  )
}

export {ChatInner}
