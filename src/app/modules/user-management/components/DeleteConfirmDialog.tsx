import {FC, useEffect} from 'react'
import {useIntl} from 'react-intl'

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName: string
}

const DeleteConfirmDialog: FC<Props> = ({isOpen, onClose, onConfirm, userName}) => {
  const intl = useIntl()

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div
        className='modal fade show d-block'
        role='dialog'
        tabIndex={-1}
        aria-modal='true'
      >
        <div className='modal-dialog modal-dialog-centered mw-400px'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h2 className='fw-bolder'>
                {intl.formatMessage({id: 'USER_MANAGEMENT.DELETE_USER'})}
              </h2>
              <button
                type='button'
                className='btn btn-icon btn-sm btn-active-icon-primary'
                onClick={onClose}
              >
                <i className='ki-duotone ki-cross fs-1'>
                  <span className='path1'></span>
                  <span className='path2'></span>
                </i>
              </button>
            </div>
            <div className='modal-body py-7 px-9'>
              <p className='text-gray-700 fs-6'>
                {intl.formatMessage(
                  {id: 'USER_MANAGEMENT.DELETE_CONFIRM'},
                  {name: <strong>{userName}</strong>}
                )}
              </p>
            </div>
            <div className='modal-footer'>
              <button
                type='button'
                className='btn btn-light me-3'
                onClick={onClose}
              >
                {intl.formatMessage({id: 'USER_MANAGEMENT.CANCEL'})}
              </button>
              <button
                type='button'
                className='btn btn-danger'
                onClick={onConfirm}
              >
                {intl.formatMessage({id: 'USER_MANAGEMENT.CONFIRM'})}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className='modal-backdrop fade show'></div>
    </>
  )
}

export {DeleteConfirmDialog}
