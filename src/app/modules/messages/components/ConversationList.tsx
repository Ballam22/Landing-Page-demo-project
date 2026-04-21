import {FC} from 'react'
import {useIntl} from 'react-intl'
import {KTIcon} from '../../../../_metronic/helpers'
import {ConversationSummary} from '../model/Message'
import {User} from '../../user-management/model/User'
import {ConversationItem} from './ConversationItem'

type Props = {
  conversations: ConversationSummary[]
  users: User[]
  selectedUserId: string | null
  onSelect: (userId: string) => void
  onNewConversation: () => void
  isLoading: boolean
}

const ConversationList: FC<Props> = ({
  conversations,
  users,
  selectedUserId,
  onSelect,
  onNewConversation,
  isLoading,
}) => {
  const intl = useIntl()

  return (
    <div
      className='d-flex flex-column border-end border-gray-200 h-100'
      style={{minWidth: 280, width: 280}}
    >
      <div className='d-flex align-items-center justify-content-between px-4 py-4 border-bottom border-gray-200'>
        <span className='fw-bolder text-gray-900 fs-5'>
          {intl.formatMessage({id: 'MESSAGES.PAGE_TITLE'})}
        </span>
        <button
          type='button'
          className='btn btn-sm btn-light-primary d-flex align-items-center gap-1'
          onClick={onNewConversation}
        >
          <KTIcon iconName='plus' className='fs-5' />
          {intl.formatMessage({id: 'MESSAGES.NEW_MESSAGE'})}
        </button>
      </div>

      <div className='flex-grow-1 overflow-y-auto'>
        {isLoading && (
          <div className='d-flex align-items-center justify-content-center py-10 text-muted'>
            <span className='spinner-border spinner-border-sm me-2' />
            {intl.formatMessage({id: 'MESSAGES.LOADING'})}
          </div>
        )}

        {!isLoading && conversations.length === 0 && (
          <div className='d-flex flex-column align-items-center justify-content-center py-10 px-4 text-center'>
            <KTIcon iconName='message-text-2' className='fs-2x text-muted mb-3' />
            <div className='fw-bolder text-gray-800 fs-6 mb-1'>
              {intl.formatMessage({id: 'MESSAGES.EMPTY_STATE_TITLE'})}
            </div>
            <div className='text-muted fs-7'>
              {intl.formatMessage({id: 'MESSAGES.EMPTY_STATE_HINT'})}
            </div>
          </div>
        )}

        {!isLoading &&
          conversations.map((summary) => {
            const user = users.find((u) => u.id === summary.userId)
            if (!user) return null
            return (
              <ConversationItem
                key={summary.userId}
                summary={summary}
                user={user}
                isSelected={selectedUserId === summary.userId}
                onClick={() => onSelect(summary.userId)}
              />
            )
          })}
      </div>
    </div>
  )
}

export {ConversationList}
