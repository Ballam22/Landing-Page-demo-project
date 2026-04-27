import {useEffect} from 'react'
import {useIntl} from 'react-intl'
import {CategoryFormValues} from '../model/Category'
import {CategoryModalForm} from './CategoryModalForm'

type CategoryModalProps = {
  isOpen: boolean
  mode: 'add' | 'edit'
  initialValues: CategoryFormValues
  categoryId: string | undefined
  onClose: () => void
}

export function CategoryModal({isOpen, mode, initialValues, categoryId, onClose}: CategoryModalProps) {
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

  if (!isOpen) return null

  const title =
    mode === 'add'
      ? intl.formatMessage({id: 'CATEGORY_MANAGEMENT.ADD_CATEGORY'})
      : intl.formatMessage({id: 'CATEGORY_MANAGEMENT.EDIT_CATEGORY'})

  return (
    <>
      <div
        className='modal fade show d-block'
        tabIndex={-1}
        role='dialog'
        aria-modal='true'
        style={{zIndex: 1055}}
      >
        <div className='modal-dialog modal-dialog-centered mw-650px'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h2 className='fw-bolder'>{title}</h2>
              <button
                className='btn btn-icon btn-sm btn-active-icon-primary'
                onClick={onClose}
                aria-label='Close'
              >
                <i className='ki-duotone ki-cross fs-1'>
                  <span className='path1' />
                  <span className='path2' />
                </i>
              </button>
            </div>
            <div className='modal-body scroll-y mx-5 mx-xl-15 my-7'>
              <CategoryModalForm
                mode={mode}
                initialValues={initialValues}
                categoryId={categoryId}
                onClose={onClose}
              />
            </div>
          </div>
        </div>
      </div>
      <div className='modal-backdrop fade show' style={{zIndex: 1054}} onClick={onClose} />
    </>
  )
}
