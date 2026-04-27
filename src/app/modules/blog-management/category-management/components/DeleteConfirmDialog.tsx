import {useEffect} from 'react'
import {useIntl} from 'react-intl'
import {Category} from '../model/Category'

type CategoryDeleteConfirmDialogProps = {
  isOpen: boolean
  category: Category | null
  onConfirm: () => void
  onCancel: () => void
  errorMessage: string | null
}

export function DeleteConfirmDialog({
  isOpen,
  category,
  onConfirm,
  onCancel,
  errorMessage,
}: CategoryDeleteConfirmDialogProps) {
  const intl = useIntl()

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [isOpen])

  if (!isOpen || !category) return null

  return (
    <>
      <div
        className='modal fade show d-block'
        tabIndex={-1}
        role='dialog'
        aria-modal='true'
        style={{zIndex: 1055}}
      >
        <div className='modal-dialog modal-dialog-centered mw-500px'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h2 className='fw-bolder'>
                {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.DELETE_TITLE'})}
              </h2>
            </div>
            <div className='modal-body'>
              <p>
                {intl.formatMessage(
                  {id: 'CATEGORY_MANAGEMENT.DELETE_CONFIRM'},
                  {name: category.name}
                )}
              </p>
              {errorMessage && (
                <div className='alert alert-danger py-3'>{errorMessage}</div>
              )}
            </div>
            <div className='modal-footer'>
              <button className='btn btn-light' onClick={onCancel}>
                {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.BTN_CANCEL'})}
              </button>
              {!errorMessage && (
                <button className='btn btn-danger' onClick={onConfirm}>
                  {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.BTN_DELETE'})}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className='modal-backdrop fade show' style={{zIndex: 1054}} onClick={onCancel} />
    </>
  )
}
