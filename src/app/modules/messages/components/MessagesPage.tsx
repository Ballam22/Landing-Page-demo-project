import {useState} from 'react'
import {useIntl} from 'react-intl'
import {useAuth} from '../../auth'
import {useCurrentProfile} from '../../../hooks/useCurrentProfile'
import {useUserController} from '../../user-management/controller/useUserController'
import {useConversations, useMarkAsRead} from '../controller/useMessageController'
import {ConversationList} from './ConversationList'
import {MessageThread} from './MessageThread'
import '../../blog-management/BlogManagement.css'

const MessagesPage = () => {
  const intl = useIntl()
  const {currentUser} = useAuth()
  const {data: profile} = useCurrentProfile(currentUser?.email)
  const currentUserId = profile?.id ?? null

  const {users} = useUserController()
  const {
    data: conversationsData,
    isLoading,
  } = useConversations(currentUserId ?? undefined)

  const conversations = conversationsData?.conversations ?? []
  const markAsRead = useMarkAsRead()

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [pickerOpen, setPicker] = useState(false)

  const activeUsersExcludingSelf = users.filter(
    (u) => u.status === 'Active' && u.id !== currentUserId
  )

  const handleSelect = (userId: string) => {
    setSelectedUserId(userId)
    if (currentUserId) {
      markAsRead.mutate({userId: currentUserId, otherUserId: userId})
    }
  }

  const selectedUser = activeUsersExcludingSelf.find((u) => u.id === selectedUserId) ?? null
  const unreadCount = conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0)

  return (
    <div className='blog-management-shell'>
      <div className='blog-management-header'>
        <div className='blog-management-header-content'>
          <div>
            <div className='blog-management-kicker'>
              {intl.formatMessage({id: 'MESSAGES.HEADER_KICKER'})}
            </div>
            <h1 className='blog-management-title'>
              {intl.formatMessage({id: 'MESSAGES.PAGE_TITLE'})}
            </h1>
            <p className='blog-management-subtitle'>
              {intl.formatMessage({id: 'MESSAGES.SUBTITLE'})}
            </p>
          </div>
          <button type='button' className='btn btn-lg' onClick={() => setPicker(true)}>
            {intl.formatMessage({id: 'MESSAGES.NEW_MESSAGE'})}
          </button>
        </div>
      </div>

      <div className='blog-management-stats'>
        <div className='blog-management-stat'>
          <div className='blog-management-stat-label'>
            {intl.formatMessage({id: 'MESSAGES.STAT_CONVERSATIONS'})}
          </div>
          <div className='blog-management-stat-value'>{conversations.length}</div>
          <div className='blog-management-stat-accent info' />
        </div>
        <div className='blog-management-stat'>
          <div className='blog-management-stat-label'>
            {intl.formatMessage({id: 'MESSAGES.STAT_RECIPIENTS'})}
          </div>
          <div className='blog-management-stat-value'>{activeUsersExcludingSelf.length}</div>
          <div className='blog-management-stat-accent success' />
        </div>
        <div className='blog-management-stat'>
          <div className='blog-management-stat-label'>
            {intl.formatMessage({id: 'MESSAGES.STAT_UNREAD'})}
          </div>
          <div className='blog-management-stat-value'>{unreadCount}</div>
          <div className='blog-management-stat-accent warning' />
        </div>
        <div className='blog-management-stat'>
          <div className='blog-management-stat-label'>
            {intl.formatMessage({id: 'MESSAGES.STAT_SELECTED'})}
          </div>
          <div className='blog-management-stat-value'>{selectedUser ? 1 : 0}</div>
          <div className='blog-management-stat-accent danger' />
        </div>
      </div>

      <div className='card blog-management-card overflow-hidden'>
        <div className='d-flex h-100 messages-polished-shell'>
          <ConversationList
            conversations={conversations}
            users={activeUsersExcludingSelf}
            selectedUserId={selectedUserId}
            onSelect={handleSelect}
            onNewConversation={() => setPicker(true)}
            isLoading={isLoading}
          />

          <div className='flex-grow-1 d-flex flex-column'>
            {!selectedUser ? (
              <div className='flex-grow-1 d-flex align-items-center justify-content-center text-muted'>
                {intl.formatMessage({id: 'MESSAGES.EMPTY_THREAD'})}
              </div>
            ) : (
              <MessageThread
                currentUserId={currentUserId!}
                otherUser={selectedUser}
                allUsers={activeUsersExcludingSelf}
              />
            )}
          </div>
        </div>
      </div>

      {pickerOpen && (
        <div
          className='modal fade show d-block'
          style={{backgroundColor: 'rgba(0,0,0,0.5)'}}
          onClick={() => setPicker(false)}
        >
          <div className='modal-dialog modal-dialog-centered' onClick={(e) => e.stopPropagation()}>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>
                  {intl.formatMessage({id: 'MESSAGES.SELECT_RECIPIENT'})}
                </h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setPicker(false)}
                />
              </div>
              <div className='modal-body p-0'>
                {activeUsersExcludingSelf.length === 0 ? (
                  <div className='text-center text-muted py-6'>
                    {intl.formatMessage({id: 'MESSAGES.NO_RECIPIENTS'})}
                  </div>
                ) : (
                  activeUsersExcludingSelf.map((user) => (
                    <button
                      key={user.id}
                      type='button'
                      className='btn btn-flush d-flex align-items-center gap-3 w-100 text-start px-5 py-3 border-bottom border-gray-200'
                      onClick={() => {
                        handleSelect(user.id)
                        setPicker(false)
                      }}
                    >
                      <span className='symbol symbol-40px'>
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className='symbol-label rounded-circle'
                          />
                        ) : (
                          <span className='symbol-label bg-light-primary text-primary fw-bold fs-6'>
                            {user.fullName
                              .split(' ')
                              .map((p) => p[0] ?? '')
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </span>
                        )}
                      </span>
                      <div>
                        <div className='fw-bold text-gray-900'>{user.fullName}</div>
                        <div className='text-muted fs-7'>{user.email}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessagesPage
