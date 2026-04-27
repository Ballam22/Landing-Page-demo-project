import {FC, useState} from 'react'
import {useIntl} from 'react-intl'
import {useAuth} from '../../auth'
import {deleteUserAccount, exportUserData} from '../service/gdprService'
import './DeleteAccountModal.scss'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * GDPR Article 17 - Right to Erasure (Account Deletion)
 * Secure user-initiated account deletion with confirmation flow
 */
export const DeleteAccountModal: FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const intl = useIntl()
  const { currentUser, logout } = useAuth()
  const [step, setStep] = useState<'confirm' | 'reason' | 'final' | 'processing' | 'done'>('confirm')
  const [reason, setReason] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [exportData, setExportData] = useState<string | null>(null)

  if (!isOpen || !currentUser) return null

  const handleInitialConfirm = () => {
    setStep('reason')
  }

  const handleReasonSubmit = () => {
    setStep('final')
  }

  const handleExportData = async () => {
    setIsLoading(true)
    setError('')

    try {
      const data = await exportUserData(currentUser.id)
      setExportData(data)

      // Create download link
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `my-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (err) {
      setError('Failed to export your data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalDelete = async () => {
    if (confirmation !== 'DELETE') {
      setError('Please type "DELETE" to confirm.')
      return
    }

    setIsLoading(true)
    setError('')
    setStep('processing')

    try {
      const result = await deleteUserAccount(currentUser.id, reason)

      if (result.success) {
        setStep('done')
        // Auto-logout after successful deletion
        setTimeout(() => {
          logout()
        }, 3000)
      } else {
        setError(result.message)
        setStep('final')
      }
    } catch (err) {
      setError('Account deletion failed. Please contact support.')
      setStep('final')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (step === 'done') {
      logout()
    } else {
      setStep('confirm')
      setReason('')
      setConfirmation('')
      setError('')
      setExportData(null)
      onClose()
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'confirm':
        return (
          <div className='delete-account-step'>
            <div className='warning-icon'>
              <i className='ki-duotone ki-information-5 fs-3x text-danger'>
                <span className='path1'></span>
                <span className='path2'></span>
                <span className='path3'></span>
              </i>
            </div>

            <h3 className='text-center mb-4'>
              {intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.TITLE' })}
            </h3>

            <div className='alert alert-danger'>
              <strong>{intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.WARNING' })}</strong>
              <ul className='mb-0 mt-2'>
                <li>{intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.WARNING_1' })}</li>
                <li>{intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.WARNING_2' })}</li>
                <li>{intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.WARNING_3' })}</li>
                <li>{intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.WARNING_4' })}</li>
              </ul>
            </div>

            <p className='text-muted mb-4'>
              {intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.CONFIRM_TEXT' })}
            </p>

            <div className='d-flex gap-3'>
              <button
                type='button'
                className='btn btn-light flex-fill'
                onClick={handleClose}
              >
                {intl.formatMessage({ id: 'GDPR.CANCEL' })}
              </button>
              <button
                type='button'
                className='btn btn-danger flex-fill'
                onClick={handleInitialConfirm}
              >
                {intl.formatMessage({ id: 'GDPR.CONTINUE' })}
              </button>
            </div>
          </div>
        )

      case 'reason':
        return (
          <div className='delete-account-step'>
            <h4 className='text-center mb-4'>
              {intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.REASON_TITLE' })}
            </h4>

            <p className='text-muted mb-3'>
              {intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.REASON_HELP' })}
            </p>

            <div className='mb-4'>
              <textarea
                className='form-control'
                rows={4}
                placeholder={intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.REASON_PLACEHOLDER' })}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className='d-flex gap-3'>
              <button
                type='button'
                className='btn btn-light flex-fill'
                onClick={() => setStep('confirm')}
              >
                {intl.formatMessage({ id: 'GDPR.BACK' })}
              </button>
              <button
                type='button'
                className='btn btn-primary flex-fill'
                onClick={handleReasonSubmit}
              >
                {intl.formatMessage({ id: 'GDPR.CONTINUE' })}
              </button>
            </div>
          </div>
        )

      case 'final':
        return (
          <div className='delete-account-step'>
            <h4 className='text-center mb-4'>
              {intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.FINAL_TITLE' })}
            </h4>

            <div className='alert alert-info mb-4'>
              <strong>{intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.EXPORT_REMINDER' })}</strong>
              <p className='mb-2'>
                {intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.EXPORT_INFO' })}
              </p>
              <button
                type='button'
                className='btn btn-sm btn-outline-primary'
                onClick={handleExportData}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2'></span>
                    {intl.formatMessage({ id: 'GDPR.EXPORTING' })}
                  </>
                ) : (
                  intl.formatMessage({ id: 'GDPR.EXPORT_DATA' })
                )}
              </button>
            </div>

            <div className='mb-4'>
              <label className='form-label fw-bold'>
                {intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.CONFIRMATION_LABEL' })}
              </label>
              <input
                type='text'
                className='form-control'
                placeholder='DELETE'
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
              />
              <div className='form-text'>
                {intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.CONFIRMATION_HELP' })}
              </div>
            </div>

            {error && (
              <div className='alert alert-danger mb-4'>
                {error}
              </div>
            )}

            <div className='d-flex gap-3'>
              <button
                type='button'
                className='btn btn-light flex-fill'
                onClick={() => setStep('reason')}
              >
                {intl.formatMessage({ id: 'GDPR.BACK' })}
              </button>
              <button
                type='button'
                className='btn btn-danger flex-fill'
                onClick={handleFinalDelete}
                disabled={confirmation !== 'DELETE' || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2'></span>
                    {intl.formatMessage({ id: 'GDPR.DELETING' })}
                  </>
                ) : (
                  intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.CONFIRM_BUTTON' })
                )}
              </button>
            </div>
          </div>
        )

      case 'processing':
        return (
          <div className='delete-account-step text-center'>
            <div className='processing-icon mb-4'>
              <span className='spinner-border spinner-border-lg text-danger'></span>
            </div>
            <h4>{intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.PROCESSING' })}</h4>
            <p className='text-muted'>
              {intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.PROCESSING_INFO' })}
            </p>
          </div>
        )

      case 'done':
        return (
          <div className='delete-account-step text-center'>
            <div className='success-icon mb-4'>
              <i className='ki-duotone ki-check-circle fs-3x text-success'>
                <span className='path1'></span>
                <span className='path2'></span>
              </i>
            </div>
            <h4 className='text-success mb-3'>
              {intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.SUCCESS_TITLE' })}
            </h4>
            <p className='text-muted mb-4'>
              {intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.SUCCESS_MESSAGE' })}
            </p>
            <p className='text-muted small'>
              {intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.SUCCESS_INFO' })}
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <div className='modal fade show d-block' role='dialog' tabIndex={-1}>
        <div className='modal-dialog modal-dialog-centered modal-lg'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>
                {intl.formatMessage({ id: 'GDPR.DELETE_ACCOUNT.MODAL_TITLE' })}
              </h5>
              <button
                type='button'
                className='btn-close'
                onClick={handleClose}
                disabled={step === 'processing'}
              ></button>
            </div>
            <div className='modal-body'>
              {renderStep()}
            </div>
          </div>
        </div>
      </div>
      <div className='modal-backdrop fade show'></div>
    </>
  )
}
