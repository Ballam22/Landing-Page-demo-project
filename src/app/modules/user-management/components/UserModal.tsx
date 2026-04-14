import {FC, useEffect} from 'react'
import {useIntl} from 'react-intl'
import {User, UserFormValues} from '../_models'
import {UserModalForm} from './UserModalForm'
import {useUserManagement} from '../hooks/useUserManagement'

type Props = {
  isOpen: boolean
  onClose: () => void
  initialValues: UserFormValues
  mode: 'add' | 'edit'
  userId?: string
}

const UserModal: FC<Props> = ({isOpen, onClose, initialValues, mode, userId}) => {
  const intl = useIntl()
  const {users} = useUserManagement()

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [isOpen])

  if (!isOpen) return null

  const existingEmails = users
    .filter((u: User) => u.id !== userId)
    .map((u: User) => u.email)

  const title =
    mode === 'add'
      ? intl.formatMessage({id: 'USER_MANAGEMENT.ADD_USER'})
      : intl.formatMessage({id: 'USER_MANAGEMENT.EDIT_USER'})

  return (
    <>
      <div
        className='modal fade show d-block'
        id='kt_modal_user'
        role='dialog'
        tabIndex={-1}
        aria-modal='true'
      >
        <div className='modal-dialog modal-dialog-centered mw-650px'>
          <div className='modal-content'>
            {/* Header */}
            <div className='modal-header' id='kt_modal_user_header'>
              <h2 className='fw-bolder'>{title}</h2>
              <button
                type='button'
                className='btn btn-icon btn-sm btn-active-icon-primary'
                onClick={onClose}
                aria-label='Close'
              >
                <i className='ki-duotone ki-cross fs-1'>
                  <span className='path1'></span>
                  <span className='path2'></span>
                </i>
              </button>
            </div>
            {/* Body */}
            <div className='modal-body py-7'>
              <UserModalForm
                mode={mode}
                userId={userId}
                initialValues={initialValues}
                existingEmails={existingEmails}
                onClose={onClose}
              />
            </div>
          </div>
        </div>
      </div>
      <div className='modal-backdrop fade show'></div>
    </>
  )
}

export {UserModal}
