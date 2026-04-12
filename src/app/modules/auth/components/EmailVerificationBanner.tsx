import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useAuth } from '../core/Auth'

export function EmailVerificationBanner() {
  const { currentUser, emailVerificationDismissed, dismissEmailVerification } = useAuth()
  const [sent, setSent] = useState(false)

  if (!currentUser || currentUser.emailVerified || emailVerificationDismissed) {
    return null
  }

  const handleResend = () => {
    // No-op mock — in production this would send an email
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <div className='alert alert-warning d-flex align-items-center p-5 mb-10'>
      <span className='ki-duotone ki-information fs-2 me-3'>
        <span className='path1'></span>
        <span className='path2'></span>
        <span className='path3'></span>
      </span>
      <div className='d-flex flex-column flex-grow-1'>
        <span>
          <FormattedMessage id='AUTH.VERIFY.BANNER_MESSAGE' />
        </span>
        {sent && (
          <span className='text-success mt-1 fs-7'>
            <FormattedMessage id='AUTH.VERIFY.SENT' />
          </span>
        )}
      </div>
      <div className='d-flex gap-3'>
        <button
          type='button'
          className='btn btn-sm btn-warning'
          onClick={handleResend}
          disabled={sent}
        >
          <FormattedMessage id='AUTH.VERIFY.BANNER_ACTION' />
        </button>
        <button
          type='button'
          className='btn btn-sm btn-light-warning'
          onClick={dismissEmailVerification}
        >
          <FormattedMessage id='AUTH.VERIFY.BANNER_DISMISS' />
        </button>
      </div>
    </div>
  )
}
