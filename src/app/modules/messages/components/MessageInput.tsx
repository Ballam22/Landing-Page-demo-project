import {FC, KeyboardEvent, useState} from 'react'
import {useIntl} from 'react-intl'

type Props = {
  onSend: (body: string) => Promise<void>
  disabled?: boolean
}

const MessageInput: FC<Props> = ({onSend, disabled}) => {
  const intl = useIntl()
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSend = !sending && !disabled && value.trim().length > 0

  const handleSubmit = async () => {
    const body = value.trim()
    if (!body || sending || disabled) return
    setSending(true)
    setError(null)
    try {
      await onSend(body)
      setValue('')
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : intl.formatMessage({id: 'MESSAGES.SEND_ERROR'})
      )
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className='border-top border-gray-200 p-4'>
      {error && <div className='alert alert-danger py-2 mb-3 fs-7'>{error}</div>}
      <textarea
        className='form-control form-control-flush mb-3'
        rows={2}
        placeholder={intl.formatMessage({id: 'MESSAGES.INPUT_PLACEHOLDER'})}
        value={value}
        disabled={disabled || sending}
        onChange={(e) => {
          setValue(e.target.value)
          if (error) setError(null)
        }}
        onKeyDown={handleKeyDown}
      />
      <div className='d-flex justify-content-end'>
        <button
          type='button'
          className='btn btn-primary btn-sm'
          disabled={!canSend}
          onClick={handleSubmit}
        >
          {sending ? (
            <>
              <span className='spinner-border spinner-border-sm me-2' />
              {intl.formatMessage({id: 'MESSAGES.SENDING'})}
            </>
          ) : (
            intl.formatMessage({id: 'MESSAGES.SEND'})
          )}
        </button>
      </div>
    </div>
  )
}

export {MessageInput}
